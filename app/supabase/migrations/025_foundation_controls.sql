-- Server-controlled catalog admission and durable, deduplicated telemetry.
begin;

drop policy if exists "owners manage green submissions" on public.green_catalog_tracks;
create policy "owners read green submissions" on public.green_catalog_tracks
  for select to authenticated using (owner_id = (select auth.uid()));

drop policy if exists "creators manage their green projects" on public.green_projects;
create policy "creators read their green projects" on public.green_projects
  for select to authenticated using (creator_id = (select auth.uid()));

-- Intake, review, processing, publication and events use authenticated server
-- routes. Browser credentials must never write approval or publication state.
revoke all on table public.green_catalog_tracks, public.green_rights_grants,
  public.green_track_assets, public.green_processing_jobs, public.green_track_analysis,
  public.green_projects, public.green_render_candidates, public.green_listening_reviews,
  public.green_funnel_events, public.green_beta_invites from anon, authenticated;
grant select on public.green_catalog_tracks to anon, authenticated;
grant select on public.green_rights_grants, public.green_track_assets,
  public.green_projects, public.green_render_candidates to authenticated;
grant all on table public.green_catalog_tracks, public.green_rights_grants,
  public.green_track_assets, public.green_processing_jobs, public.green_track_analysis,
  public.green_projects, public.green_render_candidates, public.green_listening_reviews,
  public.green_funnel_events, public.green_beta_invites to service_role;
revoke all on sequence public.green_funnel_events_id_seq from anon, authenticated;
grant usage, select on sequence public.green_funnel_events_id_seq to service_role;

-- The public catalog is global. Regional grants stay private until the delivery
-- path can enforce territory. This helper reveals only public eligibility.
create function public.green_track_has_active_grant(p_track_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.green_rights_grants g
    where g.track_id = p_track_id
      and g.verified_by is not null and g.verified_at is not null
      and g.revoked_at is null and g.starts_at <= now()
      and (g.ends_at is null or g.ends_at > now())
      and g.master_control_confirmed and g.composition_control_confirmed
      and g.sample_status in ('sample_free', 'cleared_samples')
      and g.stem_extraction_allowed and g.cross_track_derivatives_allowed
      and g.in_app_playback_allowed and not g.standalone_audio_export_allowed
      and 'Worldwide' = any(g.territories)
  );
$$;
revoke all on function public.green_track_has_active_grant(uuid) from public;
grant execute on function public.green_track_has_active_grant(uuid) to anon, authenticated, service_role;

drop policy if exists "green catalog is publicly readable" on public.green_catalog_tracks;
create policy "green catalog is publicly readable" on public.green_catalog_tracks
  for select to anon, authenticated using (
    status = 'green' and rights_status = 'verified' and quality_status = 'passed'
    and public.green_track_has_active_grant(id)
  );

-- Server reads must apply the same gate even though service_role bypasses RLS.
create function public.get_green_public_catalog()
returns setof public.green_catalog_tracks
language sql stable security invoker set search_path = '' as $$
  select t.* from public.green_catalog_tracks t
  where t.status = 'green' and t.rights_status = 'verified'
    and t.quality_status = 'passed' and public.green_track_has_active_grant(t.id)
  order by t.published_at desc;
$$;
revoke all on function public.get_green_public_catalog() from public, anon, authenticated;
grant execute on function public.get_green_public_catalog() to service_role;

