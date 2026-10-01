\set ON_ERROR_STOP on
\ir ../migrations/029_studio_actions.sql
begin;
create function pg_temp.ok(value boolean, label text) returns void language plpgsql as $$begin if value is distinct from true then raise exception 'FAIL: %',label; end if; end;$$;
create function pg_temp.reject(sql text, expected text) returns void language plpgsql as $$declare actual text; begin begin execute sql; exception when others then get stacked diagnostics actual=returned_sqlstate; end; if actual is distinct from expected then raise exception 'Expected %, received %',expected,coalesce(actual,'success'); end if; end;$$;
insert into auth.users select ('00000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid from generate_series(1,6) i;
set local role service_role;
insert into public.green_catalog_tracks(id,owner_id,slug,artist_name,track_title,genre,bpm,status,rights_status,quality_status,published_at)
select ('10000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,('00000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,'source-'||i,'Artist '||i,'Track '||i,'Electronic',128,'green','verified','passed',now() from generate_series(1,2) i;
insert into public.green_rights_grants(track_id,submitted_by,master_controller,composition_controller,master_control_confirmed,composition_control_confirmed,sample_status,stem_extraction_allowed,cross_track_derivatives_allowed,in_app_playback_allowed,verified_by,verified_at)
select id,owner_id,'Owner','Owner',true,true,'sample_free',true,true,true,'00000000-0000-4000-8000-000000000006',now() from public.green_catalog_tracks;
insert into public.green_projects(id,creator_id,title,left_track_id,right_track_id,status) values('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000003','Reviewed test','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','ready');
insert into public.green_track_assets(id,owner_id,asset_kind,blob_url,blob_pathname,content_type,byte_size,access_level) values('40000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000003','preview','https://fixture.invalid/preview.wav','green-room/jobs/test/preview.wav','audio/wav',2000,'private');
insert into public.green_render_candidates(id,project_id,arrangement,asset_id,duration_seconds,quality_score,quality_status,metrics) values('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','drop-swap','40000000-0000-4000-8000-000000000001',20,0,'manual_review','{"integratedLufs":-14,"truePeakDb":-1.2}');
select pg_temp.reject($s$select public.select_green_project_candidate('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000004','30000000-0000-4000-8000-000000000001',1)$s$,'42501');
select public.select_green_project_candidate('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001',1);
select public.select_green_project_candidate('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001',1);
select pg_temp.ok((select revision=2 from public.green_projects where id='20000000-0000-4000-8000-000000000001'),'selection retry increments once');
select pg_temp.reject($s$select public.select_green_project_candidate('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000002',1)$s$,'40001');
select pg_temp.reject($s$select public.publish_green_studio_project('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000003',2)$s$,'P0001');
select pg_temp.reject($s$select public.review_green_render_candidate('30000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','keep',5,5,5,'fixture')$s$,'42501');
select public.review_green_render_candidate('30000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000004','keep',5,5,5,'synthetic database fixture, not a real review');
select pg_temp.ok((select quality_status='manual_review' from public.green_render_candidates where id='30000000-0000-4000-8000-000000000001'),'one review is insufficient');
select public.review_green_render_candidate('30000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000005','keep',5,5,5,'synthetic database fixture, not a real review');
select public.publish_green_studio_project('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000003',2);
select public.fork_green_publication('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000002');
select pg_temp.ok((select status='draft' and selected_candidate_id is null and parent_project_id='20000000-0000-4000-8000-000000000001' from public.green_projects where id='20000000-0000-4000-8000-000000000002'),'fork is a clean child recipe');
update public.green_rights_grants set revoked_at=now();
select pg_temp.reject($s$select public.fork_green_publication('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000003')$s$,'P0001');
set local role authenticated;
select pg_temp.reject($s$select public.select_green_project_candidate('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001',2)$s$,'42501');
rollback;
\echo Studio ownership, revision, review and fork checks passed
