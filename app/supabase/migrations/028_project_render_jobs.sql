-- Project-scoped processing and durable candidate completion.
begin;

alter table public.green_processing_jobs
  alter column track_id drop not null,
  add column if not exists project_id uuid references public.green_projects(id) on delete cascade;

-- Any old active render job lacks the project identity required by the current
-- contract. Cancel rather than dispatching ambiguous work after this migration.
update public.green_processing_jobs
set status = 'cancelled',
    error_code = 'PROJECT_SCOPE_REQUIRED',
    error_message = 'Legacy render job cancelled during project-scoped processing migration.',
    completed_at = now(),
    updated_at = now()
where job_type in ('render_candidates', 'render_video')
  and project_id is null
  and status in ('queued', 'running');

alter table public.green_processing_jobs
  drop constraint if exists green_processing_job_subject_shape,
  add constraint green_processing_job_subject_shape check (
    (
      job_type in ('fingerprint', 'analyze', 'separate')
      and track_id is not null
      and project_id is null
    )
    or
    (
      job_type in ('render_candidates', 'render_video')
      and project_id is not null
      and track_id is null
    )
    or
    (
      job_type in ('render_candidates', 'render_video')
      and project_id is null
      and track_id is not null
      and status in ('succeeded', 'failed', 'cancelled')
    )
  );

create index if not exists green_jobs_project_idx
  on public.green_processing_jobs(project_id, created_at desc)
  where project_id is not null;

create or replace function public.queue_green_project_render(
  p_project_id uuid,
  p_creator_id uuid,
  p_provider text
) returns public.green_processing_jobs
language plpgsql security invoker set search_path = '' as $$
declare
  project_row public.green_projects%rowtype;
  result public.green_processing_jobs%rowtype;
  stem_manifest jsonb;
  stem_count integer;
begin
  if p_project_id is null or p_creator_id is null
    or p_provider is null or char_length(btrim(p_provider)) not between 1 and 80 then
    raise exception using errcode = '22023', message = 'Project, creator, and provider are required.';
  end if;

  select * into project_row
  from public.green_projects
  where id = p_project_id
  for update;

  if project_row.id is null or project_row.creator_id is distinct from p_creator_id then
    raise exception using errcode = '42501', message = 'Project is unavailable.';
  end if;
  if project_row.source_mode <> 'catalog' then
    raise exception using errcode = 'P0001', message = 'Real rendering requires approved catalog sources.';
  end if;
  if project_row.status <> 'draft' then
    raise exception using errcode = 'P0001', message = 'Only a draft without reviewed renders can start rendering.';
  end if;
  if exists (
    select 1 from public.green_render_candidates where project_id = project_row.id
  ) then
    raise exception using errcode = 'P0001', message = 'This project already has durable render candidates.';
  end if;

  perform id
  from public.green_catalog_tracks
  where id in (project_row.left_track_id, project_row.right_track_id)
  order by id
  for share;
  perform id
  from public.green_rights_grants
  where track_id in (project_row.left_track_id, project_row.right_track_id)
  order by track_id
  for share;

  if (
    select count(*)
    from public.green_catalog_tracks t
    where t.id in (project_row.left_track_id, project_row.right_track_id)
      and t.status = 'green'
      and t.rights_status = 'verified'
      and t.quality_status = 'passed'
      and public.green_track_has_active_grant(t.id)
  ) <> 2 then
    raise exception using errcode = 'P0001', message = 'One or both catalog sources are unavailable.';
  end if;

  with latest_stems as (
    select distinct on (a.track_id, a.asset_kind)
      a.id,
      a.track_id,
      a.asset_kind
    from public.green_track_assets a
    where a.track_id in (project_row.left_track_id, project_row.right_track_id)
      and a.asset_kind in ('stem_vocal', 'stem_drums', 'stem_bass', 'stem_other')
      and a.access_level = 'private'
      and a.quarantined_at is null
    order by a.track_id, a.asset_kind, a.created_at desc
  )
  select
    count(*)::integer,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'assetId', id,
          'role',
            case
              when track_id = project_row.left_track_id then 'left:'
              else 'right:'
            end || asset_kind
        )
        order by track_id, asset_kind
      ),
      '[]'::jsonb
    )
  into stem_count, stem_manifest
  from latest_stems;

  if stem_count <> 8 then
    raise exception using errcode = 'P0001', message = 'Both sources need fresh vocal, drum, bass, and other stems before rendering.';
  end if;

  insert into public.green_processing_jobs(
    track_id,
    project_id,
    job_type,
    provider,
    input
  )
  values (
    null,
    project_row.id,
    'render_candidates',
    btrim(p_provider),
    jsonb_build_object(
      'assets', stem_manifest,
      'arrangements', jsonb_build_array(
        'vocal-a-over-b',
        'vocal-b-over-a',
        'drop-swap'
      )
    )
  )
  returning * into result;

  update public.green_projects
  set status = 'rendering', updated_at = now()
  where id = project_row.id;

  return result;
end;
$$;

