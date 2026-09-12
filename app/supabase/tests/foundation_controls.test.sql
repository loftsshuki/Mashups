\set ON_ERROR_STOP on

-- Minimal Supabase prerequisites in a disposable database. The actual catalog
-- migrations run unchanged; authorization assertions use real PostgreSQL roles.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
create table public.rightsholder_organizations (id uuid primary key);
grant usage on schema public, auth to anon, authenticated, service_role;
-- Reproduce permissive prior grants so tests verify migration 025 removes them.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

\ir ../migrations/024_green_room_pilot.sql
insert into public.green_funnel_events(event_name, session_id) values ('create_viewed', 'legacy-visitor');
\ir ../migrations/025_foundation_controls.sql
\ir ../migrations/026_saved_projects.sql

begin;
create function pg_temp.assert_true(p_value boolean, p_label text) returns void language plpgsql as $$
begin
  if p_value is distinct from true then raise exception 'FAIL: %', p_label; end if;
end;
$$;
create function pg_temp.expect_error(p_sql text, p_state text, p_label text) returns void language plpgsql as $$
declare actual_state text;
begin
  begin
    execute p_sql;
  exception when others then
    get stacked diagnostics actual_state = returned_sqlstate;
  end;
  if actual_state is distinct from p_state then
    raise exception 'FAIL: % (expected %, received %)', p_label, p_state, coalesce(actual_state, 'success');
  end if;
end;
$$;

select pg_temp.assert_true((select visitor_id = 'legacy-visitor' from public.green_funnel_events), 'legacy identity backfill');
truncate public.green_funnel_events;
insert into auth.users(id) select ('00000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid from generate_series(1, 5) i;
set local role service_role;
insert into public.green_catalog_tracks(id, owner_id, slug, artist_name, track_title, genre, status, rights_status, quality_status, published_at) values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'pending-source', 'Owner One', 'Pending Source', 'Electronic', 'rights_review', 'pending', 'pending', null),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'approved-source', 'Owner Two', 'Approved Source', 'Electronic', 'green', 'verified', 'passed', now()),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 'private-source', 'Owner Two', 'Private Source', 'Electronic', 'draft', 'pending', 'pending', null);
insert into public.green_rights_grants(track_id, submitted_by, master_controller, composition_controller, master_control_confirmed, composition_control_confirmed, sample_status, stem_extraction_allowed, cross_track_derivatives_allowed, in_app_playback_allowed, verified_by, verified_at) values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Owner One', 'Owner One', true, false, 'sample_free', true, true, true, null, null),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'Owner Two', 'Owner Two', true, true, 'sample_free', true, true, true, '00000000-0000-4000-8000-000000000005', now());
insert into public.green_projects(id, creator_id, left_track_id, right_track_id) values
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
select pg_temp.assert_true((select count(*) = 2 from public.green_catalog_tracks), 'owner sees own submission and approved catalog only');
select pg_temp.assert_true((select count(*) = 1 from public.green_rights_grants), 'owner cannot read other grants');
select pg_temp.expect_error($s$update public.green_catalog_tracks set status = 'green', rights_status = 'verified', quality_status = 'passed', published_at = now() where slug = 'pending-source'$s$, '42501', 'owner cannot approve own track');
select pg_temp.expect_error($s$update public.green_catalog_tracks set owner_id = '00000000-0000-4000-8000-000000000002' where slug = 'pending-source'$s$, '42501', 'owner cannot reassign track');
select pg_temp.expect_error($s$delete from public.green_catalog_tracks where slug = 'pending-source'$s$, '42501', 'owner cannot bypass withdrawal workflow');
select pg_temp.expect_error($s$insert into public.green_catalog_tracks(owner_id, slug, artist_name, track_title, genre) values ('00000000-0000-4000-8000-000000000001', 'bypass', 'Bypass Artist', 'Bypass Track', 'Electronic')$s$, '42501', 'browser cannot bypass intake');
select pg_temp.expect_error($s$update public.green_rights_grants set verified_by = submitted_by, verified_at = now()$s$, '42501', 'browser cannot self-verify grant');
select pg_temp.expect_error($s$select public.verify_green_track_rights('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001')$s$, '42501', 'browser cannot invoke verification RPC');
select pg_temp.expect_error($s$select public.publish_green_track('10000000-0000-4000-8000-000000000001')$s$, '42501', 'browser cannot invoke publication RPC');
select pg_temp.expect_error($s$select public.get_green_pilot_metrics()$s$, '42501', 'browser cannot read private analytics');
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', true);
select pg_temp.assert_true((select count(*) = 1 from public.green_projects), 'creator can read project');
select pg_temp.expect_error($s$update public.green_projects set status = 'published'$s$, '42501', 'creator cannot publish by direct table update');

