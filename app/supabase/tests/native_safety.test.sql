\set ON_ERROR_STOP on
\ir ../migrations/031_native_safety.sql
begin;
create function pg_temp.ok(value boolean,label text) returns void language plpgsql as $$begin if value is distinct from true then raise exception 'FAIL: %',label;end if;end;$$;
create function pg_temp.reject(sql text,expected text) returns void language plpgsql as $$declare actual text;begin begin execute sql;exception when others then get stacked diagnostics actual=returned_sqlstate;end;if actual is distinct from expected then raise exception 'Expected %, got %',expected,coalesce(actual,'success');end if;end;$$;
insert into auth.users(id) values
 ('81000000-0000-4000-8000-000000000001'),
 ('81000000-0000-4000-8000-000000000002'),
 ('81000000-0000-4000-8000-000000000003');
set local role service_role;
insert into public.green_projects(id,creator_id,title,source_mode,prototype_sources,status,published_at)
values('82000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000001','Safety fixture','prototype','{"leftId":"fixture-a","rightId":"fixture-b","catalogVersion":"fixture-v1"}','published',now());
select public.report_green_publication('81000000-0000-4000-8000-000000000002','82000000-0000-4000-8000-000000000001','other','fixture report');
select pg_temp.ok((select count(*)=1 from public.green_content_reports where reporter_id='81000000-0000-4000-8000-000000000002'),'report stored privately');
select public.set_green_publication_creator_block('81000000-0000-4000-8000-000000000002','82000000-0000-4000-8000-000000000001',true);
select pg_temp.ok((select count(*)=1 from public.green_user_blocks),'creator block stored');
select public.set_green_publication_creator_block('81000000-0000-4000-8000-000000000002','82000000-0000-4000-8000-000000000001',false);
select pg_temp.ok((select count(*)=0 from public.green_user_blocks),'creator unblock removes only that relationship');
select public.request_green_account_deletion('81000000-0000-4000-8000-000000000002',true);
select pg_temp.ok((select status='requested' from public.green_account_deletion_requests where user_id='81000000-0000-4000-8000-000000000002'),'deletion request recorded without deleting auth user');
select public.cancel_green_account_deletion('81000000-0000-4000-8000-000000000002');
select pg_temp.ok((select status='cancelled' from public.green_account_deletion_requests where user_id='81000000-0000-4000-8000-000000000002'),'deletion request can be cancelled before operator completion');
set local role authenticated;
select set_config('request.jwt.claim.sub','81000000-0000-4000-8000-000000000002',true);
select pg_temp.reject($s$insert into public.green_content_reports(reporter_id,category) values('81000000-0000-4000-8000-000000000002','other')$s$,'42501');
select pg_temp.reject($s$select public.request_green_account_deletion('81000000-0000-4000-8000-000000000002',true)$s$,'42501');
rollback;
\echo Native safety/report/block/deletion-request checks passed
