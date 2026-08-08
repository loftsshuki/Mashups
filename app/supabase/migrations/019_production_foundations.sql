-- Production foundations for billing idempotency, metering, and distributed limits.

create table if not exists public.billing_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'stripe',
  provider_event_id text not null unique,
  event_type text not null,
  status text not null check (status in ('processing', 'completed', 'failed')) default 'processing',
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  attempts integer not null default 1,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  feature text not null check (feature in ('mashups', 'ai_generations', 'stem_separations')),
  units integer not null default 1 check (units > 0),
  status text not null check (status in ('pending', 'completed', 'failed')) default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_user_feature_created_idx
  on public.usage_events (user_id, feature, created_at desc);

create table if not exists public.api_rate_limits (
  rate_key text not null,
  bucket bigint not null,
  request_count integer not null default 1,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (rate_key, bucket)
);

alter table public.billing_webhook_events enable row level security;
alter table public.usage_events enable row level security;
alter table public.api_rate_limits enable row level security;

drop policy if exists "Users can view own usage" on public.usage_events;
create policy "Users can view own usage" on public.usage_events
  for select using (auth.uid() = user_id);

alter table public.referral_revenue_events
  add column if not exists provider_event_id text;

create unique index if not exists referral_revenue_provider_event_idx
  on public.referral_revenue_events (provider_event_id)
  where provider_event_id is not null;

create unique index if not exists checkout_sessions_provider_session_idx
  on public.checkout_sessions (provider_session_id)
  where provider_session_id is not null;

create or replace function public.claim_billing_webhook_event(
  p_event_id text,
  p_event_type text,
  p_payload jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer;
begin
  insert into public.billing_webhook_events (
    provider_event_id,
    event_type,
    status,
    payload
  ) values (
    p_event_id,
    p_event_type,
    'processing',
    coalesce(p_payload, '{}'::jsonb)
  )
  on conflict (provider_event_id) do update
    set status = 'processing',
        error_message = null,
        attempts = billing_webhook_events.attempts + 1,
        updated_at = now()
    where billing_webhook_events.status = 'failed';

  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

create or replace function public.reserve_usage_event(
  p_user_id uuid,
  p_feature text,
  p_limit integer,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_usage integer;
  v_id uuid;
begin
  if p_feature not in ('mashups', 'ai_generations', 'stem_separations') then
    raise exception 'Unsupported usage feature';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || p_feature, 0));

  select coalesce(sum(units), 0)::integer
    into v_usage
    from public.usage_events
   where user_id = p_user_id
     and feature = p_feature
     and status in ('pending', 'completed')
     and created_at >= date_trunc('month', now());

  if p_limit <> -1 and v_usage >= p_limit then
    return null;
  end if;

  insert into public.usage_events (user_id, feature, metadata)
  values (p_user_id, p_feature, coalesce(p_metadata, '{}'::jsonb))
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.consume_api_rate_limit(
  p_rate_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, remaining integer, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_window integer := greatest(p_window_seconds, 1);
  v_bucket bigint;
  v_count integer;
  v_expires timestamptz;
begin
  v_bucket := floor(extract(epoch from v_now) / v_window)::bigint;
  v_expires := to_timestamp((v_bucket + 1) * v_window);

  insert into public.api_rate_limits (rate_key, bucket, request_count, expires_at)
  values (p_rate_key, v_bucket, 1, v_expires)
  on conflict (rate_key, bucket) do update
    set request_count = api_rate_limits.request_count + 1,
        updated_at = v_now
  returning request_count into v_count;

  return query select
    v_count <= p_limit,
    greatest(p_limit - v_count, 0),
    greatest(ceil(extract(epoch from (v_expires - v_now)))::integer, 1);
end;
$$;

revoke all on function public.claim_billing_webhook_event(text, text, jsonb) from public, anon, authenticated;
revoke all on function public.reserve_usage_event(uuid, text, integer, jsonb) from public, anon, authenticated;
revoke all on function public.consume_api_rate_limit(text, integer, integer) from public, anon, authenticated;

grant execute on function public.claim_billing_webhook_event(text, text, jsonb) to service_role;
grant execute on function public.reserve_usage_event(uuid, text, integer, jsonb) to service_role;
grant execute on function public.consume_api_rate_limit(text, integer, integer) to service_role;
