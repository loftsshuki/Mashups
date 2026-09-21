-- Private creator recipes share the project identity used by processing/review.
begin;
alter table public.green_projects
  alter column left_track_id drop not null,
  alter column right_track_id drop not null,
  add column title text not null default 'Untitled mashup' check (char_length(title) between 1 and 120),
  add column source_mode text not null default 'catalog' check (source_mode in ('prototype', 'catalog')),
  add column prototype_sources jsonb,
  add column intensity smallint not null default 82 check (intensity between 55 and 100),
  add column selected_arrangement text check (selected_arrangement in ('vocal-a-over-b', 'vocal-b-over-a', 'drop-swap')),
  add column revision integer not null default 1 check (revision > 0),
  add constraint green_project_source_shape check (
    (source_mode = 'catalog' and left_track_id is not null and right_track_id is not null and prototype_sources is null)
    or
    (source_mode = 'prototype' and left_track_id is null and right_track_id is null
      and prototype_sources is not null and jsonb_typeof(prototype_sources) = 'object'
      and prototype_sources ?& array['leftId', 'rightId', 'catalogVersion']
      and jsonb_typeof(prototype_sources->'leftId') = 'string'
      and jsonb_typeof(prototype_sources->'rightId') = 'string'
      and jsonb_typeof(prototype_sources->'catalogVersion') = 'string'
      and char_length(prototype_sources->>'leftId') between 1 and 80
      and char_length(prototype_sources->>'rightId') between 1 and 80
      and char_length(prototype_sources->>'catalogVersion') between 1 and 80
      and prototype_sources->>'leftId' <> prototype_sources->>'rightId')
  );
create index green_projects_creator_updated_idx on public.green_projects(creator_id, updated_at desc, id);

-- Only the server calls this after validating identity and the signed prototype
-- manifest. Catalog sources are also rechecked inside the database transaction.
create function public.save_green_project(
  p_id uuid, p_creator_id uuid, p_title text, p_sources jsonb,
  p_intensity smallint, p_selected_arrangement text, p_expected_revision integer
) returns public.green_projects language plpgsql security invoker set search_path = '' as $$
declare
  existing public.green_projects%rowtype;
  result public.green_projects%rowtype;
  left_id uuid;
  right_id uuid;
begin
  if p_id is null or p_creator_id is null or p_expected_revision is null or p_expected_revision not between 0 and 2147483646 then
    raise exception using errcode = '22023', message = 'Project identity and revision are required.';
  end if;
  if p_title is null or char_length(btrim(p_title)) not between 1 and 120
    or p_intensity is null or p_intensity not between 55 and 100
    or (p_selected_arrangement is not null and p_selected_arrangement not in ('vocal-a-over-b', 'vocal-b-over-a', 'drop-swap'))
    or p_sources is null or (p_sources->>'kind') is null or p_sources->>'kind' not in ('prototype', 'catalog') then
    raise exception using errcode = '22023', message = 'Invalid project recipe.';
  end if;

  -- Serialize creates as well as updates, including simultaneous first saves.
  perform pg_advisory_xact_lock(hashtextextended(p_id::text, 0));
  select * into existing from public.green_projects where id = p_id for update;
  if found then
    if existing.creator_id is distinct from p_creator_id then
      raise exception using errcode = '42501', message = 'Project is unavailable.';
    end if;
    if existing.status <> 'draft'
      or exists (select 1 from public.green_render_candidates where project_id = p_id) then
      raise exception using errcode = '40001', message = 'Project changed or has reviewed renders. Save a new copy.';
    end if;
    if existing.revision <> p_expected_revision then
      -- An identical retry after a lost HTTP receipt returns the original save.
      -- It never increments the revision or overwrites a newer/different recipe.
      if existing.revision = p_expected_revision + 1 and existing.title = btrim(p_title)
        and existing.intensity = p_intensity and existing.selected_arrangement is not distinct from p_selected_arrangement
        and existing.source_mode = p_sources->>'kind'
        and ((existing.source_mode = 'prototype' and existing.prototype_sources = p_sources - 'kind')
          or (existing.source_mode = 'catalog' and existing.left_track_id = (p_sources->>'leftId')::uuid and existing.right_track_id = (p_sources->>'rightId')::uuid)) then
        return existing;
      end if;
      raise exception using errcode = '40001', message = 'Project changed elsewhere. Save a new copy.';
    end if;
  elsif p_expected_revision <> 0 then
    raise exception using errcode = '40001', message = 'Project no longer matches this revision.';
  end if;

  if p_sources->>'kind' = 'catalog' then
    left_id := (p_sources->>'leftId')::uuid;
    right_id := (p_sources->>'rightId')::uuid;
    if left_id is null or right_id is null or left_id = right_id then
      raise exception using errcode = '22023', message = 'Two different catalog sources are required.';
    end if;
    -- Use the same lock order as catalog approval, and hold grants until commit.
    perform id from public.green_catalog_tracks where id in (left_id, right_id) order by id for share;
    perform id from public.green_rights_grants where track_id in (left_id, right_id) order by track_id for share;
    if (select count(*) from public.green_catalog_tracks t where t.id in (left_id, right_id)
      and t.status = 'green' and t.rights_status = 'verified' and t.quality_status = 'passed'
      and public.green_track_has_active_grant(t.id)) <> 2 then
      raise exception using errcode = 'P0001', message = 'One or both catalog sources are unavailable.';
    end if;
  end if;

  insert into public.green_projects(id, creator_id, title, source_mode, left_track_id, right_track_id,
    prototype_sources, intensity, selected_arrangement, revision)
  values (p_id, p_creator_id, btrim(p_title), p_sources->>'kind', left_id, right_id,
    case when p_sources->>'kind' = 'prototype' then p_sources - 'kind' else null end,
    p_intensity, p_selected_arrangement, 1)
  on conflict (id) do update set title = excluded.title, source_mode = excluded.source_mode,
    left_track_id = excluded.left_track_id, right_track_id = excluded.right_track_id,
    prototype_sources = excluded.prototype_sources, intensity = excluded.intensity,
    selected_arrangement = excluded.selected_arrangement, revision = existing.revision + 1, updated_at = now()
  returning * into result;
  return result;
end;
$$;
revoke all on function public.save_green_project(uuid, uuid, text, jsonb, smallint, text, integer) from public, anon, authenticated;
grant execute on function public.save_green_project(uuid, uuid, text, jsonb, smallint, text, integer) to service_role;
commit;
