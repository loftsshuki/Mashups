-- Growth, collaboration, remix graph, and recommendation telemetry
-- Date: 2026-02-13

create table if not exists public.remix_relations (
  id uuid primary key default gen_random_uuid(),
  parent_mashup_id uuid not null references public.mashups(id) on delete cascade,
  child_mashup_id uuid not null references public.mashups(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (parent_mashup_id, child_mashup_id)
);

create table if not exists public.collaboration_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  status text not null check (status in ('active', 'paused', 'ended')) default 'active',
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists public.collaboration_participants (
  session_id uuid not null references public.collaboration_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')) default 'editor',
  joined_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  prize_text text,
  status text not null check (status in ('upcoming', 'active', 'closed')) default 'upcoming',
  created_at timestamptz not null default now()
);

create table if not exists public.challenge_entries (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  mashup_id uuid not null references public.mashups(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  unique (challenge_id, mashup_id)
);

create table if not exists public.recommendation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  mashup_id uuid references public.mashups(id) on delete set null,
  event_type text not null check (event_type in ('impression', 'play', 'skip', 'like', 'share', 'open')),
  context text,
  created_at timestamptz not null default now()
);

create index if not exists remix_relations_parent_idx on public.remix_relations (parent_mashup_id);
create index if not exists remix_relations_child_idx on public.remix_relations (child_mashup_id);
create index if not exists collab_sessions_owner_idx on public.collaboration_sessions (owner_id);
create index if not exists challenge_entries_creator_idx on public.challenge_entries (creator_id);
create index if not exists recommendation_events_user_idx on public.recommendation_events (user_id);
create index if not exists recommendation_events_mashup_idx on public.recommendation_events (mashup_id);
create index if not exists recommendation_events_created_idx on public.recommendation_events (created_at desc);

alter table public.remix_relations enable row level security;
alter table public.collaboration_sessions enable row level security;
alter table public.collaboration_participants enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_entries enable row level security;
alter table public.recommendation_events enable row level security;

create policy "Remix relations are viewable by everyone" on public.remix_relations
  for select using (true);

create policy "Creators can insert remix relation for own child mashup" on public.remix_relations
  for insert with check (
    exists (
      select 1 from public.mashups m
      where m.id = remix_relations.child_mashup_id
      and m.creator_id = auth.uid()
    )
  );

create policy "Users can view sessions they participate in" on public.collaboration_sessions
  for select using (
    auth.uid() = owner_id
    or exists (
      select 1 from public.collaboration_participants p
      where p.session_id = collaboration_sessions.id
      and p.user_id = auth.uid()
    )
  );

create policy "Users can create own sessions" on public.collaboration_sessions
  for insert with check (auth.uid() = owner_id);

create policy "Owners can update own sessions" on public.collaboration_sessions
  for update using (auth.uid() = owner_id);

create policy "Session participants visible to participants" on public.collaboration_participants
  for select using (
    exists (
      select 1 from public.collaboration_sessions s
      where s.id = collaboration_participants.session_id
      and (
        s.owner_id = auth.uid()
        or exists (
          select 1 from public.collaboration_participants p2
          where p2.session_id = s.id and p2.user_id = auth.uid()
        )
      )
    )
  );

create policy "Owner can manage participants" on public.collaboration_participants
  for all using (
    exists (
      select 1 from public.collaboration_sessions s
      where s.id = collaboration_participants.session_id
      and s.owner_id = auth.uid()
    )
  );

create policy "Challenges are viewable by everyone" on public.challenges
  for select using (true);

create policy "Challenge entries are viewable by everyone" on public.challenge_entries
  for select using (true);

create policy "Creators can submit own challenge entries" on public.challenge_entries
  for insert with check (auth.uid() = creator_id);

create policy "Users can write own recommendation events" on public.recommendation_events
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "Users can view own recommendation events" on public.recommendation_events
  for select using (auth.uid() = user_id);