set local role anon;
select pg_temp.assert_true((select count(*) = 1 from public.green_catalog_tracks), 'anonymous sees only eligible catalog');
select pg_temp.expect_error($s$select * from public.green_rights_grants$s$, '42501', 'anonymous cannot read rights evidence');
select pg_temp.expect_error($s$insert into public.green_funnel_events(event_name, session_id) values ('create_viewed', 'fake-session')$s$, '42501', 'anonymous cannot bypass event validation');
\echo Catalog role isolation passed

set local role service_role;
update public.green_rights_grants set starts_at = now() - interval '3 days', ends_at = now() - interval '1 day' where track_id = '10000000-0000-4000-8000-000000000002';
select pg_temp.assert_true((select count(*) = 0 from public.get_green_public_catalog()), 'expired grant hidden even from server catalog');
set local role anon;
select pg_temp.assert_true((select count(*) = 0 from public.green_catalog_tracks), 'expired grant hidden by RLS');
set local role service_role;
update public.green_rights_grants set ends_at = null, starts_at = now() + interval '1 day' where track_id = '10000000-0000-4000-8000-000000000002';
select pg_temp.assert_true((select count(*) = 0 from public.get_green_public_catalog()), 'future grant hidden');
update public.green_rights_grants set starts_at = now(), revoked_at = now() where track_id = '10000000-0000-4000-8000-000000000002';
select pg_temp.assert_true((select count(*) = 0 from public.get_green_public_catalog()), 'revoked grant hidden');
update public.green_rights_grants set revoked_at = null, territories = array['US'] where track_id = '10000000-0000-4000-8000-000000000002';
select pg_temp.assert_true((select count(*) = 0 from public.get_green_public_catalog()), 'regional grant hidden from global catalog');
update public.green_rights_grants set territories = array['Worldwide'], verified_at = null where track_id = '10000000-0000-4000-8000-000000000002';
select pg_temp.assert_true((select count(*) = 0 from public.get_green_public_catalog()), 'unverified grant hidden despite approved track flags');
update public.green_rights_grants set verified_at = now(), cross_track_derivatives_allowed = false where track_id = '10000000-0000-4000-8000-000000000002';
select pg_temp.assert_true((select count(*) = 0 from public.get_green_public_catalog()), 'missing derivative permission hidden');
update public.green_rights_grants set cross_track_derivatives_allowed = true where track_id = '10000000-0000-4000-8000-000000000002';
select pg_temp.assert_true((select count(*) = 1 from public.get_green_public_catalog()), 'active permitted catalog restored');
\echo Active grant enforcement passed

select pg_temp.expect_error($s$select public.verify_green_track_rights('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000005')$s$, 'P0001', 'incomplete evidence prevents verification');
update public.green_rights_grants set composition_control_confirmed = true where track_id = '10000000-0000-4000-8000-000000000001';
select pg_temp.expect_error($s$select public.verify_green_track_rights('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000099')$s$, '23503', 'invalid reviewer rolls back approval');
select pg_temp.assert_true((select rights_status = 'pending' from public.green_catalog_tracks where slug = 'pending-source'), 'failed verification does not change track state');
select pg_temp.assert_true((select verified_at is null from public.green_rights_grants where track_id = '10000000-0000-4000-8000-000000000001'), 'failed verification does not change grant state');
select public.verify_green_track_rights('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000005');
select pg_temp.assert_true((select rights_status = 'verified' and status = 'processing' from public.green_catalog_tracks where slug = 'pending-source'), 'service verification atomically advances track');
select pg_temp.expect_error($s$select public.publish_green_track('10000000-0000-4000-8000-000000000001')$s$, 'P0001', 'publication requires passing state');
update public.green_catalog_tracks set quality_status = 'passed', status = 'listening_review' where slug = 'pending-source';
select pg_temp.expect_error($s$select public.publish_green_track('10000000-0000-4000-8000-000000000001')$s$, 'P0001', 'quality flags cannot substitute for analysis');
insert into public.green_track_analysis(track_id, bpm, musical_key, camelot_key, integrated_lufs, true_peak_db, phrase_confidence, sample_scan_status) values
  ('10000000-0000-4000-8000-000000000001', 124, 'C major', '8B', -14, -1.2, 0.5, 'clear');
