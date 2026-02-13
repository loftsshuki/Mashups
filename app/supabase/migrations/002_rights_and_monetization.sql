-- Rights, compliance, and monetization schema (Phase 2/3 foundation)
-- Date: 2026-02-13

-- ---------------------------------------------------------------------------
-- Rights assets (uploaded stems, packs, source files)
-- ---------------------------------------------------------------------------
create table if not exists public.rights_assets (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null references public.profiles(id) on delete cascade,
  asset_type text not null check (asset_type in ('track', 'stem', 'sample_pack')),
  file_hash text not null,
  fingerprint_id text,
  territory text,
  created_at timestamptz not null default now(),
  unique (file_hash)
);

create index if not exists rights_assets_uploader_idx on public.rights_assets (uploader_id);
create index if not exists rights_assets_fingerprint_idx on public.rights_assets (fingerprint_id);

-- ---------------------------------------------------------------------------
-- Rights declarations (attestation + rights mode per mashup)
-- ---------------------------------------------------------------------------
create table if not exists public.rights_declarations (
  id uuid primary key default gen_random_uuid(),
  mashup_id uuid not null references public.mashups(id) on delete cascade,
  mode text not null check (mode in ('owned', 'precleared', 'licensed')),
  attested_at timestamptz not null default now(),
  attestation_version text not null default 'v1',
  status text not null check (status in ('verified', 'pending', 'rejected')) default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists rights_declarations_mashup_idx on public.rights_declarations (mashup_id);
create index if not exists rights_declarations_status_idx on public.rights_declarations (status);

-- ---------------------------------------------------------------------------
-- Licenses (optional attachments to declarations)
-- ---------------------------------------------------------------------------
create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  rights_declaration_id uuid not null references public.rights_declarations(id) on delete cascade,
  licensor_name text not null,
  license_type text not null,
  start_date date,
  end_date date,
  territory text,
  document_url text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists licenses_declaration_idx on public.licenses (rights_declaration_id);

-- ---------------------------------------------------------------------------
-- Claims and enforcement
-- ---------------------------------------------------------------------------
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  mashup_id uuid not null references public.mashups(id) on delete cascade,
  claimant_contact text not null,
  claim_type text not null,
  submitted_at timestamptz not null default now(),
  status text not null check (status in ('open', 'under_review', 'resolved', 'rejected')) default 'open',
  resolution text,
  resolved_at timestamptz
);

create index if not exists claims_mashup_idx on public.claims (mashup_id);
create index if not exists claims_status_idx on public.claims (status);

create table if not exists public.enforcement_actions (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  action text not null check (action in ('block', 'mute', 'geo_restrict', 'restore')),
  actor_id uuid references public.profiles(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists enforcement_actions_claim_idx on public.enforcement_actions (claim_id);

-- ---------------------------------------------------------------------------
-- Monetization ledger + payouts
-- ---------------------------------------------------------------------------
create table if not exists public.earnings_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_type text not null,
  source_id text,
  amount_cents integer not null,
  currency text not null default 'USD',
  status text not null check (status in ('pending', 'available', 'paid', 'reversed')) default 'pending',
  available_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists earnings_ledger_user_idx on public.earnings_ledger (user_id);
create index if not exists earnings_ledger_status_idx on public.earnings_ledger (status);
create index if not exists earnings_ledger_created_idx on public.earnings_ledger (created_at desc);

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  method text not null default 'stripe_connect',
  status text not null check (status in ('pending', 'paid', 'failed')) default 'pending',
  requested_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists payouts_user_idx on public.payouts (user_id);
create index if not exists payouts_status_idx on public.payouts (status);

-- ---------------------------------------------------------------------------
-- Repeat infringer tracking
-- ---------------------------------------------------------------------------
create table if not exists public.repeat_infringer_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  claim_id uuid references public.claims(id) on delete set null,
  strike_count integer not null check (strike_count >= 1),
  action_taken text not null,
  created_at timestamptz not null default now()
);

create index if not exists repeat_infringer_user_idx on public.repeat_infringer_events (user_id);

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
alter table public.rights_assets enable row level security;
alter table public.rights_declarations enable row level security;
alter table public.licenses enable row level security;
alter table public.claims enable row level security;
alter table public.enforcement_actions enable row level security;
alter table public.earnings_ledger enable row level security;
alter table public.payouts enable row level security;
alter table public.repeat_infringer_events enable row level security;

-- ---------------------------------------------------------------------------
-- RLS policies
-- ---------------------------------------------------------------------------

-- rights_assets
create policy "Users can view own rights assets" on public.rights_assets
  for select using (auth.uid() = uploader_id);

create policy "Users can insert own rights assets" on public.rights_assets
  for insert with check (auth.uid() = uploader_id);

create policy "Users can update own rights assets" on public.rights_assets
  for update using (auth.uid() = uploader_id);

create policy "Users can delete own rights assets" on public.rights_assets
  for delete using (auth.uid() = uploader_id);

-- rights_declarations
create policy "Creators can view declarations on own mashups" on public.rights_declarations
  for select using (
    exists (
      select 1 from public.mashups
      where mashups.id = rights_declarations.mashup_id
      and auth.uid() = mashups.creator_id
    )
  );

create policy "Creators can insert declarations on own mashups" on public.rights_declarations
  for insert with check (
    exists (
      select 1 from public.mashups
      where mashups.id = rights_declarations.mashup_id
      and auth.uid() = mashups.creator_id
    )
  );

create policy "Creators can update declarations on own mashups" on public.rights_declarations
  for update using (
    exists (
      select 1 from public.mashups
      where mashups.id = rights_declarations.mashup_id
      and auth.uid() = mashups.creator_id
    )
  );

create policy "Creators can delete declarations on own mashups" on public.rights_declarations
  for delete using (
    exists (
      select 1 from public.mashups
      where mashups.id = rights_declarations.mashup_id
      and auth.uid() = mashups.creator_id
    )
  );

-- licenses
create policy "Creators can view licenses on own mashups" on public.licenses
  for select using (
    exists (
      select 1
      from public.rights_declarations rd
      join public.mashups m on m.id = rd.mashup_id
      where rd.id = licenses.rights_declaration_id
      and auth.uid() = m.creator_id
    )
  );

create policy "Creators can manage licenses on own mashups" on public.licenses
  for all using (
    exists (
      select 1
      from public.rights_declarations rd
      join public.mashups m on m.id = rd.mashup_id
      where rd.id = licenses.rights_declaration_id
      and auth.uid() = m.creator_id
    )
  );

-- claims
create policy "Anyone can submit claims" on public.claims
  for insert with check (true);

create policy "Creators can view claims on own mashups" on public.claims
  for select using (
    exists (
      select 1 from public.mashups
      where mashups.id = claims.mashup_id
      and auth.uid() = mashups.creator_id
    )
  );

-- enforcement_actions
create policy "Creators can view enforcement actions on own mashups" on public.enforcement_actions
  for select using (
    exists (
      select 1
      from public.claims c
      join public.mashups m on m.id = c.mashup_id
      where c.id = enforcement_actions.claim_id
      and auth.uid() = m.creator_id
    )
  );

-- earnings_ledger
create policy "Users can view own earnings ledger" on public.earnings_ledger
  for select using (auth.uid() = user_id);

-- payouts
create policy "Users can view own payouts" on public.payouts
  for select using (auth.uid() = user_id);

create policy "Users can request own payouts" on public.payouts
  for insert with check (auth.uid() = user_id);

-- repeat_infringer_events
create policy "Users can view own repeat infringer events" on public.repeat_infringer_events
  for select using (auth.uid() = user_id);
