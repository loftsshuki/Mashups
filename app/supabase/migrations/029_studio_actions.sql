-- Creator actions are server-only and serialize against a project's revision.
begin;
create function public.select_green_project_candidate(p_project_id uuid, p_creator_id uuid, p_candidate_id uuid, p_expected_revision integer)
returns public.green_projects language plpgsql security invoker set search_path = '' as $$
declare p public.green_projects%rowtype; c public.green_render_candidates%rowtype;
begin
  if p_creator_id is null or p_expected_revision is null or p_expected_revision < 1 then raise exception using errcode='22023', message='Creator and revision are required.'; end if;
  select * into p from public.green_projects where id=p_project_id for update;
  if p.id is null or p.creator_id is distinct from p_creator_id then raise exception using errcode='42501', message='Project unavailable.'; end if;
  if p.status <> 'ready' or p.source_mode <> 'catalog' then raise exception using errcode='P0001', message='Select a candidate from a ready catalog project.'; end if;
  if p.revision = p_expected_revision + 1 and p.selected_candidate_id = p_candidate_id then return p; end if;
  if p.revision <> p_expected_revision then raise exception using errcode='40001', message='Project changed. Reload before choosing a candidate.'; end if;
  select * into c from public.green_render_candidates where id=p_candidate_id and project_id=p.id for share;
  if c.id is null or c.asset_id is null or c.quality_status='failed' then raise exception using errcode='P0001', message='Candidate is unavailable or failed quality review.'; end if;
  if not exists(select 1 from public.green_track_assets a where a.id=c.asset_id and a.owner_id=p_creator_id and a.asset_kind='preview' and a.access_level='private' and a.quarantined_at is null) then raise exception using errcode='P0001', message='Candidate audio is unavailable.'; end if;
  update public.green_projects set selected_candidate_id=c.id, selected_arrangement=c.arrangement, revision=revision+1, updated_at=now() where id=p.id returning * into p;
  return p;
end; $$;

create function public.fork_green_publication(p_parent_id uuid, p_creator_id uuid, p_new_id uuid)
returns public.green_projects language plpgsql security invoker set search_path = '' as $$
declare parent public.green_projects%rowtype; child public.green_projects%rowtype;
begin
  if p_creator_id is null or p_new_id is null or p_new_id=p_parent_id then raise exception using errcode='22023', message='A new project identity and creator are required.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_new_id::text,0));
  select * into parent from public.green_projects where id=p_parent_id for share;
  if parent.id is null or public.get_green_publication(parent.id) is null then raise exception using errcode='P0001', message='The parent publication or its permissions are unavailable.'; end if;
  select * into child from public.green_projects where id=p_new_id for update;
  if child.id is not null then
    if child.creator_id=p_creator_id and child.parent_project_id=parent.id then return child; end if;
    raise exception using errcode='40001', message='Project identity already used.';
  end if;
  select * into child from public.save_green_project(p_new_id,p_creator_id,left('Version of '||parent.title,120),jsonb_build_object('kind','catalog','leftId',parent.left_track_id,'rightId',parent.right_track_id),parent.intensity,null,0);
  update public.green_projects set parent_project_id=parent.id where id=child.id returning * into child;
  -- No rendered audio, review, or publication status is inherited.
  return child;
end; $$;

