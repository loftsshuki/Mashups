-- Domination operating layer: commercial guarantees, causal measurement,
-- standardized rights, exclusive inventory, liquidity, trust, intelligence,
-- partner delivery, public index publishing, and service-credit protection.

create table if not exists public.guaranteed_launch_programs (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null unique references public.viral_launches(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  creator_test_floor integer not null check (creator_test_floor between 10 and 10000),
  qualified_post_floor integer not null check (qualified_post_floor between 1 and 10000),
  hook_genome_floor integer not null default 3 check (hook_genome_floor between 1 and 20),
  report_due_days integer not null default 14 check (report_due_days between 1 and 90),
  status text not null default 'configured' check (status in ('configured', 'active', 'completed', 'failed', 'settled')),
  deliverables jsonb not null default '[]'::jsonb,
  activated_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_experiments (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  hypothesis text not null,
  primary_metric text not null check (primary_metric in ('save_rate', 'follow_rate', 'stream_rate', 'qualified_post_rate')),
  assignment_unit text not null check (assignment_unit in ('visitor', 'creator', 'city')),
  status text not null default 'draft' check (status in ('draft', 'running', 'analyzing', 'completed', 'invalid')),
  started_at timestamptz,
  ended_at timestamptz,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_experiment_cohorts (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.campaign_experiments(id) on delete cascade,
  name text not null,
  cohort_type text not null check (cohort_type in ('treatment', 'control')),
  assignment_key text not null,
  visitor_count integer not null default 0 check (visitor_count >= 0),
  conversion_count integer not null default 0 check (conversion_count >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (experiment_id, cohort_type, assignment_key)
);

create table if not exists public.campaign_lift_snapshots (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.campaign_experiments(id) on delete cascade,
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  metric text not null,
  treatment_visitors integer not null,
  treatment_conversions integer not null,
  control_visitors integer not null,
  control_conversions integer not null,
  treatment_rate numeric not null,
  control_rate numeric not null,
  absolute_lift numeric not null,
  relative_lift numeric not null,
  confidence numeric not null check (confidence between 0 and 1),
  credible boolean not null default false,
  methodology_version text not null default 'mashups-lift-v1',
  calculated_at timestamptz not null default now()
);

create table if not exists public.growth_license_templates (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  version text not null,
  title text not null,
  terms_markdown text not null,
  permitted_uses text[] not null default '{}',
  derivative_policy text not null,
  takedown_sla_hours integer not null default 24 check (takedown_sla_hours between 1 and 720),
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (code, version)
);

create table if not exists public.growth_license_agreements (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.growth_license_templates(id) on delete restrict,
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  track_submission_id uuid not null references public.supply_track_submissions(id) on delete restrict,
  organization_id uuid not null references public.rightsholder_organizations(id) on delete restrict,
  offered_by uuid not null references public.profiles(id) on delete restrict,
  accepted_by uuid references public.profiles(id) on delete restrict,
  status text not null default 'offered' check (status in ('draft', 'offered', 'accepted', 'expired', 'terminated')),
  territories text[] not null default '{}',
  term_days integer not null check (term_days between 1 and 3650),
  paid_media_cap_cents integer not null default 0 check (paid_media_cap_cents >= 0),
  economics jsonb not null default '{}'::jsonb,
  terms_snapshot jsonb not null,
  verification_code text not null unique,
  offered_at timestamptz not null default now(),
  accepted_at timestamptz,
  expires_at timestamptz not null
);

create table if not exists public.inventory_exclusivity_windows (
  id uuid primary key default gen_random_uuid(),
  track_submission_id uuid not null references public.supply_track_submissions(id) on delete cascade,
  organization_id uuid not null references public.rightsholder_organizations(id) on delete cascade,
  exclusivity_type text not null check (exclusivity_type in ('campaign', 'category', 'platform', 'territory')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  territories text[] not null default '{}',
  categories text[] not null default '{}',
  campaign_slot_limit integer not null default 1 check (campaign_slot_limit > 0),
  campaign_slots_used integer not null default 0 check (campaign_slots_used >= 0),
  status text not null default 'active' check (status in ('proposed', 'active', 'expired', 'terminated')),
  economics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (campaign_slots_used <= campaign_slot_limit)
);

create table if not exists public.creator_liquidity_snapshots (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  niche text not null,
  qualified_creators integer not null default 0,
  open_briefs integer not null default 0,
  median_accept_minutes integer not null default 0,
  fill_rate numeric not null default 0 check (fill_rate between 0 and 1),
  pressure text not null check (pressure in ('balanced', 'creator_shortage', 'brief_shortage')),
  calculated_at timestamptz not null default now()
);

create table if not exists public.scene_programs (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  country_code text not null,
  code text not null unique,
  genre text not null,
  status text not null default 'recruiting' check (status in ('recruiting', 'live', 'graduated', 'paused')),
  captain_target integer not null default 2,
  venue_target integer not null default 3,
  creator_target integer not null default 50,
  strategy jsonb not null default '{}'::jsonb,
  starts_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.scene_program_members (
  scene_program_id uuid not null references public.scene_programs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('captain', 'creator', 'venue', 'operator')),
  status text not null default 'active' check (status in ('invited', 'active', 'paused', 'removed')),
  joined_at timestamptz not null default now(),
  primary key (scene_program_id, user_id)
);

create table if not exists public.amplification_allocations (
  id uuid primary key default gen_random_uuid(),
  handoff_id uuid not null unique references public.paid_media_handoffs(id) on delete cascade,
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete restrict,
  recommended_spend_cents integer not null check (recommended_spend_cents >= 0),
  approved_spend_cents integer not null default 0 check (approved_spend_cents >= 0),
  creator_usage_fee_cents integer not null default 0 check (creator_usage_fee_cents >= 0),
  performance_bonus_bps integer not null default 0 check (performance_bonus_bps between 0 and 10000),
  status text not null default 'nominated' check (status in ('nominated', 'awaiting_consent', 'approved', 'running', 'completed', 'blocked')),
  outcome jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artist_participation_contracts (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null unique references public.viral_launches(id) on delete cascade,
  artist_name text not null,
  organization_id uuid references public.rightsholder_organizations(id) on delete set null,
  status text not null default 'offered' check (status in ('draft', 'offered', 'accepted', 'completed', 'breached', 'waived')),
  terms_snapshot jsonb not null default '{}'::jsonb,
  offered_by uuid not null references public.profiles(id) on delete restrict,
  accepted_by uuid references public.profiles(id) on delete restrict,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.artist_participation_obligations (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.artist_participation_contracts(id) on delete cascade,
  action text not null,
  required_count integer not null check (required_count > 0),
  completed_count integer not null default 0 check (completed_count >= 0),
  due_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'complete', 'late', 'waived')),
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.rightsholder_organizations(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('linkfire', 'featurefm', 'distributor', 'ad_platform')),
  status text not null default 'not_connected' check (status in ('connected', 'action_required', 'not_connected', 'disabled')),
  encrypted_credentials text,
  capabilities text[] not null default '{}',
  settings jsonb not null default '{}'::jsonb,
  last_delivery_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, provider)
);

create table if not exists public.partner_delivery_events (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.partner_integrations(id) on delete cascade,
  launch_id uuid references public.viral_launches(id) on delete cascade,
  delivery_type text not null,
  idempotency_key text not null unique,
  status text not null default 'pending' check (status in ('pending', 'delivered', 'failed', 'retrying')),
  request_manifest jsonb not null default '{}'::jsonb,
  response_manifest jsonb not null default '{}'::jsonb,
  error_message text,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.trust_assessments (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('creator', 'track', 'post', 'launch', 'organization')),
  subject_id text not null,
  launch_id uuid references public.viral_launches(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  level text not null check (level in ('verified', 'review', 'restricted')),
  methodology_version text not null default 'mashups-trust-v1',
  input_snapshot jsonb not null,
  signals jsonb not null default '[]'::jsonb,
  assessed_at timestamptz not null default now()
);

create table if not exists public.mashups_index_editions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  period_start date not null,
  period_end date not null,
  methodology_version text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'retracted')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  check (period_end >= period_start)
);

create table if not exists public.mashups_index_entries (
  edition_id uuid not null references public.mashups_index_editions(id) on delete cascade,
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  rank integer not null check (rank > 0),
  breakout_score numeric not null check (breakout_score between 0 and 100),
  movement integer not null default 0,
  strongest_city text,
  strongest_hook_sec integer,
  incremental_save_lift numeric not null default 0,
  creator_k_factor numeric not null default 0,
  evidence_manifest jsonb not null default '{}'::jsonb,
  primary key (edition_id, launch_id),
  unique (edition_id, rank)
);

create table if not exists public.ar_intelligence_reports (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  breakout_probability integer not null check (breakout_probability between 0 and 100),
  strongest_hook_sec integer not null check (strongest_hook_sec >= 0),
  recommended_niche text not null,
  recommended_city text not null,
  expected_qpa_cents integer not null check (expected_qpa_cents >= 0),
  paid_readiness integer not null check (paid_readiness between 0 and 100),
  explanation jsonb not null default '[]'::jsonb,
  methodology_version text not null default 'mashups-ar-v1',
  generated_at timestamptz not null default now()
);

create table if not exists public.commercial_offers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  organization_id uuid references public.rightsholder_organizations(id) on delete set null,
  tier text not null check (tier in ('pilot', 'growth', 'label_os')),
  target_creators integer not null check (target_creators > 0),
  platform_fee_cents integer not null check (platform_fee_cents >= 0),
  creator_budget_cents integer not null check (creator_budget_cents >= 0),
  media_budget_cents integer not null check (media_budget_cents >= 0),
  operations_fee_cents integer not null check (operations_fee_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  deliverables jsonb not null default '[]'::jsonb,
  status text not null default 'quoted' check (status in ('quoted', 'offered', 'accepted', 'expired', 'canceled')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.launch_protection_policies (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null unique references public.viral_launches(id) on delete cascade,
  commercial_offer_id uuid not null references public.commercial_offers(id) on delete restrict,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  status text not null check (status in ('eligible', 'conditional', 'ineligible', 'protected', 'claimed', 'credited', 'expired')),
  service_credit_cents integer not null default 0 check (service_credit_cents >= 0),
  conditions jsonb not null default '[]'::jsonb,
  terms_snapshot jsonb not null,
  protected_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.launch_protection_claims (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.launch_protection_policies(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete restrict,
  reason text not null,
  evidence_manifest jsonb not null,
  status text not null default 'submitted' check (status in ('submitted', 'reviewing', 'approved', 'declined', 'credited')),
  decision_reason text,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

insert into public.growth_license_templates (
  code,
  version,
  title,
  terms_markdown,
  permitted_uses,
  derivative_policy,
  takedown_sla_hours,
  is_active
) values (
  'MGL',
  '1.0',
  'Mashups Growth License',
  'The rightsholder grants Mashups a limited, non-transferable right to coordinate attributed short-form creator campaigns for the covered recording during the stated term and territories. Ownership remains with the rightsholder. Cleared campaign derivatives may be used only for campaign execution and may not be distributed as standalone recordings to digital service providers. Paid amplification may not exceed the agreement cap. Mashups must maintain attribution and evidence records and honor a valid takedown request within the stated service level. Any broader use requires a new written grant.',
  array['Organic short-form', '15-second hook cuts', 'Creator whitelisting', 'Paid social within agreement cap', 'Attributed remix forks'],
  'Campaign derivatives only; no standalone DSP distribution.',
  24,
  true
) on conflict (code, version) do nothing;

insert into public.scene_programs (city, country_code, code, genre, status, captain_target, venue_target, creator_target, strategy, starts_at) values
  ('Miami', 'US', 'MIA-HOUSE', 'Electronic', 'recruiting', 3, 5, 75, '{"beachhead":"EDM/House","motion":"nightlife"}'::jsonb, now()),
  ('London', 'GB', 'LDN-HOUSE', 'Electronic', 'recruiting', 3, 5, 75, '{"beachhead":"EDM/House","motion":"fashion"}'::jsonb, now()),
  ('Berlin', 'DE', 'BER-HOUSE', 'Electronic', 'recruiting', 3, 5, 75, '{"beachhead":"EDM/House","motion":"club"}'::jsonb, now()),
  ('New York', 'US', 'NYC-HOUSE', 'Electronic', 'recruiting', 3, 5, 75, '{"beachhead":"EDM/House","motion":"culture"}'::jsonb, now()),
  ('Los Angeles', 'US', 'LAX-HOUSE', 'Electronic', 'recruiting', 3, 5, 75, '{"beachhead":"EDM/House","motion":"creator"}'::jsonb, now())
on conflict (code) do nothing;

create index if not exists campaign_experiments_launch_idx on public.campaign_experiments(launch_id, created_at desc);
create index if not exists campaign_lift_launch_idx on public.campaign_lift_snapshots(launch_id, calculated_at desc);
create index if not exists growth_license_launch_idx on public.growth_license_agreements(launch_id, status);
create index if not exists inventory_exclusivity_active_idx on public.inventory_exclusivity_windows(status, ends_at);
create index if not exists liquidity_cell_idx on public.creator_liquidity_snapshots(city, niche, calculated_at desc);
create index if not exists scene_program_status_idx on public.scene_programs(status, genre);
create index if not exists partner_delivery_launch_idx on public.partner_delivery_events(launch_id, created_at desc);
create index if not exists trust_subject_idx on public.trust_assessments(subject_type, subject_id, assessed_at desc);
create index if not exists index_entries_score_idx on public.mashups_index_entries(edition_id, rank);
create index if not exists ar_reports_launch_idx on public.ar_intelligence_reports(launch_id, generated_at desc);

alter table public.guaranteed_launch_programs enable row level security;
alter table public.campaign_experiments enable row level security;
alter table public.campaign_experiment_cohorts enable row level security;
alter table public.campaign_lift_snapshots enable row level security;
alter table public.growth_license_templates enable row level security;
alter table public.growth_license_agreements enable row level security;
alter table public.inventory_exclusivity_windows enable row level security;
alter table public.creator_liquidity_snapshots enable row level security;
alter table public.scene_programs enable row level security;
alter table public.scene_program_members enable row level security;
alter table public.amplification_allocations enable row level security;
alter table public.artist_participation_contracts enable row level security;
alter table public.artist_participation_obligations enable row level security;
alter table public.partner_integrations enable row level security;
alter table public.partner_delivery_events enable row level security;
alter table public.trust_assessments enable row level security;
alter table public.mashups_index_editions enable row level security;
alter table public.mashups_index_entries enable row level security;
alter table public.ar_intelligence_reports enable row level security;
alter table public.commercial_offers enable row level security;
alter table public.launch_protection_policies enable row level security;
alter table public.launch_protection_claims enable row level security;

create policy "Owners manage guaranteed launches" on public.guaranteed_launch_programs for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owners manage experiments" on public.campaign_experiments for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owners read experiment cohorts" on public.campaign_experiment_cohorts for select using (exists (select 1 from public.campaign_experiments e where e.id = experiment_id and e.owner_id = auth.uid()));
create policy "Owners read lift snapshots" on public.campaign_lift_snapshots for select using (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()));
create policy "Active license templates are public" on public.growth_license_templates for select using (is_active);
create policy "Agreement participants read licenses" on public.growth_license_agreements for select using (offered_by = auth.uid() or accepted_by = auth.uid() or exists (select 1 from public.rightsholder_organizations o where o.id = organization_id and o.owner_id = auth.uid()));
create policy "Agreement recipients accept licenses" on public.growth_license_agreements for update using (accepted_by = auth.uid() or exists (select 1 from public.rightsholder_organizations o where o.id = organization_id and o.owner_id = auth.uid()));
create policy "Organization owners read exclusivity" on public.inventory_exclusivity_windows for select using (exists (select 1 from public.rightsholder_organizations o where o.id = organization_id and o.owner_id = auth.uid()));
create policy "Published liquidity is visible" on public.creator_liquidity_snapshots for select using (true);
create policy "Public scene programs are visible" on public.scene_programs for select using (status in ('recruiting', 'live', 'graduated'));
create policy "Members read scene membership" on public.scene_program_members for select using (user_id = auth.uid());
create policy "Creators read amplification allocations" on public.amplification_allocations for select using (creator_id = auth.uid() or exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()));
create policy "Launch owners read artist contracts" on public.artist_participation_contracts for select using (offered_by = auth.uid() or accepted_by = auth.uid());
create policy "Contract participants read obligations" on public.artist_participation_obligations for select using (exists (select 1 from public.artist_participation_contracts c where c.id = contract_id and (c.offered_by = auth.uid() or c.accepted_by = auth.uid())));
create policy "Owners manage partner integrations" on public.partner_integrations for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owners read partner deliveries" on public.partner_delivery_events for select using (exists (select 1 from public.partner_integrations i where i.id = integration_id and i.owner_id = auth.uid()));
create policy "Subjects and launch owners read trust" on public.trust_assessments for select using ((subject_type = 'creator' and subject_id = auth.uid()::text) or exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()));
create policy "Published index editions are public" on public.mashups_index_editions for select using (status = 'published');
create policy "Published index entries are public" on public.mashups_index_entries for select using (exists (select 1 from public.mashups_index_editions e where e.id = edition_id and e.status = 'published'));
create policy "Owners read AR intelligence" on public.ar_intelligence_reports for select using (owner_id = auth.uid());
create policy "Owners manage commercial offers" on public.commercial_offers for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owners read protection policies" on public.launch_protection_policies for select using (owner_id = auth.uid());
create policy "Owners submit protection claims" on public.launch_protection_claims for insert with check (requested_by = auth.uid() and exists (select 1 from public.launch_protection_policies p where p.id = policy_id and p.owner_id = auth.uid()));
create policy "Owners read protection claims" on public.launch_protection_claims for select using (requested_by = auth.uid());

create or replace function public.accept_growth_license(p_agreement_id uuid, p_user_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare v_agreement public.growth_license_agreements%rowtype;
begin
  select * into v_agreement from public.growth_license_agreements where id = p_agreement_id for update;
  if v_agreement.id is null then return 'not_found'; end if;
  if v_agreement.status = 'accepted' then return 'already_accepted'; end if;
  if v_agreement.status <> 'offered' or v_agreement.expires_at <= now() then return 'unavailable'; end if;
  if not exists (select 1 from public.rightsholder_organizations o where o.id = v_agreement.organization_id and (o.owner_id = p_user_id or exists (select 1 from public.rightsholder_members m where m.organization_id = o.id and m.user_id = p_user_id and m.role in ('owner', 'admin', 'rights')))) then return 'forbidden'; end if;
  update public.growth_license_agreements set status = 'accepted', accepted_by = p_user_id, accepted_at = now() where id = p_agreement_id;
  return 'accepted';
end; $$;

revoke all on function public.accept_growth_license(uuid, uuid) from public, anon, authenticated;
grant execute on function public.accept_growth_license(uuid, uuid) to service_role;
