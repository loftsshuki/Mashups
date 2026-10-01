-- Canonical Green Room publication uses green_projects.id as the public identity.
begin;

alter table public.green_projects
  add column if not exists published_at timestamptz;

-- Align durable render candidates with the shared contract IDs used by projects.
alter table public.green_render_candidates
  drop constraint if exists green_render_candidates_arrangement_check;
update public.green_render_candidates
set arrangement = case arrangement
  when 'vocal_a_beat_b' then 'vocal-a-over-b'
  when 'vocal_b_beat_a' then 'vocal-b-over-a'
  when 'drop_swap' then 'drop-swap'
  else arrangement
end;
alter table public.green_render_candidates
  add constraint green_render_candidates_arrangement_check
  check (arrangement in ('vocal-a-over-b', 'vocal-b-over-a', 'drop-swap'));

create index if not exists green_projects_published_idx
  on public.green_projects(status, published_at desc)
  where status = 'published';

create or replace function public.publish_green_project(
  p_project_id uuid,
  p_creator_id uuid
) returns public.green_projects
language plpgsql security invoker set search_path = '' as $$
declare
  project_row public.green_projects%rowtype;
  candidate_row public.green_render_candidates%rowtype;
  asset_row public.green_track_assets%rowtype;
  result public.green_projects%rowtype;
begin
  select * into project_row
  from public.green_projects
  where id = p_project_id
  for update;

  if project_row.id is null or project_row.creator_id is distinct from p_creator_id then
    raise exception using errcode = '42501', message = 'Project is unavailable.';
  end if;

  if project_row.source_mode <> 'catalog' then
    raise exception using errcode = 'P0001', message = 'Prototype projects cannot be published.';
  end if;

  if project_row.status = 'published' then
    return project_row;
  end if;

  if project_row.status <> 'ready' or project_row.selected_candidate_id is null
    or project_row.selected_arrangement is null then
    raise exception using errcode = 'P0001', message = 'Project must have a selected ready render before publication.';
  end if;

  select * into candidate_row
  from public.green_render_candidates
  where id = project_row.selected_candidate_id
  for share;

  if candidate_row.id is null or candidate_row.project_id <> project_row.id
    or candidate_row.asset_id is null or candidate_row.quality_status <> 'passed'
    or candidate_row.arrangement <> project_row.selected_arrangement then
    raise exception using errcode = 'P0001', message = 'Selected render is not publication-ready.';
  end if;

  select * into asset_row
  from public.green_track_assets
  where id = candidate_row.asset_id
  for share;

  if asset_row.id is null or asset_row.asset_kind <> 'preview'
    or asset_row.quarantined_at is not null then
    raise exception using errcode = 'P0001', message = 'Selected preview asset is unavailable.';
  end if;

  if (select count(*) from public.green_catalog_tracks t
      where t.id in (project_row.left_track_id, project_row.right_track_id)
        and t.status = 'green'
        and t.rights_status = 'verified'
        and t.quality_status = 'passed'
        and public.green_track_has_active_grant(t.id)) <> 2 then
    raise exception using errcode = 'P0001', message = 'One or both source grants are no longer publishable.';
  end if;

  if not exists (
    select 1
    from public.green_listening_reviews r
    where r.candidate_id = candidate_row.id
      and r.decision = 'keep'
      and r.reviewer_id is distinct from project_row.creator_id
    group by r.candidate_id
    having count(distinct r.reviewer_id) >= 2
  ) then
    raise exception using errcode = 'P0001', message = 'Publication requires two independent keep reviews.';
  end if;

  update public.green_projects
  set status = 'published',
      published_at = coalesce(published_at, now()),
      updated_at = now()
  where id = project_row.id
  returning * into result;

  return result;
end;
$$;

-- Service-only read gate for public HTTP surfaces. Rights are rechecked on every
-- lookup, so a revoked source grant removes playback without deleting history.
create or replace function public.get_green_publication(p_project_id uuid)
returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'id', p.id,
    'title', p.title,
    'creatorId', p.creator_id,
    'parentProjectId', p.parent_project_id,
    'publishedAt', p.published_at,
    'arrangement', p.selected_arrangement,
    'audioAssetId', a.id,
    'durationSeconds', c.duration_seconds,
    'leftSource', jsonb_build_object(
      'id', l.id,
      'slug', l.slug,
      'artistName', l.artist_name,
      'trackTitle', l.track_title
    ),
    'rightSource', jsonb_build_object(
      'id', r.id,
      'slug', r.slug,
      'artistName', r.artist_name,
      'trackTitle', r.track_title
    )
  )
  from public.green_projects p
  join public.green_render_candidates c
    on c.id = p.selected_candidate_id and c.project_id = p.id
  join public.green_track_assets a
    on a.id = c.asset_id
  join public.green_catalog_tracks l
    on l.id = p.left_track_id
  join public.green_catalog_tracks r
    on r.id = p.right_track_id
  where p.id = p_project_id
    and p.status = 'published'
    and p.published_at is not null
    and p.source_mode = 'catalog'
    and c.quality_status = 'passed'
    and c.arrangement = p.selected_arrangement
    and a.asset_kind = 'preview'
    and a.quarantined_at is null
    and l.status = 'green'
    and r.status = 'green'
    and public.green_track_has_active_grant(l.id)
    and public.green_track_has_active_grant(r.id)
  limit 1;
$$;

revoke all on function public.publish_green_project(uuid, uuid),
  public.get_green_publication(uuid)
  from public, anon, authenticated;
grant execute on function public.publish_green_project(uuid, uuid),
  public.get_green_publication(uuid)
  to service_role;

commit;
