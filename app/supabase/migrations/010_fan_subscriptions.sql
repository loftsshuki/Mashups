-- Fan/creator subscriptions (Patreon-style membership system)
-- Separate from platform subscriptions (Free/Pro/Studio in 004_billing)
-- Date: 2026-02-15

-- Creator-defined subscription tiers
create table if not exists public.creator_subscription_tiers (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  tier text not null check (tier in ('basic', 'premium', 'vip')),
  name text not null,
  description text,
  price_cents integer not null,
  currency text not null default 'USD',
  interval text not null check (interval in ('month', 'year')) default 'month',
  features jsonb not null default '[]'::jsonb,
  exclusive_content boolean not null default false,
  early_access boolean not null default true,
  direct_messaging boolean not null default false,
  max_subscribers integer, -- null = unlimited
  is_active boolean not null default true,
  stripe_price_id text, -- Stripe Connect price ID
  created_at timestamptz not null default now(),
  unique (creator_id, tier, interval)
);

-- Fan subscriptions linking users to creator tiers
create table if not exists public.fan_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tier_id uuid not null references public.creator_subscription_tiers(id) on delete cascade,
  status text not null check (status in ('active', 'cancelled', 'expired', 'paused')) default 'active',
  provider text not null default 'stripe',
  provider_subscription_id text,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  total_paid_cents integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, tier_id)
);

create index if not exists creator_sub_tiers_creator_idx on public.creator_subscription_tiers (creator_id);
create index if not exists fan_subs_user_idx on public.fan_subscriptions (user_id);
create index if not exists fan_subs_tier_idx on public.fan_subscriptions (tier_id);
create index if not exists fan_subs_status_idx on public.fan_subscriptions (status);

alter table public.creator_subscription_tiers enable row level security;
alter table public.fan_subscriptions enable row level security;

-- Anyone can view active tiers (for discovery)
create policy "Active tiers are publicly readable" on public.creator_subscription_tiers
  for select using (is_active = true);

-- Creators can manage their own tiers
create policy "Creators can insert own tiers" on public.creator_subscription_tiers
  for insert with check (auth.uid() = creator_id);

create policy "Creators can update own tiers" on public.creator_subscription_tiers
  for update using (auth.uid() = creator_id);

-- Users can view their own subscriptions
create policy "Users can view own fan subscriptions" on public.fan_subscriptions
  for select using (auth.uid() = user_id);

-- Users can create subscriptions
create policy "Users can subscribe" on public.fan_subscriptions
  for insert with check (auth.uid() = user_id);

-- Users can update their own subscriptions (cancel, etc.)
create policy "Users can update own fan subscriptions" on public.fan_subscriptions
  for update using (auth.uid() = user_id);

-- Creators can view subscriptions to their tiers (for subscriber counts)
create policy "Creators can view subscribers" on public.fan_subscriptions
  for select using (
    exists (
      select 1 from public.creator_subscription_tiers
      where id = fan_subscriptions.tier_id
      and creator_id = auth.uid()
    )
  );
