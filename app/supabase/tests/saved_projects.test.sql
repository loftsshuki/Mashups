-- Included inside the foundation fixture transaction, using its real roles/data.
set local role service_role;
create function pg_temp.save_recipe(p_creator uuid, p_revision integer, p_title text default 'Night mix') returns public.green_projects language sql as $$
  select public.save_green_project('40000000-0000-4000-8000-000000000001', p_creator, p_title,
    '{"kind":"prototype","leftId":"prototype-a","rightId":"prototype-b","catalogVersion":"test-v1"}', 82::smallint, 'drop-swap', p_revision);
$$;
select pg_temp.assert_true((pg_temp.save_recipe('00000000-0000-4000-8000-000000000003', 0)).revision = 1, 'first save returns durable revision');
select pg_temp.assert_true((pg_temp.save_recipe('00000000-0000-4000-8000-000000000003', 0)).revision = 1, 'identical first-save retry returns original receipt');
select pg_temp.assert_true((select title = 'Night mix' and status = 'draft' and selected_arrangement = 'drop-swap'
  and left_track_id is null and prototype_sources->>'leftId' = 'prototype-a'
  from public.green_projects where id = '40000000-0000-4000-8000-000000000001'), 'recipe and prototype source lineage persisted');
select pg_temp.assert_true((pg_temp.save_recipe('00000000-0000-4000-8000-000000000003', 1, 'Better mix')).revision = 2, 'owner updates the same project');
select pg_temp.assert_true((pg_temp.save_recipe('00000000-0000-4000-8000-000000000003', 1, 'Better mix')).revision = 2, 'identical update retry does not bump revision');
select pg_temp.expect_error($s$select pg_temp.save_recipe('00000000-0000-4000-8000-000000000004', 2, 'Stolen mix')$s$, '42501', 'another account cannot overwrite a known UUID');
select pg_temp.expect_error($s$select pg_temp.save_recipe('00000000-0000-4000-8000-000000000003', 1, 'Old tab')$s$, '40001', 'stale account revision rejected');
select pg_temp.expect_error($s$select pg_temp.save_recipe('00000000-0000-4000-8000-000000000003', 0, 'Duplicate create')$s$, '40001', 'retrying first save cannot overwrite a project');
select pg_temp.assert_true((select title = 'Better mix' and revision = 2 from public.green_projects where id = '40000000-0000-4000-8000-000000000001'), 'conflicts leave the last confirmed recipe intact');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000004', true);
select pg_temp.assert_true((select count(*) = 0 from public.green_projects where id = '40000000-0000-4000-8000-000000000001'), 'other users cannot read private recipes');
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000003', true);
select pg_temp.assert_true((select count(*) = 1 from public.green_projects where id = '40000000-0000-4000-8000-000000000001'), 'creator can read own recipe');
select pg_temp.expect_error($s$select public.save_green_project('40000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', 'Browser write', '{"kind":"prototype","leftId":"a","rightId":"b","catalogVersion":"v1"}', 82::smallint, null, 2)$s$, '42501', 'browser cannot bypass server manifest checks through RPC');
select pg_temp.expect_error($s$update public.green_projects set title = 'Direct write'$s$, '42501', 'browser cannot bypass revision checks');
set local role anon;
select pg_temp.expect_error($s$select * from public.green_projects$s$, '42501', 'anonymous users cannot read private recipes');

set local role service_role;
update public.green_projects set status = 'published' where id = '40000000-0000-4000-8000-000000000001';
select pg_temp.expect_error($s$select pg_temp.save_recipe('00000000-0000-4000-8000-000000000003', 2)$s$, '40001', 'published projects require a new copy');
update public.green_projects set status = 'draft' where id = '40000000-0000-4000-8000-000000000001';
insert into public.green_render_candidates(project_id, arrangement, duration_seconds, quality_score, quality_status) values ('40000000-0000-4000-8000-000000000001', 'drop_swap', 20, 95, 'passed');
select pg_temp.expect_error($s$select pg_temp.save_recipe('00000000-0000-4000-8000-000000000003', 2)$s$, '40001', 'rendered source lineage cannot be relabeled through recipe edits');

select pg_temp.expect_error($s$select public.save_green_project('40000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', 'Unknown revision', '{"kind":"prototype","leftId":"a","rightId":"b","catalogVersion":"v1"}', 82::smallint, null, 1)$s$, '40001', 'missing revision does not create a fresh row');
select pg_temp.expect_error($s$select public.save_green_project('40000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', 'Bad prototype', '{"kind":"prototype","leftId":"a","rightId":"a","catalogVersion":"v1"}', 82::smallint, null, 0)$s$, '23514', 'database rejects identical prototype sources');
select pg_temp.expect_error($s$select public.save_green_project('40000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', 'Missing prototype', '{"kind":"prototype","leftId":"a"}', 82::smallint, null, 0)$s$, '23514', 'database rejects missing prototype identifiers');
select pg_temp.expect_error($s$select public.save_green_project('40000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', 'Bad intensity', '{"kind":"prototype","leftId":"a","rightId":"b","catalogVersion":"v1"}', 0::smallint, null, 0)$s$, '22023', 'invalid energy cannot be stored');

select public.save_green_project('40000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', 'Real catalog recipe', '{"kind":"catalog","leftId":"10000000-0000-4000-8000-000000000001","rightId":"10000000-0000-4000-8000-000000000002"}', 90::smallint, null, 0);
select pg_temp.assert_true((select source_mode = 'catalog' and prototype_sources is null and left_track_id is not null from public.green_projects where id = '40000000-0000-4000-8000-000000000002'), 'real catalog recipes retain foreign key lineage');
update public.green_rights_grants set revoked_at = now() where track_id = '10000000-0000-4000-8000-000000000002';
select pg_temp.expect_error($s$select public.save_green_project('40000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', 'Stale rights', '{"kind":"catalog","leftId":"10000000-0000-4000-8000-000000000001","rightId":"10000000-0000-4000-8000-000000000002"}', 90::smallint, null, 1)$s$, 'P0001', 'catalog rights rechecked atomically on save');
select pg_temp.assert_true((select title = 'Real catalog recipe' and revision = 1 from public.green_projects where id = '40000000-0000-4000-8000-000000000002'), 'rights failure rolls back recipe changes');
\echo Saved project identity, ownership, revision and source protections passed