select pg_temp.expect_error($s$select public.publish_green_track('10000000-0000-4000-8000-000000000001')$s$, 'P0001', 'failing audio prevents publication');
update public.green_track_analysis set phrase_confidence = 0.95;
insert into public.green_render_candidates(id, project_id, arrangement, duration_seconds, quality_score, quality_status) values
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'vocal_a_beat_b', 20, 95, 'passed'),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'vocal_b_beat_a', 20, 95, 'passed');
insert into public.green_listening_reviews(candidate_id, reviewer_id, decision, musicality, artifact_score, share_confidence) values
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', 'keep', 5, 5, 5),
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', 'keep', 5, 5, 5);
select pg_temp.expect_error($s$select public.publish_green_track('10000000-0000-4000-8000-000000000001')$s$, 'P0001', 'one reviewer across candidates is not independent');
delete from public.green_listening_reviews where candidate_id = '30000000-0000-4000-8000-000000000002';
insert into public.green_listening_reviews(candidate_id, reviewer_id, decision, musicality, artifact_score, share_confidence) values
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000004', 'keep', 5, 5, 5),
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'keep', 5, 5, 5),
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'keep', 5, 5, 5);
select pg_temp.expect_error($s$select public.publish_green_track('10000000-0000-4000-8000-000000000001')$s$, 'P0001', 'split reviews and owner/creator reviews do not pass');
insert into public.green_listening_reviews(candidate_id, reviewer_id, decision, musicality, artifact_score, share_confidence) values
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', 'keep', 5, 5, 5);
update public.green_render_candidates set quality_status = 'failed' where id = '30000000-0000-4000-8000-000000000002';
select pg_temp.expect_error($s$select public.publish_green_track('10000000-0000-4000-8000-000000000001')$s$, 'P0001', 'reviews cannot override a failed candidate');
update public.green_render_candidates set quality_status = 'passed' where id = '30000000-0000-4000-8000-000000000002';
update public.green_rights_grants set revoked_at = now() where track_id = '10000000-0000-4000-8000-000000000001';
select pg_temp.expect_error($s$select public.publish_green_track('10000000-0000-4000-8000-000000000001')$s$, 'P0001', 'rights rechecked at publication');
update public.green_rights_grants set revoked_at = null where track_id = '10000000-0000-4000-8000-000000000001';
select public.publish_green_track('10000000-0000-4000-8000-000000000001');
select pg_temp.assert_true((select status = 'green' and published_at is not null from public.green_catalog_tracks where slug = 'pending-source'), 'independent reviews and valid evidence permit publication');
\echo Atomic verification and publication gates passed

