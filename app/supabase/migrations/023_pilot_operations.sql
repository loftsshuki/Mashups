-- Pilot operations: label intake, operator configuration, outreach pipeline,
-- deploy readiness evidence, and production-safe EDM/house launch templates.

create table if not exists public.pilot_program_templates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  genre text not null,
  market_codes text[] not null default '{}',
  creator_target integer not null check (creator_target > 0),
  qualified_post_target integer not null check (qualified_post_target > 0),
  budget_floor_cents integer not null check (budget_floor_cents >= 0),
  budget_ceiling_cents integer not null check (budget_ceiling_cents >= budget_floor_cents),
  rights_requirements jsonb not null default '[]'::jsonb,
  operating_brief jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.pilot_market_configs (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  city text not null,
  country_code text not null,
  genre text not null,
  primary_motion text not null,
  creator_target integer not null check (creator_target > 0),
  venue_target integer not null check (venue_target >= 0),
  target_niches text[] not null default '{}',
  partner_thesis text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.pilot_target_segments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  entity_type text not null check (entity_type in ('label', 'distributor', 'artist_manager', 'venue', 'creator_agency', 'artist')),
  qualification_signals text[] not null default '{}',
  disqualifiers text[] not null default '{}',
  default_priority integer not null check (default_priority between 1 and 5),
  is_active boolean not null default true
);

create table if not exists public.pilot_campaign_intakes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.rightsholder_organizations(id) on delete set null,
  program_template_id uuid references public.pilot_program_templates(id) on delete set null,
  campaign_name text not null,
  artist_name text not null,
  track_title text not null,
  contact_name text not null,
  contact_email text not null,
  genre text not null,
  subgenre text,
  release_stage text not null check (release_stage in ('unreleased', 'released', 'catalog')),
  release_date date,
  objectives text[] not null default '{}',
  target_markets text[] not null default '{}',
  target_niches text[] not null default '{}',
  target_creator_count integer not null check (target_creator_count between 10 and 10000),
  creator_budget_cents integer not null default 0 check (creator_budget_cents >= 0),
  paid_media_budget_cents integer not null default 0 check (paid_media_budget_cents >= 0),
  master_url text,
  rights_readiness text not null default 'unverified' check (rights_readiness in ('unverified', 'review', 'verified')),
  status text not null default 'submitted' check (status in ('submitted', 'qualified', 'contracting', 'ready', 'launched', 'declined')),
  notes text,
  source text not null default 'direct',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pilot_operator_configs (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null unique references public.pilot_campaign_intakes(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  guaranteed_launch jsonb not null default '{}'::jsonb,
  growth_license jsonb not null default '{}'::jsonb,
  exclusivity jsonb not null default '{}'::jsonb,
  artist_participation jsonb not null default '{}'::jsonb,
  partner_rails jsonb not null default '[]'::jsonb,
  measurement_plan jsonb not null default '{}'::jsonb,
  commercial_offer jsonb not null default '{}'::jsonb,
  protection_terms jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'ready', 'activated')),
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pilot_checklist_items (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references public.pilot_campaign_intakes(id) on delete cascade,
  item_key text not null,
  category text not null check (category in ('rights', 'creative', 'creator', 'measurement', 'commercial', 'partner', 'deployment')),
  label text not null,
  required boolean not null default true,
  status text not null default 'pending' check (status in ('pending', 'blocked', 'ready', 'waived')),
  evidence jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (intake_id, item_key)
);