create or replace function public.complete_green_project_render(
  p_job_id uuid,
  p_candidates jsonb
) returns public.green_projects
language plpgsql security invoker set search_path = '' as $$
declare
  job_row public.green_processing_jobs%rowtype;
  project_row public.green_projects%rowtype;
  result public.green_projects%rowtype;
  candidate jsonb;
  arrangement_name text;
  blob_url_value text;
  blob_pathname_value text;
  content_type_value text;
  sha256_value text;
  byte_size_value bigint;
  duration_value numeric;
  quality_score_value integer;
  quality_status_value text;
  asset_id_value uuid;
begin
  if p_job_id is null or p_candidates is null
    or jsonb_typeof(p_candidates) <> 'array'
    or jsonb_array_length(p_candidates) <> 3 then
    raise exception using errcode = '22023', message = 'Exactly three render candidates are required.';
  end if;

  if (
    select count(distinct value->>'arrangement')
    from jsonb_array_elements(p_candidates)
  ) <> 3
    or exists (
      select 1
      from jsonb_array_elements(p_candidates)
      where value->>'arrangement' not in (
        'vocal-a-over-b',
        'vocal-b-over-a',
        'drop-swap'
      )
    ) then
    raise exception using errcode = '22023', message = 'Render candidates must contain the three canonical arrangements exactly once.';
  end if;

  select * into job_row
  from public.green_processing_jobs
  where id = p_job_id
  for update;

  if job_row.id is null
    or job_row.job_type <> 'render_candidates'
    or job_row.project_id is null
    or job_row.status <> 'running' then
    raise exception using errcode = 'P0001', message = 'Render job is not active.';
  end if;

  select * into project_row
  from public.green_projects
  where id = job_row.project_id
  for update;

  if project_row.id is null
    or project_row.creator_id is null
    or project_row.status <> 'rendering' then
    raise exception using errcode = 'P0001', message = 'Project is not awaiting render candidates.';
  end if;

  for candidate in
    select value from jsonb_array_elements(p_candidates)
  loop
    arrangement_name := candidate->>'arrangement';
    blob_url_value := candidate->'asset'->>'blobUrl';
    blob_pathname_value := candidate->'asset'->>'blobPathname';
    content_type_value := candidate->'asset'->>'contentType';
    sha256_value := nullif(candidate->'asset'->>'sha256', '');
    byte_size_value := nullif(candidate->'asset'->>'byteSize', '')::bigint;
    duration_value := nullif(candidate->>'durationSeconds', '')::numeric;
    quality_score_value := nullif(candidate->>'qualityScore', '')::integer;
    quality_status_value := candidate->>'qualityStatus';

    if blob_url_value is null or blob_url_value !~ '^https://'
      or blob_pathname_value is null or blob_pathname_value !~ '^green-room/'
      or content_type_value is null or content_type_value !~ '^audio/'
      or byte_size_value is null or byte_size_value <= 0
      or duration_value is null or duration_value <= 0 or duration_value > 30.5
      or quality_score_value is null or quality_score_value not between 0 and 100
      or quality_status_value not in ('passed', 'failed', 'manual_review') then
      raise exception using errcode = '22023', message = 'Invalid render candidate asset or quality metadata.';
    end if;

    insert into public.green_track_assets(
      track_id,
      owner_id,
      asset_kind,
      blob_url,
      blob_pathname,
      content_type,
      byte_size,
      access_level,
      sha256
    )
    values (
      null,
      project_row.creator_id,
      'preview',
      blob_url_value,
      blob_pathname_value,
      content_type_value,
      byte_size_value,
      'private',
      sha256_value
    )
    on conflict (blob_url) do nothing;

    select id into asset_id_value
    from public.green_track_assets
    where blob_url = blob_url_value
      and owner_id = project_row.creator_id
      and asset_kind = 'preview'
      and access_level = 'private'
      and quarantined_at is null;

    if asset_id_value is null then
      raise exception using errcode = 'P0001', message = 'Render output asset could not be bound to the project creator.';
    end if;

    insert into public.green_render_candidates(
      project_id,
      arrangement,
      asset_id,
      duration_seconds,
      quality_score,
      quality_status,
      metrics
    )
    values (
      project_row.id,
      arrangement_name,
      asset_id_value,
      duration_value,
      quality_score_value,
      quality_status_value,
      coalesce(candidate->'metrics', '{}'::jsonb)
    )
    on conflict (project_id, arrangement)
    do update set
      asset_id = excluded.asset_id,
      duration_seconds = excluded.duration_seconds,
      quality_score = excluded.quality_score,
      quality_status = excluded.quality_status,
      metrics = excluded.metrics;
  end loop;

  update public.green_projects
  set status = 'ready', updated_at = now()
  where id = project_row.id
  returning * into result;

  update public.green_processing_jobs
  set status = 'succeeded',
      output = jsonb_build_object('candidates', p_candidates),
      completed_at = now(),
      updated_at = now()
  where id = job_row.id;

  return result;
end;
$$;

revoke all on function public.queue_green_project_render(uuid, uuid, text),
  public.complete_green_project_render(uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.queue_green_project_render(uuid, uuid, text),
  public.complete_green_project_render(uuid, jsonb)
  to service_role;

commit;
