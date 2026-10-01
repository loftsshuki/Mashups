-- Durable processor leases, source provenance, atomic evidence merge, and catalog audition bootstrap.
begin;

alter table public.green_processing_jobs
  add column if not exists source_asset_id uuid references public.green_track_assets(id) on delete restrict,
  add column if not exists source_sha256 text,
  add column if not exists dispatch_token uuid,
  add column if not exists lease_expires_at timestamptz,
  add column if not exists max_attempts smallint not null default 3 check (max_attempts between 1 and 8);

alter table public.green_processing_jobs
  drop constraint if exists green_jobs_source_sha256_check,
  add constraint green_jobs_source_sha256_check
    check (source_sha256 is null or source_sha256 ~ '^[0-9a-f]{64}$');

alter table public.green_track_assets
  add column if not exists source_asset_id uuid references public.green_track_assets(id) on delete restrict,
  add column if not exists source_sha256 text,
  add column if not exists provenance jsonb not null default '{}'::jsonb;

alter table public.green_track_assets
  drop constraint if exists green_assets_source_sha256_check,
  add constraint green_assets_source_sha256_check
    check (source_sha256 is null or source_sha256 ~ '^[0-9a-f]{64}$');

alter table public.green_track_analysis
  add column if not exists source_asset_id uuid references public.green_track_assets(id) on delete restrict,
  add column if not exists source_sha256 text;

alter table public.green_track_analysis
  drop constraint if exists green_analysis_source_sha256_check,
  add constraint green_analysis_source_sha256_check
    check (source_sha256 is null or source_sha256 ~ '^[0-9a-f]{64}$');

create table if not exists public.green_track_processing_evidence (
  track_id uuid not null references public.green_catalog_tracks(id) on delete cascade,
  source_asset_id uuid not null references public.green_track_assets(id) on delete restrict,
  source_sha256 text not null check (source_sha256 ~ '^[0-9a-f]{64}$'),
  analysis jsonb,
  fingerprint jsonb,
  separation jsonb,
  updated_at timestamptz not null default now(),
  primary key (track_id, source_asset_id, source_sha256)
);
alter table public.green_track_processing_evidence enable row level security;
revoke all on public.green_track_processing_evidence from public, anon, authenticated;
grant all on public.green_track_processing_evidence to service_role;

create index if not exists green_jobs_lease_idx
  on public.green_processing_jobs(status, lease_expires_at)
  where status = 'running';

create or replace function public.claim_green_processing_job(
  p_job_id uuid,
  p_lease_seconds integer default 900
) returns public.green_processing_jobs
language plpgsql security invoker set search_path = '' as $$
declare result public.green_processing_jobs%rowtype;
begin
  if p_job_id is null or p_lease_seconds not between 60 and 3600 then
    raise exception using errcode='22023', message='Invalid job claim.';
  end if;
  update public.green_processing_jobs
  set status='running',
      started_at=now(),
      attempt_count=attempt_count+1,
      dispatch_token=gen_random_uuid(),
      lease_expires_at=now()+make_interval(secs=>p_lease_seconds),
      error_code=null,
      error_message=null,
      updated_at=now()
  where id=p_job_id
    and status='queued'
    and available_at<=now()
    and attempt_count<max_attempts
  returning * into result;
  return result;
end;
$$;

create or replace function public.release_green_processing_job(
  p_job_id uuid,
  p_dispatch_token uuid,
  p_error_code text,
  p_error_message text,
  p_delay_seconds integer default 60
) returns public.green_processing_jobs
language plpgsql security invoker set search_path = '' as $$
declare j public.green_processing_jobs%rowtype;
begin
  select * into j from public.green_processing_jobs where id=p_job_id for update;
  if j.id is null or j.status<>'running' or j.dispatch_token is distinct from p_dispatch_token then
    raise exception using errcode='P0001', message='Job lease is no longer active.';
  end if;
  if j.attempt_count>=j.max_attempts then
    update public.green_processing_jobs
    set status='failed', completed_at=now(), lease_expires_at=null, dispatch_token=null,
        error_code=left(coalesce(p_error_code,'HANDOFF_FAILED'),80),
        error_message=left(p_error_message,500), updated_at=now()
    where id=j.id returning * into j;
    if j.project_id is not null and j.job_type='render_candidates' then
      update public.green_projects set status='draft',updated_at=now()
      where id=j.project_id and status='rendering';
    end if;
  else
    update public.green_processing_jobs
    set status='queued', started_at=null, lease_expires_at=null, dispatch_token=null,
        available_at=now()+make_interval(secs=>greatest(5,least(p_delay_seconds,900))),
        error_code=left(coalesce(p_error_code,'HANDOFF_FAILED'),80),
        error_message=left(p_error_message,500), updated_at=now()
    where id=j.id returning * into j;
  end if;
  return j;
