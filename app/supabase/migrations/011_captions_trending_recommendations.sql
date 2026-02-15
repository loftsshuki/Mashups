-- Phase 3: Captions, Trending Sounds, and Recommendations tables
-- Date: 2026-02-15

-- Mashup captions (from Whisper API transcription)
create table if not exists public.mashup_captions (
  id uuid primary key default gen_random_uuid(),
  mashup_id uuid references public.mashups(id) on delete cascade,
  language text not null default 'en',
  segments jsonb not null default '[]'::jsonb,
  srt_text text,
  vtt_text text,
  word_timings jsonb, -- word-level timing for karaoke
  created_at timestamptz not null default now(),
  unique (mashup_id, language)
);

-- Trending sounds (cached from Spotify/YouTube/internal)
create table if not exists public.trending_sounds (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text,
  source text not null check (source in ('spotify', 'youtube', 'tiktok', 'internal')),
  external_id text,
  external_url text,
  thumbnail_url text,
  rank integer,
  previous_rank integer,
  velocity text check (velocity in ('hot', 'rising', 'steady', 'cooling')),
  stats jsonb default '{}'::jsonb, -- {posts, streams, views, etc.}
  tags text[] default '{}',
  fetched_at timestamptz not null default now(),
  unique (source, external_id)
);

-- Voice chat rooms (for Daily.co integration)
create table if not exists public.voice_rooms (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.collaboration_sessions(id) on delete cascade,
  provider text not null default 'daily',
  provider_room_id text,
  provider_room_url text,
  status text not null check (status in ('active', 'expired')) default 'active',
  max_participants integer not null default 10,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Recommendation events (log user interactions for training)
-- Note: recommendation_events table already exists in migration 003
-- This adds mashup embeddings for pgvector similarity search

-- Indexes
create index if not exists mashup_captions_mashup_idx on public.mashup_captions (mashup_id);
create index if not exists trending_sounds_source_idx on public.trending_sounds (source);
create index if not exists trending_sounds_rank_idx on public.trending_sounds (rank);
create index if not exists trending_sounds_fetched_idx on public.trending_sounds (fetched_at);
create index if not exists voice_rooms_session_idx on public.voice_rooms (session_id);
create index if not exists voice_rooms_status_idx on public.voice_rooms (status);

-- RLS
alter table public.mashup_captions enable row level security;
alter table public.trending_sounds enable row level security;
alter table public.voice_rooms enable row level security;

-- Captions are publicly readable (like mashup metadata)
create policy "Captions are publicly readable" on public.mashup_captions
  for select using (true);

-- Trending sounds are publicly readable
create policy "Trending sounds are publicly readable" on public.trending_sounds
  for select using (true);

-- Voice rooms are readable by collaboration participants
create policy "Voice rooms are publicly readable" on public.voice_rooms
  for select using (true);