create table if not exists public.outreach_prospects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entity_name text not null,
  entity_type text not null check (entity_type in ('label', 'distributor', 'artist_manager', 'venue', 'creator_agency', 'artist')),
  contact_name text,
  contact_email text,
  city text,
  country_code text,
  genres text[] not null default '{}',
  catalog_signal text,
  priority integer not null default 3 check (priority between 1 and 5),
  stage text not null default 'research' check (stage in ('research', 'qualified', 'contacted', 'replied', 'meeting', 'pilot', 'won', 'lost')),
  next_action text,
  due_at timestamptz,
  source_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.outreach_activities (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.outreach_prospects(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  activity_type text not null check (activity_type in ('note', 'email', 'dm', 'call', 'meeting', 'stage_change')),
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists public.outreach_playbook_templates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  stage text not null,
  channel text not null check (channel in ('email', 'dm', 'call')),
  subject text,
  body text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.launch_readiness_attestations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  check_key text not null,
  status text not null check (status in ('pending', 'blocked', 'ready', 'waived')),
  evidence jsonb not null default '{}'::jsonb,
  attested_at timestamptz not null default now(),
  unique (owner_id, check_key)
);

create index if not exists pilot_intakes_owner_status_idx on public.pilot_campaign_intakes(owner_id, status, created_at desc);
create index if not exists pilot_checklist_intake_idx on public.pilot_checklist_items(intake_id, category, status);
create index if not exists outreach_prospects_owner_stage_idx on public.outreach_prospects(owner_id, stage, priority desc);
create index if not exists outreach_activities_prospect_idx on public.outreach_activities(prospect_id, occurred_at desc);

alter table public.pilot_program_templates enable row level security;
alter table public.pilot_market_configs enable row level security;
alter table public.pilot_target_segments enable row level security;
alter table public.pilot_campaign_intakes enable row level security;
alter table public.pilot_operator_configs enable row level security;
alter table public.pilot_checklist_items enable row level security;
alter table public.outreach_prospects enable row level security;
alter table public.outreach_activities enable row level security;
alter table public.outreach_playbook_templates enable row level security;
alter table public.launch_readiness_attestations enable row level security;

create policy "Active pilot templates are public" on public.pilot_program_templates for select using (is_active);
create policy "Active pilot markets are public" on public.pilot_market_configs for select using (is_active);
create policy "Active target segments are public" on public.pilot_target_segments for select using (is_active);
create policy "Active outreach playbooks are public" on public.outreach_playbook_templates for select using (is_active);
create policy "Owners manage pilot intakes" on public.pilot_campaign_intakes for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owners manage operator configs" on public.pilot_operator_configs for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owners manage pilot checklist" on public.pilot_checklist_items for all using (exists (select 1 from public.pilot_campaign_intakes i where i.id = intake_id and i.owner_id = auth.uid())) with check (exists (select 1 from public.pilot_campaign_intakes i where i.id = intake_id and i.owner_id = auth.uid()));
create policy "Owners manage outreach prospects" on public.outreach_prospects for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owners manage outreach activity" on public.outreach_activities for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owners manage readiness attestations" on public.launch_readiness_attestations for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

insert into public.pilot_market_configs (code, city, country_code, genre, primary_motion, creator_target, venue_target, target_niches, partner_thesis) values
  ('MIA-HOUSE', 'Miami', 'US', 'Electronic', 'nightlife-to-festival', 75, 5, array['Nightlife', 'Fitness', 'Fashion'], 'Use DJs, fitness creators, and venue capture to turn repeated room exposure into attributed saves.'),
  ('LDN-HOUSE', 'London', 'GB', 'Electronic', 'fashion-to-club', 75, 5, array['Fashion', 'Dance', 'Nightlife'], 'Pair tastemaker labels with fashion and dance creators before selective paid amplification.'),
  ('BER-HOUSE', 'Berlin', 'DE', 'Electronic', 'club-to-community', 75, 7, array['Dance', 'Production', 'Nightlife'], 'Lead with trusted scene captains and proof-rich club activations rather than broad influencer reach.'),
  ('NYC-HOUSE', 'New York', 'US', 'Electronic', 'culture-to-nightlife', 75, 5, array['Fashion', 'Culture', 'Nightlife'], 'Connect independent dance catalogs to culture pages, nightlife creators, and measurable city cells.'),
  ('LAX-HOUSE', 'Los Angeles', 'US', 'Electronic', 'creator-to-paid', 75, 4, array['Fitness', 'Lifestyle', 'Dance'], 'Test creator-native structures quickly, then license only organic winners for paid use.')
on conflict (code) do update set partner_thesis = excluded.partner_thesis, target_niches = excluded.target_niches;

insert into public.pilot_program_templates (code, name, genre, market_codes, creator_target, qualified_post_target, budget_floor_cents, budget_ceiling_cents, rights_requirements, operating_brief) values (
  'FOUNDING-HOUSE-001',
  'Founding House 001',
  'Electronic',
  array['MIA-HOUSE', 'LDN-HOUSE', 'BER-HOUSE', 'NYC-HOUSE', 'LAX-HOUSE'],
  50,
  50,
  500000,
  2500000,
  '["master authority verified","organic short-form","hook edits","creator whitelisting","paid social cap","worldwide or explicit territories"]'::jsonb,
  '{"windowDays":14,"genomeTests":3,"controlMethod":"matched_holdout","protection":"platform-fee service credit only","guarantees":["creator test volume","qualified posts","rights proof","incremental lift report"],"excludes":["stream guarantee","chart guarantee","virality guarantee"]}'::jsonb
) on conflict (code) do update set operating_brief = excluded.operating_brief, rights_requirements = excluded.rights_requirements;

insert into public.pilot_target_segments (code, label, entity_type, qualification_signals, disqualifiers, default_priority) values
  ('INDIE-HOUSE-LABEL', 'Independent house labels', 'label', array['active 2025-2026 releases','artist-controlled masters','short-form curiosity','responsive founder or digital lead'], array['major-controlled master','no campaign edit authority','catalog-only with no artist participation'], 5),
  ('DANCE-DISTRIBUTOR', 'Dance-focused distributors', 'distributor', array['independent label roster','metadata API or exports','campaign rights contact'], array['no rightsholder introduction path','territory ambiguity'], 4),
  ('ELECTRONIC-MANAGER', 'Electronic artist managers', 'artist_manager', array['release in next 90 days','artist willing to participate','owned audience'], array['artist unavailable','no master approval'], 4),
  ('SCENE-VENUE', 'Scene-defining venues', 'venue', array['recurring electronic programming','QR activation permission','local creator network'], array['no event measurement permission'], 3),
  ('NICHE-CREATOR-AGENCY', 'Niche creator agencies', 'creator_agency', array['fitness fashion dance or nightlife roster','usage-rights operations','performance reporting'], array['follower-only pricing','no post-level evidence'], 3)
on conflict (code) do update set qualification_signals = excluded.qualification_signals, disqualifiers = excluded.disqualifiers;

insert into public.outreach_playbook_templates (code, stage, channel, subject, body) values
  ('FOUNDING-LABEL-EMAIL', 'qualified', 'email', 'A controlled creator test for {{track_title}}', 'We run a 14-day, rights-bound creator test for independent electronic releases. Mashups delivers hook testing, 50 qualified creator opportunities, attribution, a matched-control lift report, and optional paid licensing only for proven posts. We guarantee the operating work, never streams or virality. Would a 20-minute rights and campaign-fit review be useful?'),
  ('MANAGER-DM', 'qualified', 'dm', null, 'We are selecting a small founding cohort of independent electronic artists for controlled short-form tests. Rights stay explicit, the artist participates, creators are paid, and the final report separates incremental lift from noise. Open to a quick fit check for {{artist_name}}?'),
  ('VENUE-PARTNER-EMAIL', 'qualified', 'email', 'Turn room energy into measurable saves', 'Mashups connects venue QR activations, creator posts, and downstream music saves in one evidence graph. We are building city cells for the first independent house pilot and are looking for a small number of scene-defining venue partners.')
on conflict (code) do update set subject = excluded.subject, body = excluded.body;