end;
$$;

create or replace function public.requeue_expired_green_jobs(p_limit integer default 20)
returns integer language plpgsql security invoker set search_path = '' as $$
declare j public.green_processing_jobs%rowtype; changed integer:=0;
begin
  for j in
    select * from public.green_processing_jobs
    where status='running' and lease_expires_at is not null and lease_expires_at<=now()
    order by lease_expires_at,id
    for update skip locked
    limit greatest(1,least(p_limit,100))
  loop
    if j.attempt_count>=j.max_attempts then
      update public.green_processing_jobs
      set status='failed',completed_at=now(),dispatch_token=null,lease_expires_at=null,
          error_code='LEASE_EXHAUSTED',error_message='Processor lease expired after the maximum attempts.',updated_at=now()
      where id=j.id;
      if j.project_id is not null and j.job_type='render_candidates' then
        update public.green_projects set status='draft',updated_at=now()
        where id=j.project_id and status='rendering';
      end if;
    else
      update public.green_processing_jobs
      set status='queued',started_at=null,dispatch_token=null,lease_expires_at=null,
          available_at=now()+interval '30 seconds',
          error_code='LEASE_EXPIRED',error_message='Processor lease expired and was requeued.',updated_at=now()
      where id=j.id;
    end if;
    changed:=changed+1;
  end loop;
  return changed;
end;
$$;

create or replace function public.fail_green_processing_job(
  p_job_id uuid,
  p_dispatch_token uuid,
  p_error_code text,
  p_error_message text
) returns void language plpgsql security invoker set search_path = '' as $$
declare j public.green_processing_jobs%rowtype;
begin
  select * into j from public.green_processing_jobs where id=p_job_id for update;
  if j.id is null then raise exception using errcode='P0001',message='Job not found.'; end if;
  if j.status in ('succeeded','failed','cancelled') then return; end if;
  if j.status<>'running' or j.dispatch_token is distinct from p_dispatch_token then
    raise exception using errcode='P0001',message='Job lease is no longer active.';
  end if;
  update public.green_processing_jobs
  set status='failed',error_code=left(coalesce(p_error_code,'PROCESSOR_FAILED'),80),
      error_message=left(p_error_message,500),completed_at=now(),
      dispatch_token=null,lease_expires_at=null,updated_at=now()
  where id=j.id;
  if j.project_id is not null and j.job_type='render_candidates' then
    update public.green_projects set status='draft',updated_at=now()
    where id=j.project_id and status='rendering';
  elsif j.track_id is not null then
    update public.green_catalog_tracks set quality_status='manual_review',updated_at=now()
    where id=j.track_id;
  end if;
end;
$$;

