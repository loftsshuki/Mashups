-- =============================================================================
-- 008_community_social_v2.sql
-- Collaborative Playlists, Follow Feed support, Comment System 2.0
-- =============================================================================

-- ---------------------------------------------------------------------------
-- FEATURE 1: Collaborative Playlists
-- ---------------------------------------------------------------------------

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_image_url text,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  is_collaborative boolean not null default true,
  is_public boolean not null default true,
  track_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playlist_tracks (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  mashup_id uuid not null references public.mashups(id) on delete cascade,
  added_by uuid not null references public.profiles(id) on delete cascade,
  position integer not null default 0,
  added_at timestamptz not null default now(),
  unique (playlist_id, mashup_id)
);

create table if not exists public.playlist_comments (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- FEATURE 2: Follow Feed
-- ---------------------------------------------------------------------------

create table if not exists public.feed_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  preferred_genres text[] not null default '{}',
  preferred_bpm_min integer,
  preferred_bpm_max integer,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- FEATURE 3: Comment System 2.0
-- ---------------------------------------------------------------------------

alter table public.comments
  add column if not exists parent_id uuid references public.comments(id) on delete cascade,
  add column if not exists timestamp_sec numeric,
  add column if not exists edited_at timestamptz;

create table if not exists public.comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (comment_id, user_id, emoji)
);

create table if not exists public.comment_mentions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  mentioned_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (comment_id, mentioned_user_id)
);

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------

create index if not exists playlists_creator_idx on public.playlists (creator_id);
create index if not exists playlists_public_idx on public.playlists (is_public) where is_public = true;
create index if not exists playlist_tracks_playlist_idx on public.playlist_tracks (playlist_id, position);
create index if not exists playlist_tracks_mashup_idx on public.playlist_tracks (mashup_id);
create index if not exists playlist_comments_playlist_idx on public.playlist_comments (playlist_id, created_at desc);
create index if not exists comments_parent_idx on public.comments (parent_id) where parent_id is not null;
create index if not exists comments_timestamp_idx on public.comments (mashup_id, timestamp_sec) where timestamp_sec is not null;
create index if not exists comment_reactions_comment_idx on public.comment_reactions (comment_id);
create index if not exists comment_reactions_user_idx on public.comment_reactions (user_id);
create index if not exists comment_mentions_user_idx on public.comment_mentions (mentioned_user_id);
create index if not exists follows_follower_created_idx on public.follows (follower_id, created_at desc);

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.playlist_comments enable row level security;
alter table public.feed_preferences enable row level security;
alter table public.comment_reactions enable row level security;
alter table public.comment_mentions enable row level security;

-- Playlists policies
create policy "Public playlists viewable by everyone" on public.playlists
  for select using (is_public = true or auth.uid() = creator_id);

create policy "Users can create own playlists" on public.playlists
  for insert with check (auth.uid() = creator_id);

create policy "Creators can update own playlists" on public.playlists
  for update using (auth.uid() = creator_id);

create policy "Creators can delete own playlists" on public.playlists
  for delete using (auth.uid() = creator_id);

-- Playlist tracks policies
create policy "Playlist tracks viewable with playlist" on public.playlist_tracks
  for select using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_tracks.playlist_id
      and (p.is_public = true or p.creator_id = auth.uid())
    )
  );

create policy "Authenticated users can add to collaborative playlists" on public.playlist_tracks
  for insert with check (
    auth.uid() = added_by
    and exists (
      select 1 from public.playlists p
      where p.id = playlist_tracks.playlist_id
      and p.is_collaborative = true
    )
  );

create policy "Track adders and playlist owners can remove tracks" on public.playlist_tracks
  for delete using (
    auth.uid() = added_by
    or exists (
      select 1 from public.playlists p
      where p.id = playlist_tracks.playlist_id
      and p.creator_id = auth.uid()
    )
  );

-- Playlist comments policies
create policy "Playlist comments viewable with playlist" on public.playlist_comments
  for select using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_comments.playlist_id
      and (p.is_public = true or p.creator_id = auth.uid())
    )
  );

create policy "Authenticated users can comment on playlists" on public.playlist_comments
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own playlist comments" on public.playlist_comments
  for delete using (auth.uid() = user_id);

-- Feed preferences policies
create policy "Users can view own feed preferences" on public.feed_preferences
  for select using (auth.uid() = user_id);

create policy "Users can manage own feed preferences" on public.feed_preferences
  for all using (auth.uid() = user_id);

-- Comment reactions policies
create policy "Comment reactions are viewable by everyone" on public.comment_reactions
  for select using (true);

create policy "Users can manage own reactions" on public.comment_reactions
  for all using (auth.uid() = user_id);

-- Comment mentions policies
create policy "Comment mentions are viewable by everyone" on public.comment_mentions
  for select using (true);

create policy "Authenticated users can create mentions" on public.comment_mentions
  for insert with check (
    exists (
      select 1 from public.comments c
      where c.id = comment_mentions.comment_id
      and c.user_id = auth.uid()
    )
  );