-- These RPCs run only after the application checks the administrator allowlist.
-- Locks and updates share a transaction, so failures cannot leave half an approval.
create function public.verify_green_track_rights(p_track_id uuid, p_reviewer_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  grant_row public.green_rights_grants%rowtype;
begin
  perform id from public.green_catalog_tracks where id = p_track_id for update;
  select * into grant_row from public.green_rights_grants where track_id = p_track_id for update;
  if not found or p_reviewer_id is null then
    raise exception 'Rights grant and reviewer are required.';
  end if;
  if not grant_row.master_control_confirmed or not grant_row.composition_control_confirmed
    or grant_row.sample_status not in ('sample_free', 'cleared_samples')
    or not grant_row.stem_extraction_allowed or not grant_row.cross_track_derivatives_allowed
    or not grant_row.in_app_playback_allowed or grant_row.standalone_audio_export_allowed
    or cardinality(grant_row.territories) = 0 or grant_row.revoked_at is not null
    or (grant_row.ends_at is not null and grant_row.ends_at <= now()) then
    raise exception 'Rights evidence or permitted uses are incomplete or inactive.';
  end if;
  update public.green_rights_grants set verified_by = p_reviewer_id,
    verified_at = now(), updated_at = now() where track_id = p_track_id;
  update public.green_catalog_tracks set rights_status = 'verified',
    status = 'processing', updated_at = now() where id = p_track_id;
end;
$$;

create function public.publish_green_track(p_track_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  track_row public.green_catalog_tracks%rowtype;
begin
  select * into track_row from public.green_catalog_tracks where id = p_track_id for update;
  perform id from public.green_rights_grants where track_id = p_track_id for update;
  if track_row.id is null or track_row.rights_status <> 'verified'
    or track_row.quality_status <> 'passed' or track_row.status not in ('listening_review', 'green')
    or not public.green_track_has_active_grant(p_track_id) then
    raise exception 'Publication requires reviewed, active rights and passing quality.';
  end if;
  if not exists (
    select 1 from public.green_track_analysis a where a.track_id = p_track_id
      and a.integrated_lufs between -15 and -13 and a.true_peak_db <= -1
      and (a.vocal_bleed_db is null or a.vocal_bleed_db <= -24)
      and (a.separation_sdr_db is null or a.separation_sdr_db >= 12)
      and a.phrase_confidence >= 0.85 and a.sample_scan_status = 'clear'
  ) then
    raise exception 'Publication requires passing audio analysis.';
  end if;
  if not exists (
    select c.id from public.green_render_candidates c
    join public.green_projects p on p.id = c.project_id
    join public.green_listening_reviews r on r.candidate_id = c.id
    where (p.left_track_id = p_track_id or p.right_track_id = p_track_id)
      and c.quality_status = 'passed' and r.decision = 'keep'
      and r.reviewer_id <> track_row.owner_id
      and r.reviewer_id is distinct from p.creator_id
    group by c.id having count(distinct r.reviewer_id) >= 2
  ) then
    raise exception 'Publication requires two independent keep reviews of the same passing candidate.';
  end if;
  update public.green_catalog_tracks set status = 'green',
    published_at = coalesce(published_at, now()), updated_at = now() where id = p_track_id;
end;
$$;
revoke all on function public.verify_green_track_rights(uuid, uuid), public.publish_green_track(uuid)
  from public, anon, authenticated;
grant execute on function public.verify_green_track_rights(uuid, uuid), public.publish_green_track(uuid)
  to service_role;

alter table public.green_funnel_events
  drop constraint green_funnel_events_event_name_check,
  add constraint green_funnel_events_event_name_check check (event_name in (
    'create_viewed', 'source_previewed', 'pair_selected', 'preflight_rejected',
    'render_started', 'render_completed', 'candidate_played', 'candidate_kept',
    'preview_downloaded', 'video_export_started', 'video_export_completed',
    'video_export_failed', 'share_started', 'pwa_installed',
    'audio_interrupted', 'audio_recovered'
  )),
  add column event_id uuid not null default gen_random_uuid(),
  add column visitor_id text check (char_length(visitor_id) between 8 and 120);

-- Legacy session IDs were persistent browser IDs. Preserve that identity while
-- new clients report a separate, expiring activity session.
update public.green_funnel_events set visitor_id = session_id;
create function public.set_green_event_identity()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.visitor_id := coalesce(new.visitor_id, new.session_id);
  return new;
end;
$$;
revoke all on function public.set_green_event_identity() from public, anon, authenticated;
create trigger green_event_identity_before_insert before insert on public.green_funnel_events
  for each row execute function public.set_green_event_identity();
alter table public.green_funnel_events alter column visitor_id set not null;
create unique index green_events_event_id_unique on public.green_funnel_events(event_id);
create index green_events_visitor_time_idx on public.green_funnel_events(visitor_id, occurred_at);

-- Aggregate in Postgres: REST row limits must not silently truncate pilot metrics.
-- D30 is a return on the 30th UTC calendar day, for fully observed cohorts only.
create function public.get_green_pilot_metrics(p_days integer default 30)
returns jsonb language sql stable security invoker set search_path = '' as $$
  with bounds as (
    select greatest(1, least(coalesce(p_days, 30), 90)) as days,
      (now() at time zone 'UTC')::date as today
  ), recent as (
    select e.* from public.green_funnel_events e, bounds b
    where e.occurred_at >= now() - b.days * interval '1 day'
  ), sessions as (
    select session_id,
      bool_or(event_name = 'create_viewed') as viewed,
      bool_or(event_name = 'render_started') as started,
      bool_or(event_name = 'render_completed') as completed,
      bool_or(event_name = 'candidate_kept') as kept,
      bool_or(event_name = 'share_started' and coalesce(properties->>'destination', '') <> 'publish_signup') as shared
    from recent group by session_id
  ), totals as (
    select count(*) filter (where viewed) as sessions,
      count(*) filter (where started) as started,
      count(*) filter (where started and completed) as completed,
      count(*) filter (where completed) as kept_base,
      count(*) filter (where completed and kept) as kept,
      count(*) filter (where viewed and shared) as shared
    from sessions
  ), first_seen as (
    select visitor_id, min((occurred_at at time zone 'UTC')::date) as first_day
    from public.green_funnel_events group by visitor_id
  ), eligible as (
    select f.* from first_seen f, bounds b
    where f.first_day + 30 < b.today and f.first_day + 30 >= b.today - b.days
  ), retention as (
    select count(*) as eligible, count(*) filter (where exists (
      select 1 from public.green_funnel_events e
      where e.visitor_id = c.visitor_id
        and e.occurred_at >= ((c.first_day + 30)::timestamp at time zone 'UTC')
        and e.occurred_at < ((c.first_day + 31)::timestamp at time zone 'UTC')
    )) as retained from eligible c
  )
  select jsonb_build_object(
    'available', true,
    'sessions', t.sessions,
    'rendersStarted', (select count(*) from recent where event_name = 'render_started'),
    'rendersCompleted', (select count(*) from recent where event_name = 'render_completed'),
    'candidatesKept', (select count(*) from recent where event_name = 'candidate_kept'),
    'sharesStarted', (select count(*) from recent where event_name = 'share_started' and coalesce(properties->>'destination', '') <> 'publish_signup'),
    'renderCompletionRate', coalesce(round(t.completed::numeric / nullif(t.started, 0), 3), 0),
    'keepRate', coalesce(round(t.kept::numeric / nullif(t.kept_base, 0), 3), 0),
    'shareRate', coalesce(round(t.shared::numeric / nullif(t.sessions, 0), 3), 0),
    'd30Eligible', r.eligible, 'd30Retained', r.retained,
    'd30RetentionRate', round(r.retained::numeric / nullif(r.eligible, 0), 3)
  ) from totals t cross join retention r;
$$;
revoke all on function public.get_green_pilot_metrics(integer) from public, anon, authenticated;
grant execute on function public.get_green_pilot_metrics(integer) to service_role;

commit;