create function public.start_green_studio_render(p_project_id uuid,p_creator_id uuid,p_expected_revision integer,p_request_id uuid,p_recipe jsonb)
returns public.green_processing_jobs language plpgsql security invoker set search_path = '' as $$
declare p public.green_projects%rowtype; j public.green_processing_jobs%rowtype; left_bpm numeric; right_bpm numeric;
begin
  if p_creator_id is null or p_request_id is null or p_expected_revision is null then raise exception using errcode='22023', message='Creator, request ID and revision are required.'; end if;
  select * into p from public.green_projects where id=p_project_id for update;
  if p.id is null or p.creator_id is distinct from p_creator_id then raise exception using errcode='42501', message='Project unavailable.'; end if;
  select * into j from public.green_processing_jobs where project_id=p.id and input->>'requestId'=p_request_id::text order by created_at desc,id desc limit 1;
  if j.id is not null then return j; end if;
  if p.revision <> p_expected_revision then raise exception using errcode='40001', message='Project changed. Reload before rendering.'; end if;
  if p_recipe is null or jsonb_typeof(p_recipe)<>'object' then raise exception using errcode='22023', message='Render recipe required.'; end if;
  select bpm into left_bpm from public.green_catalog_tracks where id=p.left_track_id;
  select bpm into right_bpm from public.green_catalog_tracks where id=p.right_track_id;
  if left_bpm is null or right_bpm is null or left_bpm not between 60 and 180 or right_bpm not between 60 and 180 then raise exception using errcode='P0001', message='Both source tempos need review before rendering.'; end if;
  if (p_recipe->>'targetBpm') is null or (p_recipe->>'targetBpm')::numeric not between 60 and 180
    or (p_recipe->>'durationSeconds') is null or (p_recipe->>'durationSeconds')::numeric not between 8 and 30
    or (p_recipe->>'leftStartSeconds') is null or (p_recipe->>'leftStartSeconds')::numeric not between 0 and 600
    or (p_recipe->>'rightStartSeconds') is null or (p_recipe->>'rightStartSeconds')::numeric not between 0 and 600
    or coalesce((p_recipe->>'leftSemitones')::numeric,99) not between -3 and 3
    or coalesce((p_recipe->>'rightSemitones')::numeric,99) not between -3 and 3 then raise exception using errcode='22023', message='Unsupported render timing or transposition.'; end if;
  select * into j from public.queue_green_project_render(p.id,p_creator_id,'renderer');
  update public.green_processing_jobs set input=input||jsonb_build_object('requestId',p_request_id,'recipe',p_recipe||jsonb_build_object('leftBpm',left_bpm,'rightBpm',right_bpm,'version',1)) where id=j.id returning * into j;
  update public.green_projects set revision=revision+1, updated_at=now() where id=p.id;
  return j;
end; $$;

-- Prevent a source owner from being counted as an independent reviewer.
create function public.review_green_render_candidate(p_candidate_id uuid,p_reviewer_id uuid,p_decision text,p_musicality integer,p_artifacts integer,p_share integer,p_notes text)
returns void language plpgsql security invoker set search_path = '' as $$
declare c public.green_render_candidates%rowtype; p public.green_projects%rowtype; keeps integer;
begin
  if p_reviewer_id is null or p_decision is null or p_decision not in ('keep','reject','rework') or p_musicality is null or p_musicality not between 1 and 5 or p_artifacts is null or p_artifacts not between 1 and 5 or p_share is null or p_share not between 1 and 5 then raise exception using errcode='22023', message='Review ratings are required.'; end if;
  select gp.* into p from public.green_projects gp join public.green_render_candidates gc on gc.project_id=gp.id where gc.id=p_candidate_id for update of gp;
  if p.id is null or p.status='published' then raise exception using errcode='P0001', message='Review a ready unpublished candidate.'; end if;
  if p.creator_id=p_reviewer_id or exists(select 1 from public.green_catalog_tracks t where t.id in(p.left_track_id,p.right_track_id) and t.owner_id=p_reviewer_id) then raise exception using errcode='42501', message='Review must be independent of creator and both source owners.'; end if;
  select * into c from public.green_render_candidates where id=p_candidate_id for update;
  insert into public.green_listening_reviews(candidate_id,reviewer_id,decision,musicality,artifact_score,share_confidence,notes)
    values(c.id,p_reviewer_id,p_decision,p_musicality,p_artifacts,p_share,left(p_notes,2000))
    on conflict(candidate_id,reviewer_id) do update set decision=excluded.decision,musicality=excluded.musicality,artifact_score=excluded.artifact_score,share_confidence=excluded.share_confidence,notes=excluded.notes;
  select count(*) into keeps from public.green_listening_reviews r where r.candidate_id=c.id and r.decision='keep' and r.musicality>=3 and r.artifact_score>=4 and r.share_confidence>=3 and r.reviewer_id is distinct from p.creator_id and not exists(select 1 from public.green_catalog_tracks t where t.id in(p.left_track_id,p.right_track_id) and t.owner_id=r.reviewer_id);
  if keeps>=2 and not exists(select 1 from public.green_listening_reviews where candidate_id=c.id and decision in('reject','rework')) and jsonb_typeof(c.metrics->'integratedLufs')='number' and jsonb_typeof(c.metrics->'truePeakDb')='number' then
    if (c.metrics->>'integratedLufs')::numeric between -15 and -13 and (c.metrics->>'truePeakDb')::numeric<=-1 then
      update public.green_render_candidates set quality_status='passed' where id=c.id; return;
    end if;
  end if;
  update public.green_render_candidates set quality_status='manual_review' where id=c.id;
