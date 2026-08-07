-- Growth Operating System: platform rails, autonomous allocation, rights supply,
-- payout escrow, city cells, fan A&R, paid amplification, venues, proof, and embargoes.

create table if not exists public.platform_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('spotify', 'tiktok', 'instagram', 'youtube')),
  provider_user_id text,
  handle text,
  status text not null default 'connected' check (status in ('connected', 'expired', 'action_required', 'revoked')),
  scopes text[] not null default '{}',
  encrypted_access_token text not null,
  encrypted_refresh_token text,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create table if not exists public.music_save_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  provider text not null check (provider in ('spotify', 'apple', 'youtube')),
  provider_track_id text,
  result text not null check (result in ('saved', 'redirected', 'failed')),
  anonymous_key text,
  created_at timestamptz not null default now()
);

create table if not exists public.growth_autopilot_runs (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  initiated_by uuid references public.profiles(id) on delete set null,
  trigger text not null check (trigger in ('schedule', 'operator', 'event_threshold')),
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  input_snapshot jsonb not null default '{}'::jsonb,
  summary jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.growth_autopilot_actions (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.growth_autopilot_runs(id) on delete cascade,
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  action_type text not null check (action_type in ('promote_genome', 'retire_genome', 'hold_for_signal', 'expand_city', 'raise_bounty', 'handoff_paid_media')),
  target_type text not null,
  target_id text not null,
  reason text not null,
  confidence numeric(5,2) not null check (confidence between 0 and 100),
  budget_delta_cents integer not null default 0,
  status text not null default 'proposed' check (status in ('proposed', 'executed', 'blocked', 'reversed')),
  guardrails jsonb not null default '{}'::jsonb,
  executed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.dynamic_bounty_offers (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  creator_id uuid references public.profiles(id) on delete cascade,
  city text not null,
  niche text not null,
  base_reward_cents integer not null check (base_reward_cents >= 0),
  multiplier numeric(5,2) not null default 1 check (multiplier between 1 and 3),
  reward_cents integer not null check (reward_cents >= 0),
  reason text not null,
  status text not null default 'offered' check (status in ('offered', 'accepted', 'qualified', 'expired', 'paid')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.creator_payout_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  provider text not null default 'stripe_connect' check (provider = 'stripe_connect'),
  provider_account_id text not null unique,
  onboarding_status text not null default 'pending' check (onboarding_status in ('pending', 'restricted', 'ready', 'disabled')),
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  country text,
  default_currency text not null default 'usd',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_escrow_entries (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  launch_id uuid references public.viral_launches(id) on delete set null,
  bounty_offer_id uuid references public.dynamic_bounty_offers(id) on delete set null,
  entry_type text not null check (entry_type in ('hold', 'release', 'payout', 'reversal')),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('pending', 'available', 'processing', 'paid', 'failed', 'reversed')),
  provider_transfer_id text unique,
  idempotency_key text not null unique,
  available_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.rightsholder_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  organization_type text not null check (organization_type in ('artist', 'label', 'publisher', 'distributor', 'manager')),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'restricted', 'rejected')),
  payout_terms jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rightsholder_members (
  organization_id uuid not null references public.rightsholder_organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'rights', 'analyst')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.supply_track_submissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.rightsholder_organizations(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id) on delete restrict,
  artist_name text not null,
  track_title text not null,
  isrc text,
  audio_url text not null,
  artwork_url text,
  release_at timestamptz,
  territories text[] not null default '{}',
  permitted_uses text[] not null default '{}',
  rights_status text not null default 'review' check (rights_status in ('review', 'verified', 'missing_party', 'rejected')),
  rights_attestation jsonb not null default '{}'::jsonb,
  launch_readiness integer not null default 0 check (launch_readiness between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_opportunity_snapshots (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  launch_id uuid references public.viral_launches(id) on delete cascade,
  performance_percentile numeric(5,2) not null default 0,
  reliability_score numeric(5,2) not null default 0,
  rights_standing numeric(5,2) not null default 0,
  follower_count integer not null default 0,
  opportunity_score numeric(5,2) not null default 0,
  explanation jsonb not null default '{}'::jsonb,
  calculated_at timestamptz not null default now()
);

create table if not exists public.city_campaign_cells (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  city text not null,
  country_code text not null,
  code text not null unique,
  captain_id uuid references public.profiles(id) on delete set null,
  creator_count integer not null default 0,
  qualified_posts integer not null default 0,
  saves integer not null default 0,
  score numeric(12,2) not null default 0,
  status text not null default 'recruiting' check (status in ('recruiting', 'active', 'won', 'closed')),
  created_at timestamptz not null default now(),
  unique (launch_id, city)
);

create table if not exists public.fan_ar_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  reputation integer not null default 500 check (reputation between 0 and 5000),
  correct_calls integer not null default 0,
  settled_calls integer not null default 0,
  current_streak integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.viral_predictions add column if not exists outcome text check (outcome in ('pending', 'correct', 'incorrect', 'void'));
alter table public.viral_predictions add column if not exists settled_at timestamptz;

create table if not exists public.paid_media_handoffs (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  genome_id uuid not null references public.viral_template_genomes(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete restrict,
  requested_by uuid not null references public.profiles(id) on delete restrict,
  organic_proof jsonb not null,
  consent_status text not null default 'pending' check (consent_status in ('pending', 'granted', 'declined', 'expired')),
  license_status text not null default 'pending' check (license_status in ('pending', 'cleared', 'blocked', 'expired')),
  spend_cap_cents integer not null default 0 check (spend_cap_cents >= 0),
  target_markets text[] not null default '{}',
  terms jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create table if not exists public.club_activations (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  code text not null unique,
  venue_name text not null,
  city text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reward text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'ended', 'canceled')),
  scans integer not null default 0,
  saves integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.club_activation_events (
  id uuid primary key default gen_random_uuid(),
  activation_id uuid not null references public.club_activations(id) on delete cascade,
  event_type text not null check (event_type in ('scan', 'save', 'share', 'join')),
  anonymous_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.launch_embed_keys (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  public_key text not null unique,
  allowed_origins text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now()
);

create table if not exists public.launch_embed_events (
  id uuid primary key default gen_random_uuid(),
  embed_key_id uuid not null references public.launch_embed_keys(id) on delete cascade,
  event_type text not null check (event_type in ('view', 'open', 'save', 'fork')),
  origin text,
  anonymous_key text,
  created_at timestamptz not null default now()
);

create table if not exists public.creator_passport_snapshots (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  verified_rights_uses integer not null default 0,
  qualified_campaigns integer not null default 0,
  lift_percentile integer not null default 0 check (lift_percentile between 0 and 100),
  reliability_score integer not null default 0 check (reliability_score between 0 and 100),
  fan_ar_reputation integer not null default 0,
  paid_media_cleared integer not null default 0,
  badges text[] not null default '{}',
  proof_manifest jsonb not null default '[]'::jsonb,
  calculated_at timestamptz not null default now()
);

create table if not exists public.pre_release_rooms (
  id uuid primary key default gen_random_uuid(),
  track_submission_id uuid not null references public.supply_track_submissions(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  slug text not null unique,
  name text not null,
  release_at timestamptz not null,
  embargo_status text not null default 'sealed' check (embargo_status in ('sealed', 'open', 'released', 'canceled')),
  seat_limit integer not null check (seat_limit between 1 and 10000),
  access_policy jsonb not null default '{}'::jsonb,
  feedback_prompts jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.pre_release_members (
  room_id uuid not null references public.pre_release_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'creator' check (role in ('creator', 'curator', 'artist', 'operator')),
  nda_accepted_at timestamptz,
  access_status text not null default 'invited' check (access_status in ('invited', 'accepted', 'revoked')),
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create table if not exists public.pre_release_feedback (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.pre_release_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  breakout_confidence integer not null check (breakout_confidence between 1 and 100),
  strongest_timestamp_sec integer check (strongest_timestamp_sec >= 0),
  feedback text not null,
  created_at timestamptz not null default now(),
  unique (room_id, user_id)
);

create index if not exists platform_connections_user_idx on public.platform_connections(user_id, status);
create index if not exists music_save_events_launch_idx on public.music_save_events(launch_id, created_at desc);
create index if not exists growth_autopilot_runs_launch_idx on public.growth_autopilot_runs(launch_id, started_at desc);
create index if not exists growth_autopilot_actions_launch_idx on public.growth_autopilot_actions(launch_id, created_at desc);
create index if not exists dynamic_bounties_creator_idx on public.dynamic_bounty_offers(creator_id, status, expires_at);
create index if not exists escrow_creator_idx on public.creator_escrow_entries(creator_id, status, created_at desc);
create index if not exists supply_tracks_org_idx on public.supply_track_submissions(organization_id, created_at desc);
create index if not exists opportunity_creator_idx on public.creator_opportunity_snapshots(creator_id, calculated_at desc);
create index if not exists city_cells_launch_score_idx on public.city_campaign_cells(launch_id, score desc);
create index if not exists paid_media_launch_idx on public.paid_media_handoffs(launch_id, license_status);
create index if not exists club_events_activation_idx on public.club_activation_events(activation_id, created_at desc);
create index if not exists passport_creator_idx on public.creator_passport_snapshots(creator_id, calculated_at desc);

alter table public.platform_connections enable row level security;
alter table public.music_save_events enable row level security;
alter table public.growth_autopilot_runs enable row level security;
alter table public.growth_autopilot_actions enable row level security;
alter table public.dynamic_bounty_offers enable row level security;
alter table public.creator_payout_accounts enable row level security;
alter table public.creator_escrow_entries enable row level security;
alter table public.rightsholder_organizations enable row level security;
alter table public.rightsholder_members enable row level security;
alter table public.supply_track_submissions enable row level security;
alter table public.creator_opportunity_snapshots enable row level security;
alter table public.city_campaign_cells enable row level security;
alter table public.fan_ar_profiles enable row level security;
alter table public.paid_media_handoffs enable row level security;
alter table public.club_activations enable row level security;
alter table public.club_activation_events enable row level security;
alter table public.launch_embed_keys enable row level security;
alter table public.launch_embed_events enable row level security;
alter table public.creator_passport_snapshots enable row level security;
alter table public.pre_release_rooms enable row level security;
alter table public.pre_release_members enable row level security;
alter table public.pre_release_feedback enable row level security;

create policy "Users manage own platform connections" on public.platform_connections for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users read own save history" on public.music_save_events for select using (user_id = auth.uid());
create policy "Launch owners read autopilot runs" on public.growth_autopilot_runs for select using (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()));
create policy "Launch owners read autopilot actions" on public.growth_autopilot_actions for select using (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()));
create policy "Creators see own bounty offers" on public.dynamic_bounty_offers for select using (creator_id = auth.uid() or exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()));
create policy "Creators read own payout account" on public.creator_payout_accounts for select using (user_id = auth.uid());
create policy "Creators read own escrow" on public.creator_escrow_entries for select using (creator_id = auth.uid());
create policy "Organization members read organizations" on public.rightsholder_organizations for select using (owner_id = auth.uid() or exists (select 1 from public.rightsholder_members m where m.organization_id = id and m.user_id = auth.uid()));
create policy "Owners manage organizations" on public.rightsholder_organizations for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Members read organization membership" on public.rightsholder_members for select using (user_id = auth.uid() or exists (select 1 from public.rightsholder_organizations o where o.id = organization_id and o.owner_id = auth.uid()));
create policy "Organization owners manage memberships" on public.rightsholder_members for all using (exists (select 1 from public.rightsholder_organizations o where o.id = organization_id and o.owner_id = auth.uid())) with check (exists (select 1 from public.rightsholder_organizations o where o.id = organization_id and o.owner_id = auth.uid()));
create policy "Members manage supply tracks" on public.supply_track_submissions for all using (exists (select 1 from public.rightsholder_members m where m.organization_id = organization_id and m.user_id = auth.uid() and m.role in ('owner', 'admin', 'rights'))) with check (exists (select 1 from public.rightsholder_members m where m.organization_id = organization_id and m.user_id = auth.uid() and m.role in ('owner', 'admin', 'rights')));
create policy "Creators read own opportunity score" on public.creator_opportunity_snapshots for select using (creator_id = auth.uid());
create policy "Public city campaign cells" on public.city_campaign_cells for select using (exists (select 1 from public.viral_launches l where l.id = launch_id and l.is_public));
create policy "Fans read own AR profile" on public.fan_ar_profiles for select using (user_id = auth.uid());
create policy "Paid media participants read handoffs" on public.paid_media_handoffs for select using (creator_id = auth.uid() or requested_by = auth.uid());
create policy "Creators update paid media consent" on public.paid_media_handoffs for update using (creator_id = auth.uid()) with check (creator_id = auth.uid());
create policy "Public live club activations" on public.club_activations for select using (status in ('scheduled', 'live'));
create policy "Owners manage embed keys" on public.launch_embed_keys for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Public passport proofs" on public.creator_passport_snapshots for select using (true);
create policy "Room members read pre-release rooms" on public.pre_release_rooms for select using (owner_id = auth.uid() or exists (select 1 from public.pre_release_members m where m.room_id = id and m.user_id = auth.uid() and m.access_status = 'accepted'));
create policy "Owners manage pre-release rooms" on public.pre_release_rooms for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Members read room membership" on public.pre_release_members for select using (user_id = auth.uid() or exists (select 1 from public.pre_release_rooms r where r.id = room_id and r.owner_id = auth.uid()));
create policy "Users accept own room invites" on public.pre_release_members for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Accepted members submit feedback" on public.pre_release_feedback for insert with check (user_id = auth.uid() and exists (select 1 from public.pre_release_members m where m.room_id = room_id and m.user_id = auth.uid() and m.access_status = 'accepted'));
create policy "Members read room feedback" on public.pre_release_feedback for select using (user_id = auth.uid() or exists (select 1 from public.pre_release_rooms r where r.id = room_id and r.owner_id = auth.uid()));

-- Anonymous save, venue, and embed events are written only through rate-limited server routes.
create or replace function public.record_club_activation_event(p_code text, p_event_type text, p_anonymous_key text, p_metadata jsonb default '{}'::jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_activation public.club_activations%rowtype; v_id uuid;
begin
  if p_event_type not in ('scan', 'save', 'share', 'join') then raise exception 'Unsupported club event'; end if;
  select * into v_activation from public.club_activations where code = p_code and status in ('scheduled', 'live') and ends_at > now() for update;
  if v_activation.id is null then raise exception 'Activation unavailable'; end if;
  insert into public.club_activation_events(activation_id, event_type, anonymous_key, metadata) values (v_activation.id, p_event_type, left(p_anonymous_key, 120), coalesce(p_metadata, '{}'::jsonb)) returning id into v_id;
  update public.club_activations set scans = scans + case when p_event_type = 'scan' then 1 else 0 end, saves = saves + case when p_event_type = 'save' then 1 else 0 end where id = v_activation.id;
  return v_id;
end; $$;

revoke all on function public.record_club_activation_event(text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.record_club_activation_event(text, text, text, jsonb) to service_role;

create or replace function public.accept_dynamic_bounty(p_offer_id uuid, p_creator_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare v_status text;
begin
  update public.dynamic_bounty_offers
    set creator_id = p_creator_id, status = 'accepted'
    where id = p_offer_id and status = 'offered' and expires_at > now() and (creator_id is null or creator_id = p_creator_id)
    returning status into v_status;
  if v_status = 'accepted' then return 'accepted'; end if;
  if exists (select 1 from public.dynamic_bounty_offers where id = p_offer_id and creator_id = p_creator_id and status = 'accepted') then return 'already_accepted'; end if;
  return 'unavailable';
end; $$;

revoke all on function public.accept_dynamic_bounty(uuid, uuid) from public, anon, authenticated;
grant execute on function public.accept_dynamic_bounty(uuid, uuid) to service_role;
