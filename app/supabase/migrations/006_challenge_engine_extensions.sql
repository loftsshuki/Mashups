-- Challenge engine metadata extensions for full website backend support.
-- Date: 2026-02-13

alter table public.challenges
  add column if not exists external_id text,
  add column if not exists tag text,
  add column if not exists frequency text,
  add column if not exists sponsor text,
  add column if not exists reward_type text;

update public.challenges
set
  tag = coalesce(tag, 'Open'),
  frequency = coalesce(frequency, 'weekly'),
  reward_type = coalesce(reward_type, 'cash')
where tag is null or frequency is null or reward_type is null;

alter table public.challenges
  alter column tag set default 'Open',
  alter column tag set not null,
  alter column frequency set default 'weekly',
  alter column frequency set not null,
  alter column reward_type set default 'cash',
  alter column reward_type set not null;

create unique index if not exists challenges_external_id_uq
  on public.challenges (external_id)
  where external_id is not null;

create index if not exists challenges_status_starts_idx
  on public.challenges (status, starts_at);