end; $$;

create function public.publish_green_studio_project(p_project_id uuid,p_creator_id uuid,p_expected_revision integer)
returns public.green_projects language plpgsql security invoker set search_path = '' as $$
declare p public.green_projects%rowtype; c public.green_render_candidates%rowtype;
begin
  if p_creator_id is null or p_expected_revision is null then raise exception using errcode='22023', message='Creator and revision are required.'; end if;
  select * into p from public.green_projects where id=p_project_id for update;
  if p.id is null or p.creator_id is distinct from p_creator_id then raise exception using errcode='42501', message='Project unavailable.'; end if;
  if p.revision<>p_expected_revision then raise exception using errcode='40001', message='Project changed. Reload before publishing.'; end if;
  perform id from public.green_catalog_tracks where id in(p.left_track_id,p.right_track_id) order by id for share;
  perform id from public.green_rights_grants where track_id in(p.left_track_id,p.right_track_id) order by track_id for share;
  if not public.green_track_has_active_grant(p.left_track_id) or not public.green_track_has_active_grant(p.right_track_id) then raise exception using errcode='P0001', message='Source permission is no longer active.'; end if;
  if exists(select 1 from public.green_rights_grants where track_id in(p.left_track_id,p.right_track_id) and pairing_rules<>'{}'::jsonb) then raise exception using errcode='P0001', message='Custom pairing rules require an operator decision.'; end if;
  select * into c from public.green_render_candidates where id=p.selected_candidate_id and project_id=p.id for share;
  if c.id is null or c.quality_status<>'passed' or not exists(select 1 from public.green_track_assets a where a.id=c.asset_id and a.owner_id=p.creator_id and a.access_level='private' and a.asset_kind='preview' and a.quarantined_at is null) then raise exception using errcode='P0001', message='A reviewed private preview is required.'; end if;
  if (select count(distinct r.reviewer_id) from public.green_listening_reviews r where r.candidate_id=c.id and r.decision='keep' and r.reviewer_id is distinct from p.creator_id and not exists(select 1 from public.green_catalog_tracks t where t.id in(p.left_track_id,p.right_track_id) and t.owner_id=r.reviewer_id))<2 then raise exception using errcode='P0001', message='Two independent keep reviews are required.'; end if;
  if p.status='published' then return p; end if;
  select * into p from public.publish_green_project(p.id,p_creator_id);
  return p;
end; $$;

revoke all on function public.select_green_project_candidate(uuid,uuid,uuid,integer),public.fork_green_publication(uuid,uuid,uuid),public.start_green_studio_render(uuid,uuid,integer,uuid,jsonb),public.review_green_render_candidate(uuid,uuid,text,integer,integer,integer,text),public.publish_green_studio_project(uuid,uuid,integer) from public,anon,authenticated;
grant execute on function public.select_green_project_candidate(uuid,uuid,uuid,integer),public.fork_green_publication(uuid,uuid,uuid),public.start_green_studio_render(uuid,uuid,integer,uuid,jsonb),public.review_green_render_candidate(uuid,uuid,text,integer,integer,integer,text),public.publish_green_studio_project(uuid,uuid,integer) to service_role;
commit;
