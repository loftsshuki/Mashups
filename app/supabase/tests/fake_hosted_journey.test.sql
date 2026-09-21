\set ON_ERROR_STOP on
\ir ../migrations/030_processing_reliability.sql
begin;
create function pg_temp.ok(value boolean,label text) returns void language plpgsql as $$begin if value is distinct from true then raise exception 'FAIL: %',label;end if;end;$$;
create function pg_temp.reject(sql text,expected text) returns void language plpgsql as $$declare actual text;begin begin execute sql;exception when others then get stacked diagnostics actual=returned_sqlstate;end;if actual is distinct from expected then raise exception 'Expected %, got %',expected,coalesce(actual,'success');end if;end;$$;

insert into auth.users(id) select ('70000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid from generate_series(1,7)i;
set local role service_role;
insert into public.green_catalog_tracks(id,owner_id,slug,artist_name,track_title,genre,status,rights_status,quality_status)
values
 ('71000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000001','journey-a','Journey A','Track A','Electronic','processing','verified','pending'),
 ('71000000-0000-4000-8000-000000000002','70000000-0000-4000-8000-000000000002','journey-b','Journey B','Track B','Electronic','processing','verified','pending');
insert into public.green_rights_grants(track_id,submitted_by,master_controller,composition_controller,master_control_confirmed,composition_control_confirmed,sample_status,stem_extraction_allowed,cross_track_derivatives_allowed,in_app_playback_allowed,territories,verified_by,verified_at)
values
 ('71000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000001','A','A',true,true,'sample_free',true,true,true,array['Worldwide'],'70000000-0000-4000-8000-000000000007',now()),
 ('71000000-0000-4000-8000-000000000002','70000000-0000-4000-8000-000000000002','B','B',true,true,'sample_free',true,true,true,array['Worldwide'],'70000000-0000-4000-8000-000000000007',now());
insert into public.green_track_assets(id,track_id,owner_id,asset_kind,blob_url,blob_pathname,content_type,byte_size,access_level,sha256)
values
 ('72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000001','master','https://fixture.invalid/a.wav','green-room/journey/a.wav','audio/wav',10000,'private',repeat('a',64)),
 ('72000000-0000-4000-8000-000000000002','71000000-0000-4000-8000-000000000002','70000000-0000-4000-8000-000000000002','master','https://fixture.invalid/b.wav','green-room/journey/b.wav','audio/wav',10000,'private',repeat('b',64));

insert into public.green_processing_jobs(id,track_id,job_type,provider,source_asset_id,source_sha256,max_attempts)
select ('73000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,track_id,job_type,'fixture',source_asset,source_hash,3
from (values
 (1,'71000000-0000-4000-8000-000000000001'::uuid,'analyze','72000000-0000-4000-8000-000000000001'::uuid,repeat('a',64)),
 (2,'71000000-0000-4000-8000-000000000001'::uuid,'fingerprint','72000000-0000-4000-8000-000000000001'::uuid,repeat('a',64)),
 (3,'71000000-0000-4000-8000-000000000001'::uuid,'separate','72000000-0000-4000-8000-000000000001'::uuid,repeat('a',64)),
 (4,'71000000-0000-4000-8000-000000000002'::uuid,'analyze','72000000-0000-4000-8000-000000000002'::uuid,repeat('b',64)),
 (5,'71000000-0000-4000-8000-000000000002'::uuid,'fingerprint','72000000-0000-4000-8000-000000000002'::uuid,repeat('b',64)),
 (6,'71000000-0000-4000-8000-000000000002'::uuid,'separate','72000000-0000-4000-8000-000000000002'::uuid,repeat('b',64))
)j(n,track_id,job_type,source_asset,source_hash);

do $$
declare j public.green_processing_jobs%rowtype; n integer;
begin
 for n in 1..6 loop
  select * into j from public.claim_green_processing_job(('73000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,900);
  if j.dispatch_token is null then raise exception 'claim failed';end if;
  if j.job_type='analyze' then
   perform public.merge_green_processing_evidence(j.id,j.dispatch_token,jsonb_build_object('analysis',jsonb_build_object(
    'bpm',128,'musicalKey','C major','camelotKey','8B','integratedLufs',-14,'truePeakDb',-1.2,
    'vocalBleedDb',null,'separationSdrDb',null,'phraseConfidence',0.95,'sampleScanStatus','unavailable')));
  elsif j.job_type='fingerprint' then
   perform public.merge_green_processing_evidence(j.id,j.dispatch_token,jsonb_build_object('fingerprint',jsonb_build_object(
    'sampleScanStatus','clear','providerReference','fixture-'||n,'matchCount',0,'sourceSha256',j.source_sha256)));
  else
   perform public.merge_green_processing_evidence(j.id,j.dispatch_token,jsonb_build_object('separation',jsonb_build_object(
    'assets','[]'::jsonb,'separationSdrDb',14,'vocalBleedDb',-27)));
  end if;
 end loop;
end$$;
select pg_temp.ok((select count(*)=2 from public.green_catalog_tracks where quality_status='passed' and status='listening_review'),'atomic evidence merge passes both reviewed sources');
select pg_temp.ok((select count(*)=2 from public.green_track_analysis where source_asset_id is not null and source_sha256 is not null),'analysis is source-bound');

-- Stale worker recovery changes the dispatch token, so an old callback cannot win.
insert into public.green_processing_jobs(id,track_id,job_type,provider,source_asset_id,source_sha256,max_attempts)
values('73000000-0000-4000-8000-000000000099','71000000-0000-4000-8000-000000000001','analyze','fixture','72000000-0000-4000-8000-000000000001',repeat('a',64),3);
select public.claim_green_processing_job('73000000-0000-4000-8000-000000000099',60);
update public.green_processing_jobs set lease_expires_at=now()-interval '1 second' where id='73000000-0000-4000-8000-000000000099';
select public.requeue_expired_green_jobs(10);
select pg_temp.ok((select status='queued' and error_code='LEASE_EXPIRED' from public.green_processing_jobs where id='73000000-0000-4000-8000-000000000099'),'expired lease requeues safely');

-- Register provenance-bound stems for a private catalog audition.
insert into public.green_track_assets(track_id,owner_id,asset_kind,blob_url,blob_pathname,content_type,byte_size,access_level,sha256,source_asset_id,source_sha256)
select track_id,owner_id,kind,'https://fixture.invalid/'||slug||'-'||kind||'.wav','green-room/journey/'||slug||'-'||kind||'.wav','audio/wav',4000,'private',sha,source_asset,source_hash
from (values
 ('71000000-0000-4000-8000-000000000001'::uuid,'70000000-0000-4000-8000-000000000001'::uuid,'stem_vocal','a','72000000-0000-4000-8000-000000000001'::uuid,repeat('a',64),repeat('1',64)),
 ('71000000-0000-4000-8000-000000000001'::uuid,'70000000-0000-4000-8000-000000000001'::uuid,'stem_drums','a','72000000-0000-4000-8000-000000000001'::uuid,repeat('a',64),repeat('2',64)),
 ('71000000-0000-4000-8000-000000000001'::uuid,'70000000-0000-4000-8000-000000000001'::uuid,'stem_bass','a','72000000-0000-4000-8000-000000000001'::uuid,repeat('a',64),repeat('3',64)),
 ('71000000-0000-4000-8000-000000000001'::uuid,'70000000-0000-4000-8000-000000000001'::uuid,'stem_other','a','72000000-0000-4000-8000-000000000001'::uuid,repeat('a',64),repeat('4',64)),
 ('71000000-0000-4000-8000-000000000002'::uuid,'70000000-0000-4000-8000-000000000002'::uuid,'stem_vocal','b','72000000-0000-4000-8000-000000000002'::uuid,repeat('b',64),repeat('5',64)),
 ('71000000-0000-4000-8000-000000000002'::uuid,'70000000-0000-4000-8000-000000000002'::uuid,'stem_drums','b','72000000-0000-4000-8000-000000000002'::uuid,repeat('b',64),repeat('6',64)),
 ('71000000-0000-4000-8000-000000000002'::uuid,'70000000-0000-4000-8000-000000000002'::uuid,'stem_bass','b','72000000-0000-4000-8000-000000000002'::uuid,repeat('b',64),repeat('7',64)),
 ('71000000-0000-4000-8000-000000000002'::uuid,'70000000-0000-4000-8000-000000000002'::uuid,'stem_other','b','72000000-0000-4000-8000-000000000002'::uuid,repeat('b',64),repeat('8',64))
)s(track_id,owner_id,kind,slug,source_asset,source_hash,sha);

select public.create_green_audition_project('74000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000007','71000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000002','Bootstrap audition');
select public.queue_green_audition_render('74000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000007','renderer');
select pg_temp.ok((select jsonb_array_length(input->'assets')=8 and (input->'assets'->0 ? 'assetSha256') from public.green_processing_jobs where project_id='74000000-0000-4000-8000-000000000001'),'audition freezes eight hashed stems');
do $$
declare j public.green_processing_jobs%rowtype;
begin
 select * into j from public.claim_green_processing_job((select id from public.green_processing_jobs where project_id='74000000-0000-4000-8000-000000000001' order by created_at desc limit 1),900);
 perform public.complete_green_project_render_leased(j.id,j.dispatch_token,jsonb_build_array(
  jsonb_build_object('arrangement','vocal-a-over-b','asset',jsonb_build_object('blobUrl','https://fixture.invalid/aud-a.wav','blobPathname','green-room/journey/aud-a.wav','contentType','audio/wav','byteSize',2000,'sha256',repeat('c',64)),'durationSeconds',15,'qualityScore',0,'qualityStatus','manual_review','metrics',jsonb_build_object('integratedLufs',-14,'truePeakDb',-1.2)),
  jsonb_build_object('arrangement','vocal-b-over-a','asset',jsonb_build_object('blobUrl','https://fixture.invalid/aud-b.wav','blobPathname','green-room/journey/aud-b.wav','contentType','audio/wav','byteSize',2000,'sha256',repeat('d',64)),'durationSeconds',15,'qualityScore',0,'qualityStatus','manual_review','metrics',jsonb_build_object('integratedLufs',-14,'truePeakDb',-1.2)),
  jsonb_build_object('arrangement','drop-swap','asset',jsonb_build_object('blobUrl','https://fixture.invalid/aud-c.wav','blobPathname','green-room/journey/aud-c.wav','contentType','audio/wav','byteSize',2000,'sha256',repeat('e',64)),'durationSeconds',15,'qualityScore',0,'qualityStatus','manual_review','metrics',jsonb_build_object('integratedLufs',-14,'truePeakDb',-1.2))
 ));
end$$;
select public.review_green_render_candidate((select id from public.green_render_candidates where project_id='74000000-0000-4000-8000-000000000001' and arrangement='drop-swap'),'70000000-0000-4000-8000-000000000004','keep',5,5,5,'fixture');
select public.review_green_render_candidate((select id from public.green_render_candidates where project_id='74000000-0000-4000-8000-000000000001' and arrangement='drop-swap'),'70000000-0000-4000-8000-000000000005','keep',5,5,5,'fixture');
select public.publish_green_track('71000000-0000-4000-8000-000000000001');
select public.publish_green_track('71000000-0000-4000-8000-000000000002');
select pg_temp.ok((select count(*)=2 from public.green_catalog_tracks where status='green'),'private audition bootstraps public catalog without bypassing reviews');

-- Normal creator journey: save -> render -> three candidates -> keep -> two reviews -> publish -> anonymous read -> fork.
select public.save_green_project('75000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000003','Fake hosted journey',jsonb_build_object('kind','catalog','leftId','71000000-0000-4000-8000-000000000001','rightId','71000000-0000-4000-8000-000000000002'),82,null,0);
select public.start_green_studio_render('75000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000003',1,'76000000-0000-4000-8000-000000000001',jsonb_build_object('targetBpm',128,'durationSeconds',15,'leftStartSeconds',0,'rightStartSeconds',0,'leftSemitones',0,'rightSemitones',0));
select pg_temp.ok((select jsonb_array_length(input->'assets')=8 and bool_and((asset->>'assetSha256') ~ '^[0-9a-f]{64}$') from public.green_processing_jobs j cross join lateral jsonb_array_elements(j.input->'assets') asset where j.project_id='75000000-0000-4000-8000-000000000001' group by j.id),'creator render manifest is immutable');
do $$
declare j public.green_processing_jobs%rowtype;
begin
 select * into j from public.claim_green_processing_job((select id from public.green_processing_jobs where project_id='75000000-0000-4000-8000-000000000001' order by created_at desc limit 1),900);
 perform public.complete_green_project_render_leased(j.id,j.dispatch_token,jsonb_build_array(
  jsonb_build_object('arrangement','vocal-a-over-b','asset',jsonb_build_object('blobUrl','https://fixture.invalid/user-a.wav','blobPathname','green-room/journey/user-a.wav','contentType','audio/wav','byteSize',2000,'sha256',repeat('f',64)),'durationSeconds',15,'qualityScore',0,'qualityStatus','manual_review','metrics',jsonb_build_object('integratedLufs',-14,'truePeakDb',-1.2)),
  jsonb_build_object('arrangement','vocal-b-over-a','asset',jsonb_build_object('blobUrl','https://fixture.invalid/user-b.wav','blobPathname','green-room/journey/user-b.wav','contentType','audio/wav','byteSize',2000,'sha256',repeat('0',64)),'durationSeconds',15,'qualityScore',0,'qualityStatus','manual_review','metrics',jsonb_build_object('integratedLufs',-14,'truePeakDb',-1.2)),
  jsonb_build_object('arrangement','drop-swap','asset',jsonb_build_object('blobUrl','https://fixture.invalid/user-c.wav','blobPathname','green-room/journey/user-c.wav','contentType','audio/wav','byteSize',2000,'sha256',repeat('9',64)),'durationSeconds',15,'qualityScore',0,'qualityStatus','manual_review','metrics',jsonb_build_object('integratedLufs',-14,'truePeakDb',-1.2))
 ));
end$$;
select public.select_green_project_candidate('75000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000003',(select id from public.green_render_candidates where project_id='75000000-0000-4000-8000-000000000001' and arrangement='drop-swap'),2);
select public.review_green_render_candidate((select selected_candidate_id from public.green_projects where id='75000000-0000-4000-8000-000000000001'),'70000000-0000-4000-8000-000000000004','keep',5,5,5,'fixture');
select public.review_green_render_candidate((select selected_candidate_id from public.green_projects where id='75000000-0000-4000-8000-000000000001'),'70000000-0000-4000-8000-000000000005','keep',5,5,5,'fixture');
select public.publish_green_studio_project('75000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000003',3);
select pg_temp.ok(public.get_green_publication('75000000-0000-4000-8000-000000000001') is not null,'published project is anonymously resolvable through the rights gate');
select public.fork_green_publication('75000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000006','75000000-0000-4000-8000-000000000002');
select pg_temp.ok((select status='draft' and parent_project_id='75000000-0000-4000-8000-000000000001' and selected_candidate_id is null from public.green_projects where id='75000000-0000-4000-8000-000000000002'),'fork starts clean and preserves lineage');
update public.green_rights_grants set revoked_at=now() where track_id='71000000-0000-4000-8000-000000000001';
select pg_temp.ok(public.get_green_publication('75000000-0000-4000-8000-000000000001') is null,'rights revocation closes public playback immediately');
rollback;
\echo Fake hosted journey passed: source evidence -> audition -> catalog -> render -> keep -> reviews -> publish -> listen -> fork -> revoke