select pg_temp.assert_true(public.get_green_pilot_metrics()->'d30RetentionRate' = 'null'::jsonb, 'empty cohort is unknown, not zero retention');
insert into public.green_funnel_events(event_name, session_id) select event_name, 'event-contract-session' from unnest(array[
  'create_viewed', 'source_previewed', 'pair_selected', 'preflight_rejected', 'render_started', 'render_completed', 'candidate_played', 'candidate_kept', 'preview_downloaded', 'video_export_started', 'video_export_completed', 'video_export_failed', 'share_started', 'pwa_installed', 'audio_interrupted', 'audio_recovered'
]) event_name;
select pg_temp.assert_true((select count(*) = 16 and bool_and(visitor_id = session_id) from public.green_funnel_events), 'all events and legacy clients persist');
select pg_temp.expect_error($s$insert into public.green_funnel_events(event_name, session_id) values ('invented', 'session-invalid')$s$, '23514', 'unknown database event rejected');
insert into public.green_funnel_events(event_id, event_name, session_id) values ('40000000-0000-4000-8000-000000000001', 'create_viewed', 'retry-session');
insert into public.green_funnel_events(event_id, event_name, session_id) values ('40000000-0000-4000-8000-000000000001', 'create_viewed', 'retry-session') on conflict (event_id) do nothing;
select pg_temp.assert_true((select count(*) = 1 from public.green_funnel_events where session_id = 'retry-session'), 'retried event counted once');
truncate public.green_funnel_events;
insert into public.green_funnel_events(event_name, session_id, visitor_id) select 'create_viewed', 'bulk-session-' || i, 'bulk-visitor-' || i from generate_series(1, 1100) i;
insert into public.green_funnel_events(event_name, session_id, visitor_id) values
  ('render_started', 'bulk-session-1', 'bulk-visitor-1'), ('render_started', 'bulk-session-1', 'bulk-visitor-1'),
  ('render_completed', 'bulk-session-1', 'bulk-visitor-1'), ('render_completed', 'bulk-session-1', 'bulk-visitor-1'),
  ('candidate_kept', 'bulk-session-1', 'bulk-visitor-1'), ('candidate_kept', 'bulk-session-1', 'bulk-visitor-1'),
  ('render_started', 'bulk-session-2', 'bulk-visitor-2'), ('render_completed', 'bulk-session-3', 'bulk-visitor-3'),
  ('share_started', 'bulk-session-1', 'bulk-visitor-1'), ('share_started', 'bulk-session-1', 'bulk-visitor-1');
insert into public.green_funnel_events(event_name, session_id, properties) values ('share_started', 'bulk-session-2', '{"destination":"publish_signup"}');
select pg_temp.assert_true((public.get_green_pilot_metrics()->>'sessions')::int = 1100, 'metrics exceed REST 1000-row limit');
select pg_temp.assert_true((public.get_green_pilot_metrics()->>'rendersStarted')::int = 3, 'raw render count retained');
select pg_temp.assert_true((public.get_green_pilot_metrics()->>'sharesStarted')::int = 2, 'signup clicks excluded from sharing');
select pg_temp.assert_true((public.get_green_pilot_metrics()->>'renderCompletionRate')::numeric = 0.5, 'completion pairs activity sessions');
select pg_temp.assert_true((public.get_green_pilot_metrics()->>'keepRate')::numeric = 0.5, 'keep rate counts distinct completed sessions');
select pg_temp.assert_true((public.get_green_pilot_metrics()->>'shareRate')::numeric = 0.001, 'sharing rate counts distinct viewed sessions');

truncate public.green_funnel_events;
insert into public.green_funnel_events(event_name, session_id, visitor_id, occurred_at) values
  ('create_viewed', 'cohort-return-start', 'visitor-return', ((now() at time zone 'UTC')::date - 35)::timestamp at time zone 'UTC'),
  ('create_viewed', 'cohort-return-new-session', 'visitor-return', ((now() at time zone 'UTC')::date - 5)::timestamp at time zone 'UTC'),
  ('create_viewed', 'cohort-late-start', 'visitor-late', ((now() at time zone 'UTC')::date - 35)::timestamp at time zone 'UTC'),
  ('create_viewed', 'cohort-late-day31', 'visitor-late', ((now() at time zone 'UTC')::date - 4)::timestamp at time zone 'UTC'),
  ('create_viewed', 'cohort-no-return', 'visitor-absent', ((now() at time zone 'UTC')::date - 31)::timestamp at time zone 'UTC'),
  ('create_viewed', 'cohort-today-start', 'visitor-incomplete', ((now() at time zone 'UTC')::date - 30)::timestamp at time zone 'UTC'),
  ('create_viewed', 'cohort-today-return', 'visitor-incomplete', now());
select pg_temp.assert_true((public.get_green_pilot_metrics()->>'d30Eligible')::int = 3, 'only fully observed D30 cohorts eligible');
select pg_temp.assert_true((public.get_green_pilot_metrics()->>'d30Retained')::int = 1, 'D30 return across sessions counts; day31 does not');
select pg_temp.assert_true((public.get_green_pilot_metrics()->>'d30RetentionRate')::numeric = 0.333, 'retention denominator includes non-returners');
\echo Durable events and cohort metrics passed
\ir saved_projects.test.sql
rollback;
\echo All foundation database checks passed
