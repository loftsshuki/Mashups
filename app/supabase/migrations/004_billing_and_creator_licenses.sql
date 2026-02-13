-- Billing, creator licenses, and entitlement foundation
-- Date: 2026-02-13

create table if not exists public.subscription_plans (
  id text primary key,
  name text not null,
  price_cents integer not null,
  interval text not null check (interval in ('month', 'year')),
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id text not null references public.subscription_plans(id),
  provider text not null default 'stripe',
  provider_subscription_id text,
  status text not null check (status in ('active', 'past_due', 'canceled', 'trialing')) default 'active',
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.creator_licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mashup_id uuid references public.mashups(id) on delete set null,
  license_type text not null check (license_type in ('organic_shorts', 'paid_ads_shorts')),
  territory text not null default 'US',
  term_days integer not null default 365,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  status text not null check (status in ('active', 'expired', 'revoked')) default 'active',
  verification_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  session_type text not null check (session_type in ('subscription', 'license')),
  target_id text not null,
  provider text not null default 'stripe',
  provider_session_id text,
  status text not null check (status in ('pending', 'completed', 'failed')) default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_user_idx on public.subscriptions (user_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);
create index if not exists creator_licenses_user_idx on public.creator_licenses (user_id);
create index if not exists creator_licenses_status_idx on public.creator_licenses (status);
create index if not exists checkout_sessions_user_idx on public.checkout_sessions (user_id);

alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.creator_licenses enable row level security;
alter table public.checkout_sessions enable row level security;

create policy "Plans are public readable" on public.subscription_plans
  for select using (true);

create policy "Users can view own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "Users can view own creator licenses" on public.creator_licenses
  for select using (auth.uid() = user_id);

create policy "Creator licenses are publicly verifiable by code" on public.creator_licenses
  for select using (true);

create policy "Users can view own checkout sessions" on public.checkout_sessions
  for select using (auth.uid() = user_id);

create policy "Users can create own checkout sessions" on public.checkout_sessions
  for insert with check (auth.uid() = user_id);
