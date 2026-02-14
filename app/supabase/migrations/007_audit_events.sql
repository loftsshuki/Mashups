-- Audit event trail for backend actions and sensitive operations.
-- Date: 2026-02-14

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  status text not null check (status in ('success', 'error')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_created_idx
  on public.audit_events (created_at desc);
create index if not exists audit_events_action_idx
  on public.audit_events (action, created_at desc);
create index if not exists audit_events_actor_idx
  on public.audit_events (actor_id, created_at desc);

alter table public.audit_events enable row level security;

create policy "Audit events actor read"
  on public.audit_events
  for select
  using (auth.uid() = actor_id);

create policy "Audit events actor insert"
  on public.audit_events
  for insert
  with check (auth.uid() = actor_id or actor_id is null);
