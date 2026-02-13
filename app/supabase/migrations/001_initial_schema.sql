-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- Mashups
create table if not exists public.mashups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  creator_id uuid references public.profiles(id) on delete cascade,
  audio_url text not null,
  cover_image_url text,
  genre text,
  bpm integer,
  duration integer,
  play_count integer default 0,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Source tracks (songs in a mashup)
create table if not exists public.source_tracks (
  id uuid primary key default gen_random_uuid(),
  mashup_id uuid references public.mashups(id) on delete cascade,
  title text not null,
  artist text not null,
  position integer
);

-- Likes
create table if not exists public.likes (
  user_id uuid references public.profiles(id) on delete cascade,
  mashup_id uuid references public.mashups(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, mashup_id)
);

-- Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  mashup_id uuid references public.mashups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Follows
create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.mashups enable row level security;
alter table public.source_tracks enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Mashups policies
create policy "Published mashups are viewable by everyone" on public.mashups
  for select using (is_published = true or auth.uid() = creator_id);

create policy "Users can insert own mashups" on public.mashups
  for insert with check (auth.uid() = creator_id);

create policy "Users can update own mashups" on public.mashups
  for update using (auth.uid() = creator_id);

create policy "Users can delete own mashups" on public.mashups
  for delete using (auth.uid() = creator_id);

-- Source tracks policies
create policy "Source tracks viewable with mashup" on public.source_tracks
  for select using (
    exists (
      select 1 from public.mashups
      where mashups.id = source_tracks.mashup_id
      and (mashups.is_published = true or auth.uid() = mashups.creator_id)
    )
  );

create policy "Users can manage source tracks for own mashups" on public.source_tracks
  for all using (
    exists (
      select 1 from public.mashups
      where mashups.id = source_tracks.mashup_id
      and auth.uid() = mashups.creator_id
    )
  );

-- Likes policies
create policy "Likes are viewable by everyone" on public.likes
  for select using (true);

create policy "Users can manage own likes" on public.likes
  for all using (auth.uid() = user_id);

-- Comments policies
create policy "Comments are viewable by everyone" on public.comments
  for select using (true);

create policy "Authenticated users can insert comments" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own comments" on public.comments
  for delete using (auth.uid() = user_id);

-- Follows policies
create policy "Follows are viewable by everyone" on public.follows
  for select using (true);

create policy "Users can manage own follows" on public.follows
  for all using (auth.uid() = follower_id);