create or replace function public.merge_green_processing_evidence(
  p_job_id uuid,
  p_dispatch_token uuid,
  p_result jsonb
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  j public.green_processing_jobs%rowtype;
  a public.green_track_assets%rowtype;
  e public.green_track_processing_evidence%rowtype;
  analysis_obj jsonb;
  fingerprint_obj jsonb;
  separation_obj jsonb;
  sample_status text;
  bpm_value numeric;
  musical_key_value text;
  camelot_key_value text;
  lufs_value numeric;
  peak_value numeric;
  bleed_value numeric;
  sdr_value numeric;
  phrase_value numeric;
  reasons text[];
  next_quality text;
  next_status text;
begin
  if p_result is null or jsonb_typeof(p_result)<>'object' then
    raise exception using errcode='22023',message='Processor result object required.';
  end if;
  select * into j from public.green_processing_jobs where id=p_job_id for update;
  if j.id is null then raise exception using errcode='P0001',message='Job not found.'; end if;
  if j.status='succeeded' then
    select * into e from public.green_track_processing_evidence
    where track_id=j.track_id and source_asset_id=j.source_asset_id and source_sha256=j.source_sha256;
    return jsonb_build_object('duplicate',true,'evidence',to_jsonb(e));
  end if;
  if j.status<>'running' or j.dispatch_token is distinct from p_dispatch_token then
    raise exception using errcode='P0001',message='Job lease is no longer active.';
  end if;
  if j.track_id is null or j.job_type not in ('analyze','fingerprint','separate')
    or j.source_asset_id is null or j.source_sha256 is null then
    raise exception using errcode='P0001',message='Track job is missing immutable source provenance.';
  end if;
  select * into a from public.green_track_assets where id=j.source_asset_id for share;
  if a.id is null or a.track_id is distinct from j.track_id or a.asset_kind<>'master'
    or a.sha256 is distinct from j.source_sha256 or a.access_level<>'private' or a.quarantined_at is not null then
    raise exception using errcode='P0001',message='Authorized source asset no longer matches this job.';
  end if;

  insert into public.green_track_processing_evidence(track_id,source_asset_id,source_sha256)
  values(j.track_id,j.source_asset_id,j.source_sha256)
  on conflict do nothing;
  select * into e from public.green_track_processing_evidence
  where track_id=j.track_id and source_asset_id=j.source_asset_id and source_sha256=j.source_sha256
  for update;

  if j.job_type='analyze' then
    if jsonb_typeof(p_result->'analysis')<>'object' then raise exception using errcode='22023',message='Analysis evidence required.'; end if;
    e.analysis:=p_result->'analysis';
  elsif j.job_type='fingerprint' then
    if jsonb_typeof(p_result->'fingerprint')<>'object' then raise exception using errcode='22023',message='Fingerprint evidence required.'; end if;
    if p_result->'fingerprint'->>'sourceSha256' is distinct from j.source_sha256 then
      raise exception using errcode='P0001',message='Fingerprint evidence does not match the authorized source hash.';
    end if;
    e.fingerprint:=p_result->'fingerprint';
  else
    if jsonb_typeof(p_result->'separation')<>'object' then raise exception using errcode='22023',message='Separation evidence required.'; end if;
    e.separation:=p_result->'separation';
  end if;
  update public.green_track_processing_evidence
  set analysis=e.analysis,fingerprint=e.fingerprint,separation=e.separation,updated_at=now()
  where track_id=e.track_id and source_asset_id=e.source_asset_id and source_sha256=e.source_sha256;

  analysis_obj:=e.analysis; fingerprint_obj:=e.fingerprint; separation_obj:=e.separation;
  if analysis_obj is not null then
    begin
      bpm_value:=(analysis_obj->>'bpm')::numeric;
      musical_key_value:=analysis_obj->>'musicalKey';
      camelot_key_value:=analysis_obj->>'camelotKey';
      lufs_value:=(analysis_obj->>'integratedLufs')::numeric;
      peak_value:=(analysis_obj->>'truePeakDb')::numeric;
      phrase_value:=(analysis_obj->>'phraseConfidence')::numeric;
      bleed_value:=coalesce((separation_obj->>'vocalBleedDb')::numeric,(analysis_obj->>'vocalBleedDb')::numeric);
      sdr_value:=coalesce((separation_obj->>'separationSdrDb')::numeric,(analysis_obj->>'separationSdrDb')::numeric);
    exception when others then
      raise exception using errcode='22023',message='Invalid numeric audio evidence.';
    end;
    sample_status:=coalesce(fingerprint_obj->>'sampleScanStatus',analysis_obj->>'sampleScanStatus','unavailable');
    if sample_status not in ('clear','flagged','unavailable') or phrase_value not between 0 and 1 then
      raise exception using errcode='22023',message='Invalid audio evidence state.';
    end if;
    reasons:=array_remove(array[
      case when lufs_value < -15 or lufs_value > -13 then 'Integrated loudness must be -14 LUFS +/- 1.' end,
      case when peak_value > -1 then 'True peak must not exceed -1 dBTP.' end,
      case when sdr_value is not null and sdr_value < 12 then 'Stem separation SDR is below 12 dB.' end,
      case when bleed_value is not null and bleed_value > -24 then 'Vocal bleed is louder than -24 dB.' end,
      case when phrase_value < 0.85 then 'Phrase alignment confidence is below 85%.' end,
      case when sample_status <> 'clear' then 'Sample scan is not clear.' end
    ]::text[],null);
    if cardinality(reasons)=0 then next_quality:='passed';next_status:='listening_review';
    elsif sample_status='unavailable' then next_quality:='manual_review';next_status:='listening_review';
    else next_quality:='failed';next_status:='quarantined'; end if;

    insert into public.green_track_analysis(
      track_id,bpm,musical_key,camelot_key,integrated_lufs,true_peak_db,
      vocal_bleed_db,separation_sdr_db,phrase_confidence,sample_scan_status,
      quality_reasons,analyzed_at,source_asset_id,source_sha256
    ) values(
      j.track_id,bpm_value,musical_key_value,camelot_key_value,lufs_value,peak_value,
      bleed_value,sdr_value,phrase_value,sample_status,reasons,now(),j.source_asset_id,j.source_sha256
    )
    on conflict(track_id) do update set
      bpm=excluded.bpm,musical_key=excluded.musical_key,camelot_key=excluded.camelot_key,
      integrated_lufs=excluded.integrated_lufs,true_peak_db=excluded.true_peak_db,
      vocal_bleed_db=excluded.vocal_bleed_db,separation_sdr_db=excluded.separation_sdr_db,
      phrase_confidence=excluded.phrase_confidence,sample_scan_status=excluded.sample_scan_status,
      quality_reasons=excluded.quality_reasons,analyzed_at=excluded.analyzed_at,
      source_asset_id=excluded.source_asset_id,source_sha256=excluded.source_sha256;
    update public.green_catalog_tracks
    set bpm=bpm_value,musical_key=musical_key_value,camelot_key=camelot_key_value,
        quality_status=next_quality,status=next_status,updated_at=now()
    where id=j.track_id;
  end if;

  update public.green_processing_jobs
  set status='succeeded',output=p_result,completed_at=now(),dispatch_token=null,lease_expires_at=null,updated_at=now()
  where id=j.id;
  select * into e from public.green_track_processing_evidence
  where track_id=j.track_id and source_asset_id=j.source_asset_id and source_sha256=j.source_sha256;
  return jsonb_build_object('duplicate',false,'evidence',to_jsonb(e));
end;
$$;

create or replace function public.complete_green_project_render_leased(
  p_job_id uuid,
  p_dispatch_token uuid,
  p_candidates jsonb
) returns public.green_projects
language plpgsql security invoker set search_path = '' as $$
declare j public.green_processing_jobs%rowtype; result public.green_projects%rowtype;
begin
  select * into j from public.green_processing_jobs where id=p_job_id for update;
  if j.id is null or j.status<>'running' or j.dispatch_token is distinct from p_dispatch_token then
    raise exception using errcode='P0001',message='Render lease is no longer active.';
  end if;
  if exists(
    select 1 from jsonb_array_elements(p_candidates) c
    where coalesce(c->'asset'->>'sha256','') !~ '^[0-9a-fA-F]{64}$'
  ) then raise exception using errcode='22023',message='Every render asset requires a SHA-256 digest.'; end if;
  select * into result from public.complete_green_project_render(p_job_id,p_candidates);
  update public.green_processing_jobs set dispatch_token=null,lease_expires_at=null,updated_at=now() where id=p_job_id;
  return result;
end;
$$;

-- Service-only bootstrap for the first real catalog. It creates a private
-- audition project from reviewed rights/audio without making either source public.
create or replace function public.create_green_audition_project(
  p_id uuid,p_operator_id uuid,p_left_track_id uuid,p_right_track_id uuid,p_title text
) returns public.green_projects
language plpgsql security invoker set search_path = '' as $$
declare result public.green_projects%rowtype;
begin
  if p_id is null or p_operator_id is null or p_left_track_id is null or p_right_track_id is null
    or p_left_track_id=p_right_track_id then raise exception using errcode='22023',message='Two source tracks and an operator are required.'; end if;
  perform id from public.green_catalog_tracks where id in(p_left_track_id,p_right_track_id) order by id for share;
  perform id from public.green_rights_grants where track_id in(p_left_track_id,p_right_track_id) order by track_id for share;
  if (select count(*) from public.green_catalog_tracks t
      where t.id in(p_left_track_id,p_right_track_id)
        and t.status in ('listening_review','green')
        and t.rights_status='verified' and t.quality_status='passed'
        and public.green_track_has_active_grant(t.id))<>2 then
    raise exception using errcode='P0001',message='Audition sources require active rights and passing source analysis.';
  end if;
  insert into public.green_projects(
    id,creator_id,title,source_mode,left_track_id,right_track_id,parameters,status
  ) values(
    p_id,p_operator_id,left(coalesce(nullif(btrim(p_title),''),'Catalog audition'),120),
    'catalog',p_left_track_id,p_right_track_id,'{"purpose":"catalog_audition"}'::jsonb,'draft'
  ) returning * into result;
  return result;
end;
$$;

create or replace function public.queue_green_audition_render(
  p_project_id uuid,p_operator_id uuid,p_provider text
) returns public.green_processing_jobs
language plpgsql security invoker set search_path = '' as $$
declare p public.green_projects%rowtype; result public.green_processing_jobs%rowtype; manifest jsonb; count_assets integer;
begin
  select * into p from public.green_projects where id=p_project_id for update;
  if p.id is null or p.creator_id is distinct from p_operator_id
    or p.parameters->>'purpose' is distinct from 'catalog_audition' or p.status<>'draft' then
    raise exception using errcode='42501',message='Audition project unavailable.';
  end if;
  if (select count(*) from public.green_catalog_tracks t
      where t.id in(p.left_track_id,p.right_track_id)
        and t.status in ('listening_review','green') and t.rights_status='verified'
        and t.quality_status='passed' and public.green_track_has_active_grant(t.id))<>2 then
    raise exception using errcode='P0001',message='Audition source permissions changed.';
  end if;
  with stems as (
    select distinct on(a.track_id,a.asset_kind) a.*
    from public.green_track_assets a
    where a.track_id in(p.left_track_id,p.right_track_id)
      and a.asset_kind in('stem_vocal','stem_drums','stem_bass','stem_other')
      and a.access_level='private' and a.quarantined_at is null
      and a.sha256 is not null and a.source_sha256 is not null
    order by a.track_id,a.asset_kind,a.created_at desc
  )
  select count(*)::integer,
    jsonb_agg(jsonb_build_object(
      'assetId',id,'assetSha256',sha256,'sourceSha256',source_sha256,
      'role',(case when track_id=p.left_track_id then 'left:' else 'right:' end)||asset_kind
    ) order by track_id,asset_kind)
  into count_assets,manifest from stems;
  if count_assets<>8 then raise exception using errcode='P0001',message='Audition requires eight provenance-bound stems.'; end if;
  insert into public.green_processing_jobs(project_id,job_type,provider,input)
  values(p.id,'render_candidates',btrim(p_provider),jsonb_build_object(
    'assets',manifest,'arrangements',jsonb_build_array('vocal-a-over-b','vocal-b-over-a','drop-swap'),
    'purpose','catalog_audition'
  )) returning * into result;
  update public.green_projects set status='rendering',updated_at=now() where id=p.id;
  return result;
end;
$$;

-- Enrich ordinary studio render jobs with immutable stem hashes before dispatch.
create or replace function public.start_green_studio_render(
  p_project_id uuid,p_creator_id uuid,p_expected_revision integer,p_request_id uuid,p_recipe jsonb
) returns public.green_processing_jobs language plpgsql security invoker set search_path = '' as $$
declare p public.green_projects%rowtype; j public.green_processing_jobs%rowtype; left_bpm numeric;right_bpm numeric;manifest jsonb;manifest_count integer;
begin
  if p_creator_id is null or p_request_id is null or p_expected_revision is null then raise exception using errcode='22023',message='Creator, request ID and revision are required.'; end if;
  select * into p from public.green_projects where id=p_project_id for update;
  if p.id is null or p.creator_id is distinct from p_creator_id then raise exception using errcode='42501',message='Project unavailable.'; end if;
  select * into j from public.green_processing_jobs where project_id=p.id and input->>'requestId'=p_request_id::text order by created_at desc,id desc limit 1;
  if j.id is not null then return j; end if;
  if p.revision<>p_expected_revision then raise exception using errcode='40001',message='Project changed. Reload before rendering.'; end if;
  if p_recipe is null or jsonb_typeof(p_recipe)<>'object' then raise exception using errcode='22023',message='Render recipe required.'; end if;
  select bpm into left_bpm from public.green_catalog_tracks where id=p.left_track_id;
  select bpm into right_bpm from public.green_catalog_tracks where id=p.right_track_id;
  if left_bpm is null or right_bpm is null or left_bpm not between 60 and 180 or right_bpm not between 60 and 180 then raise exception using errcode='P0001',message='Both source tempos need review before rendering.'; end if;
  if (p_recipe->>'targetBpm') is null or (p_recipe->>'targetBpm')::numeric not between 60 and 180
    or (p_recipe->>'durationSeconds') is null or (p_recipe->>'durationSeconds')::numeric not between 8 and 30
    or (p_recipe->>'leftStartSeconds') is null or (p_recipe->>'leftStartSeconds')::numeric not between 0 and 600
    or (p_recipe->>'rightStartSeconds') is null or (p_recipe->>'rightStartSeconds')::numeric not between 0 and 600
    or coalesce((p_recipe->>'leftSemitones')::numeric,99) not between -3 and 3
    or coalesce((p_recipe->>'rightSemitones')::numeric,99) not between -3 and 3 then
    raise exception using errcode='22023',message='Unsupported render timing or transposition.';
  end if;
  select * into j from public.queue_green_project_render(p.id,p_creator_id,'renderer');
  select count(*)::integer,
    jsonb_agg(jsonb_build_object(
      'assetId',a.id,'assetSha256',a.sha256,'sourceSha256',a.source_sha256,'role',entry->>'role'
    ) order by entry->>'role')
  into manifest_count,manifest
  from jsonb_array_elements(j.input->'assets') entry
  join public.green_track_assets a on a.id=(entry->>'assetId')::uuid
  where a.sha256 is not null and a.source_sha256 is not null;
  if manifest_count<>8 then
    raise exception using errcode='P0001',message='Every render input must be bound to immutable stem and source hashes.';
  end if;
  update public.green_processing_jobs
  set input=input||jsonb_build_object(
    'assets',manifest,'requestId',p_request_id,
    'recipe',p_recipe||jsonb_build_object('leftBpm',left_bpm,'rightBpm',right_bpm,'version',2)
  )
  where id=j.id returning * into j;
  update public.green_projects set revision=revision+1,updated_at=now() where id=p.id;
  return j;
end;
$$;

revoke all on function public.claim_green_processing_job(uuid,integer),
 public.release_green_processing_job(uuid,uuid,text,text,integer),
 public.requeue_expired_green_jobs(integer),
 public.fail_green_processing_job(uuid,uuid,text,text),
 public.merge_green_processing_evidence(uuid,uuid,jsonb),
 public.complete_green_project_render_leased(uuid,uuid,jsonb),
 public.create_green_audition_project(uuid,uuid,uuid,uuid,text),
 public.queue_green_audition_render(uuid,uuid,text)
from public,anon,authenticated;
grant execute on function public.claim_green_processing_job(uuid,integer),
 public.release_green_processing_job(uuid,uuid,text,text,integer),
 public.requeue_expired_green_jobs(integer),
 public.fail_green_processing_job(uuid,uuid,text,text),
 public.merge_green_processing_evidence(uuid,uuid,jsonb),
 public.complete_green_project_render_leased(uuid,uuid,jsonb),
 public.create_green_audition_project(uuid,uuid,uuid,uuid,text),
 public.queue_green_audition_render(uuid,uuid,text)
to service_role;

commit;
