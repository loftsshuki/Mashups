-- Killer app operating models: viral packs, scoreboard, contests, studio persistence,
-- referral revenue accounting, and challenge ops automation.
-- Date: 2026-02-13

create table if not exists public.viral_pack_clips (
  id uuid primary key default gen_random_uuid(),
  pack_id text not null,
  publish_week date not null,
  published_at timestamptz not null default now(),
  clip_index integer not null check (clip_index >= 0),
  mashup_id text not null,
  title text not null,
  creator_name text not null,
  structure text not null check (structure in ('cold_open', 'drop_first', 'vocal_tease', 'beat_switch')),
  clip_start_sec numeric not null check (clip_start_sec >= 0),
  clip_length_sec integer not null check (clip_length_sec in (15, 30)),
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  rights_safe boolean not null default true,
  rights_score integer not null default 0,
  created_at timestamptz not null default now(),
  unique (pack_id, clip_index)
);

create index if not exists viral_pack_publish_idx on public.viral_pack_clips (publish_week desc);

create table if not exists public.creator_weekly_scores (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  creator_username text not null,
  display_name text not null,
  avatar_url text,
  weekly_growth_rate numeric not null default 0,
  momentum_lift numeric not null default 0,
  weekly_posts integer not null default 0,
  weekly_plays integer not null default 0,
  score numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (week_start, creator_username)
);

create index if not exists creator_weekly_scores_week_idx
  on public.creator_weekly_scores (week_start desc, score desc);

create table if not exists public.fork_contests (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  mashup_id text not null,
  title text not null,
  prompt text not null,
  prize_text text not null,
  deadline timestamptz not null,
  status text not null check (status in ('active', 'upcoming', 'closed')) default 'upcoming',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.fork_contest_social_templates (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.fork_contests(id) on delete cascade,
  template_text text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists fork_contests_mashup_idx on public.fork_contests (mashup_id);
create index if not exists fork_contests_status_idx on public.fork_contests (status);
create index if not exists fork_contest_templates_contest_idx
  on public.fork_contest_social_templates (contest_id, position);

create table if not exists public.studio_markers (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  session_key text not null,
  user_id uuid references public.profiles(id) on delete set null,
  author_alias text not null default 'Producer',
  label text not null,
  at_sec numeric not null check (at_sec >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.studio_notes (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  session_key text not null,
  user_id uuid references public.profiles(id) on delete set null,
  author_alias text not null default 'Producer',
  note_text text not null,
  at_sec numeric not null check (at_sec >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.studio_snapshots (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  session_key text not null,
  user_id uuid references public.profiles(id) on delete set null,
  author_alias text not null default 'Producer',
  name text not null,
  bpm integer not null check (bpm >= 40 and bpm <= 240),
  playhead numeric not null check (playhead >= 0),
  is_playing boolean not null default false,
  marker_count integer not null default 0,
  note_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists studio_markers_session_idx
  on public.studio_markers (session_key, created_at desc);
create index if not exists studio_notes_session_idx
  on public.studio_notes (session_key, created_at desc);
create index if not exists studio_snapshots_session_idx
  on public.studio_snapshots (session_key, created_at desc);

create table if not exists public.referral_invites (
  code text primary key,
  campaign_id text not null,
  creator_tier text not null check (creator_tier in ('large', 'medium', 'emerging')),
  destination text not null,
  max_uses integer not null default 10 check (max_uses > 0),
  uses_count integer not null default 0 check (uses_count >= 0),
  rev_share_bps integer not null default 1200 check (rev_share_bps >= 0 and rev_share_bps <= 5000),
  expires_at timestamptz,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.referral_revenue_events (
  id uuid primary key default gen_random_uuid(),
  referral_code text references public.referral_invites(code) on delete set null,
  provider_event_type text not null,
  amount_cents integer not null check (amount_cents >= 0),
  revenue_share_cents integer not null check (revenue_share_cents >= 0),
  currency text not null default 'USD',
  status text not null check (status in ('pending', 'recorded', 'paid')) default 'recorded',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists referral_events_code_idx
  on public.referral_revenue_events (referral_code, created_at desc);

create table if not exists public.challenge_winners (
  id uuid primary key default gen_random_uuid(),
  challenge_id text not null,
  mashup_id text not null,
  creator_id text,
  prize_cents integer check (prize_cents >= 0),
  sponsor_fulfillment_status text not null check (sponsor_fulfillment_status in ('pending', 'fulfilled')) default 'pending',
  payout_status text not null check (payout_status in ('pending', 'paid', 'failed')) default 'pending',
  payout_reference text,
  selected_by uuid references public.profiles(id) on delete set null,
  selected_at timestamptz not null default now(),
  unique (challenge_id, mashup_id)
);

create table if not exists public.challenge_ops_events (
  id uuid primary key default gen_random_uuid(),
  challenge_id text not null,
  action text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists challenge_winners_challenge_idx
  on public.challenge_winners (challenge_id, selected_at desc);
create index if not exists challenge_ops_events_challenge_idx
  on public.challenge_ops_events (challenge_id, created_at desc);

alter table public.viral_pack_clips enable row level security;
alter table public.creator_weekly_scores enable row level security;
alter table public.fork_contests enable row level security;
alter table public.fork_contest_social_templates enable row level security;
alter table public.studio_markers enable row level security;
alter table public.studio_notes enable row level security;
alter table public.studio_snapshots enable row level security;
alter table public.referral_invites enable row level security;
alter table public.referral_revenue_events enable row level security;
alter table public.challenge_winners enable row level security;
alter table public.challenge_ops_events enable row level security;

create policy "Viral pack clips public read" on public.viral_pack_clips
  for select using (true);
create policy "Viral pack clips auth write" on public.viral_pack_clips
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "Creator weekly scores public read" on public.creator_weekly_scores
  for select using (true);
create policy "Creator weekly scores auth write" on public.creator_weekly_scores
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "Fork contests public read" on public.fork_contests
  for select using (true);
create policy "Fork contests auth write" on public.fork_contests
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "Fork contest templates public read" on public.fork_contest_social_templates
  for select using (true);
create policy "Fork contest templates auth write" on public.fork_contest_social_templates
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "Studio markers public read" on public.studio_markers
  for select using (true);
create policy "Studio markers insert own user or anon" on public.studio_markers
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "Studio notes public read" on public.studio_notes
  for select using (true);
create policy "Studio notes insert own user or anon" on public.studio_notes
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "Studio snapshots public read" on public.studio_snapshots
  for select using (true);
create policy "Studio snapshots insert own user or anon" on public.studio_snapshots
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "Referral invites public read" on public.referral_invites
  for select using (true);
create policy "Referral invites insert own user or anon" on public.referral_invites
  for insert with check (auth.uid() = user_id or user_id is null);
create policy "Referral invites update own user or anon" on public.referral_invites
  for update using (auth.uid() = user_id or user_id is null);

create policy "Referral revenue events authenticated read" on public.referral_revenue_events
  for select using (auth.uid() is not null);

create policy "Challenge winners public read" on public.challenge_winners
  for select using (true);
create policy "Challenge winners auth write" on public.challenge_winners
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "Challenge ops events auth read" on public.challenge_ops_events
  for select using (auth.uid() is not null);
create policy "Challenge ops events auth write" on public.challenge_ops_events
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
