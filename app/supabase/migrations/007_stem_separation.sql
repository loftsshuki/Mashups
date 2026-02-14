-- Stem separation metadata storage
-- Date: 2026-02-13

-- Table to store separated stems for mashups
create table if not exists public.mashup_stems (
  id uuid primary key default gen_random_uuid(),
  mashup_id uuid references public.mashups(id) on delete cascade,
  original_track_name text not null,
  original_track_url text not null,
  
  -- Separated stem URLs
  vocals_url text not null,
  drums_url text not null,
  bass_url text not null,
  other_url text not null,
  
  -- Processing metadata
  processing_time_seconds numeric,
  model_version text default 'demucs-htdemucs',
  
  -- Mixer settings (saved per stem)
  vocals_volume integer default 80 check (vocals_volume >= 0 and vocals_volume <= 100),
  vocals_muted boolean default false,
  drums_volume integer default 80 check (drums_volume >= 0 and drums_volume <= 100),
  drums_muted boolean default false,
  bass_volume integer default 80 check (bass_volume >= 0 and bass_volume <= 100),
  bass_muted boolean default false,
  other_volume integer default 80 check (other_volume >= 0 and other_volume <= 100),
  other_muted boolean default false,
  
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists mashup_stems_mashup_idx on public.mashup_stems (mashup_id);
create index if not exists mashup_stems_created_idx on public.mashup_stems (created_at desc);

-- Enable RLS
alter table public.mashup_stems enable row level security;

-- RLS Policies

-- Creators can view stems on their own mashups
create policy "Creators can view stems on own mashups" on public.mashup_stems
  for select using (
    exists (
      select 1 from public.mashups
      where mashups.id = mashup_stems.mashup_id
      and (mashups.creator_id = auth.uid() or mashups.is_published = true)
    )
  );

-- Creators can insert stems for their own mashups
create policy "Creators can insert stems for own mashups" on public.mashup_stems
  for insert with check (
    exists (
      select 1 from public.mashups
      where mashups.id = mashup_stems.mashup_id
      and auth.uid() = mashups.creator_id
    )
  );

-- Creators can update stems on their own mashups (for mixer settings)
create policy "Creators can update stems on own mashups" on public.mashup_stems
  for update using (
    exists (
      select 1 from public.mashups
      where mashups.id = mashup_stems.mashup_id
      and auth.uid() = mashups.creator_id
    )
  );

-- Creators can delete stems on their own mashups
create policy "Creators can delete stems on own mashups" on public.mashup_stems
  for delete using (
    exists (
      select 1 from public.mashups
      where mashups.id = mashup_stems.mashup_id
      and auth.uid() = mashups.creator_id
    )
  );

-- Add column to mashups table to track if stems are available
alter table public.mashups 
  add column if not exists has_stems boolean default false,
  add column if not exists stems_count integer default 0;

-- Function to update mashup stems count
create or replace function update_mashup_stems_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.mashups
    set 
      has_stems = true,
      stems_count = (select count(*) from public.mashup_stems where mashup_id = new.mashup_id)
    where id = new.mashup_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.mashups
    set 
      has_stems = exists (select 1 from public.mashup_stems where mashup_id = old.mashup_id),
      stems_count = (select count(*) from public.mashup_stems where mashup_id = old.mashup_id)
    where id = old.mashup_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger to maintain stems count
drop trigger if exists on_mashup_stems_change on public.mashup_stems;
create trigger on_mashup_stems_change
  after insert or delete on public.mashup_stems
  for each row
  execute function update_mashup_stems_count();
