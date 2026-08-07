-- Viral launch network: repeatable creative genomes, coordinated creator raids,
-- squad competition, public participation, bounties, unlocks, and lineage.

create table if not exists public.viral_launches (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  mashup_id uuid references public.mashups(id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  artist_name text not null,
  track_title text not null,
  track_audio_url text,
  objective text not null,
  phase text not null default 'draft' check (phase in ('draft', 'testing', 'mobilizing', 'live', 'completed')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  release_at timestamptz,
  is_pre_release boolean not null default false,
  is_public boolean not null default false,
  bounty_cents integer not null default 0 check (bounty_cents >= 0),
  currency text not null default 'USD',
  save_destinations jsonb not null default '[]'::jsonb,
  creators_activated integer not null default 0 check (creators_activated >= 0),
  qualified_posts integer not null default 0 check (qualified_posts >= 0),
  total_forks integer not null default 0 check (total_forks >= 0),
  total_saves integer not null default 0 check (total_saves >= 0),
  total_shares integer not null default 0 check (total_shares >= 0),
  creator_k_factor numeric not null default 0 check (creator_k_factor >= 0),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.viral_template_genomes (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  parent_id uuid references public.viral_template_genomes(id) on delete set null,
  creator_id uuid references public.profiles(id) on delete set null,
  name text not null,
  platform text not null check (platform in ('tiktok', 'instagram', 'youtube')),
  niche text not null,
  hook_start_sec numeric not null check (hook_start_sec >= 0),
  hook_duration_sec numeric not null check (hook_duration_sec between 5 and 60),
  opening_frame text not null,
  pattern text not null,
  text_beats jsonb not null default '[]'::jsonb,
  shot_count integer not null default 3 check (shot_count between 1 and 30),
  fork_count integer not null default 0 check (fork_count >= 0),
  qualified_activations integer not null default 0 check (qualified_activations >= 0),
  completion_rate numeric not null default 0 check (completion_rate between 0 and 1),
  share_rate numeric not null default 0 check (share_rate between 0 and 1),
  save_rate numeric not null default 0 check (save_rate between 0 and 1),
  viral_score numeric not null default 0 check (viral_score between 0 and 100),
  status text not null default 'testing' check (status in ('draft', 'testing', 'winner', 'retired')),
  created_at timestamptz not null default now()
);

create table if not exists public.viral_squads (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  captain_id uuid references public.profiles(id) on delete set null,
  name text not null,
  identity text not null,
  max_members integer not null default 20 check (max_members between 2 and 500),
  member_count integer not null default 0 check (member_count >= 0),
  qualified_posts integer not null default 0 check (qualified_posts >= 0),
  score numeric not null default 0 check (score >= 0),
  created_at timestamptz not null default now(),
  unique (launch_id, name)
);

create table if not exists public.viral_squad_members (
  squad_id uuid not null references public.viral_squads(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('captain', 'member')),
  joined_at timestamptz not null default now(),
  primary key (squad_id, creator_id)
);

create table if not exists public.viral_raids (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  name text not null,
  phase text not null check (phase in ('test', 'scale', 'blast')),
  starts_at timestamptz not null,
  target_creators integer not null check (target_creators > 0),
  activated_creators integer not null default 0 check (activated_creators >= 0),
  status text not null default 'queued' check (status in ('queued', 'active', 'complete')),
  brief jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.viral_activations (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  genome_id uuid references public.viral_template_genomes(id) on delete set null,
  squad_id uuid references public.viral_squads(id) on delete set null,
  creator_id uuid references public.profiles(id) on delete set null,
  platform text not null check (platform in ('tiktok', 'instagram', 'youtube')),
  external_post_url text,
  rights_valid boolean not null default false,
  attributed boolean not null default false,
  fraud_score numeric not null default 0 check (fraud_score between 0 and 1),
  engaged_views integer not null default 0 check (engaged_views >= 0),
  meaningful_actions integer not null default 0 check (meaningful_actions >= 0),
  qualified boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.viral_bounties (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  title text not null,
  metric text not null check (metric in ('qualified_posts', 'saves', 'forks', 'lift', 'squad_score')),
  pool_cents integer not null check (pool_cents > 0),
  rules jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('draft', 'open', 'judging', 'settled')),
  created_at timestamptz not null default now()
);

create table if not exists public.viral_bounty_awards (
  id uuid primary key default gen_random_uuid(),
  bounty_id uuid not null references public.viral_bounties(id) on delete cascade,
  creator_id uuid references public.profiles(id) on delete set null,
  squad_id uuid references public.viral_squads(id) on delete set null,
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'rejected')),
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.viral_unlocks (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  title text not null,
  action text not null check (action in ('posts', 'saves', 'forks', 'shares')),
  target integer not null check (target > 0),
  current_value integer not null default 0 check (current_value >= 0),
  reward text not null,
  unlocked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.viral_artist_commitments (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  commitment_type text not null check (commitment_type in ('reaction', 'repost', 'live_session', 'collaboration', 'exclusive_asset')),
  label text not null,
  target integer not null default 1 check (target > 0),
  completed integer not null default 0 check (completed >= 0),
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.viral_events (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  genome_id uuid references public.viral_template_genomes(id) on delete set null,
  creator_id uuid references public.profiles(id) on delete set null,
  anonymous_key text,
  event_type text not null check (event_type in ('page_view', 'save_click', 'share_intent', 'template_start', 'squad_join', 'vote', 'follow_click', 'qualified_post')),
  platform text,
  value numeric not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.viral_predictions (
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  genome_id uuid not null references public.viral_template_genomes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  confidence integer not null default 50 check (confidence between 1 and 100),
  settled_points integer,
  created_at timestamptz not null default now(),
  primary key (launch_id, user_id)
);

create table if not exists public.viral_royalty_rules (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  beneficiary_type text not null check (beneficiary_type in ('rightsholder', 'producer', 'template_creator', 'creator', 'curator', 'platform')),
  share_bps integer not null check (share_bps between 0 and 10000),
  depth_limit integer not null default 1 check (depth_limit between 0 and 10),
  created_at timestamptz not null default now()
);

create table if not exists public.viral_platform_packages (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.viral_launches(id) on delete cascade,
  genome_id uuid references public.viral_template_genomes(id) on delete cascade,
  platform text not null check (platform in ('tiktok', 'instagram', 'youtube')),
  duration_sec integer not null check (duration_sec between 5 and 60),
  caption text not null,
  first_comment text,
  posting_window_start timestamptz,
  asset_manifest jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (launch_id, genome_id, platform)
);

create index if not exists viral_launches_owner_idx on public.viral_launches (owner_id, created_at desc);
create index if not exists viral_launches_public_idx on public.viral_launches (is_public, phase, starts_at desc);
create index if not exists viral_genomes_launch_score_idx on public.viral_template_genomes (launch_id, viral_score desc);
create index if not exists viral_raids_launch_start_idx on public.viral_raids (launch_id, starts_at);
create index if not exists viral_activations_launch_idx on public.viral_activations (launch_id, qualified, created_at desc);
create index if not exists viral_events_launch_time_idx on public.viral_events (launch_id, created_at desc);
create index if not exists viral_events_anon_time_idx on public.viral_events (anonymous_key, created_at desc);

alter table public.viral_launches enable row level security;
alter table public.viral_template_genomes enable row level security;
alter table public.viral_squads enable row level security;
alter table public.viral_squad_members enable row level security;
alter table public.viral_raids enable row level security;
alter table public.viral_activations enable row level security;
alter table public.viral_bounties enable row level security;
alter table public.viral_bounty_awards enable row level security;
alter table public.viral_unlocks enable row level security;
alter table public.viral_artist_commitments enable row level security;
alter table public.viral_events enable row level security;
alter table public.viral_predictions enable row level security;
alter table public.viral_royalty_rules enable row level security;
alter table public.viral_platform_packages enable row level security;

create policy "Public launches are visible" on public.viral_launches for select
  using (is_public or owner_id = auth.uid());
create policy "Owners manage launches" on public.viral_launches for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Public launch genomes are visible" on public.viral_template_genomes for select
  using (exists (select 1 from public.viral_launches l where l.id = launch_id and (l.is_public or l.owner_id = auth.uid())));
create policy "Creators can fork public genomes" on public.viral_template_genomes for insert
  with check (creator_id = auth.uid() and exists (select 1 from public.viral_launches l where l.id = launch_id and l.is_public));
create policy "Owners manage launch genomes" on public.viral_template_genomes for all
  using (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()))
  with check (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()));

create policy "Public launch squads are visible" on public.viral_squads for select
  using (exists (select 1 from public.viral_launches l where l.id = launch_id and (l.is_public or l.owner_id = auth.uid())));
create policy "Authenticated creators join squads" on public.viral_squad_members for insert
  with check (creator_id = auth.uid());
create policy "Members can leave squads" on public.viral_squad_members for delete
  using (creator_id = auth.uid());
create policy "Squad rosters are visible for public launches" on public.viral_squad_members for select
  using (exists (select 1 from public.viral_squads s join public.viral_launches l on l.id = s.launch_id where s.id = squad_id and (l.is_public or l.owner_id = auth.uid())));

create policy "Public launch operations are visible" on public.viral_raids for select
  using (exists (select 1 from public.viral_launches l where l.id = launch_id and (l.is_public or l.owner_id = auth.uid())));
create policy "Public unlocks are visible" on public.viral_unlocks for select
  using (exists (select 1 from public.viral_launches l where l.id = launch_id and (l.is_public or l.owner_id = auth.uid())));
create policy "Public commitments are visible" on public.viral_artist_commitments for select
  using (exists (select 1 from public.viral_launches l where l.id = launch_id and (l.is_public or l.owner_id = auth.uid())));
create policy "Public platform packages are visible" on public.viral_platform_packages for select
  using (exists (select 1 from public.viral_launches l where l.id = launch_id and (l.is_public or l.owner_id = auth.uid())));

create policy "Owners view launch activations" on public.viral_activations for select
  using (creator_id = auth.uid() or exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()));
create policy "Creators submit own activations" on public.viral_activations for insert
  with check (creator_id = auth.uid());
create policy "Owners manage bounties" on public.viral_bounties for all
  using (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()))
  with check (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()));
create policy "Public bounties are visible" on public.viral_bounties for select
  using (exists (select 1 from public.viral_launches l where l.id = launch_id and l.is_public));
create policy "Award recipients and owners can read awards" on public.viral_bounty_awards for select
  using (creator_id = auth.uid() or exists (select 1 from public.viral_bounties b join public.viral_launches l on l.id = b.launch_id where b.id = bounty_id and l.owner_id = auth.uid()));

create policy "Authenticated users predict public winners" on public.viral_predictions for insert
  with check (user_id = auth.uid() and exists (select 1 from public.viral_launches l where l.id = launch_id and l.is_public));
create policy "Users manage own predictions" on public.viral_predictions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Owners manage royalty rules" on public.viral_royalty_rules for all
  using (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()))
  with check (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()));
create policy "Owners read launch events" on public.viral_events for select
  using (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()));

-- Supporting tables without direct public writes are mutated by audited server routes.
create policy "Owners manage squads" on public.viral_squads for all
  using (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()))
  with check (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()));
create policy "Owners manage raids" on public.viral_raids for all
  using (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()))
  with check (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()));
create policy "Owners manage unlocks" on public.viral_unlocks for all
  using (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()))
  with check (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()));
create policy "Owners manage commitments" on public.viral_artist_commitments for all
  using (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()))
  with check (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()));
create policy "Owners manage platform packages" on public.viral_platform_packages for all
  using (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()))
  with check (exists (select 1 from public.viral_launches l where l.id = launch_id and l.owner_id = auth.uid()));

create or replace function public.increment_viral_launch_counter(
  p_launch_id uuid,
  p_counter text,
  p_amount integer default 1
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_counter = 'saves' then
    update viral_launches set total_saves = total_saves + greatest(p_amount, 0), updated_at = now() where id = p_launch_id;
  elsif p_counter = 'shares' then
    update viral_launches set total_shares = total_shares + greatest(p_amount, 0), updated_at = now() where id = p_launch_id;
  elsif p_counter = 'forks' then
    update viral_launches set total_forks = total_forks + greatest(p_amount, 0), updated_at = now() where id = p_launch_id;
  else
    raise exception 'Unsupported viral counter';
  end if;
end;
$$;

revoke all on function public.increment_viral_launch_counter(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.increment_viral_launch_counter(uuid, text, integer) to service_role;

create or replace function public.record_viral_event(
  p_launch_id uuid,
  p_event_type text,
  p_anonymous_key text default null,
  p_genome_id uuid default null,
  p_creator_id uuid default null,
  p_platform text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_action text;
begin
  if p_event_type not in ('page_view', 'save_click', 'share_intent', 'template_start', 'squad_join', 'vote', 'follow_click', 'qualified_post') then
    raise exception 'Unsupported viral event';
  end if;

  if not exists (select 1 from viral_launches where id = p_launch_id and is_public) then
    raise exception 'Launch is not public';
  end if;

  insert into viral_events (launch_id, genome_id, creator_id, anonymous_key, event_type, platform, metadata)
  values (p_launch_id, p_genome_id, p_creator_id, left(p_anonymous_key, 120), p_event_type, left(p_platform, 30), coalesce(p_metadata, '{}'::jsonb))
  returning id into v_event_id;

  if p_event_type = 'save_click' then
    update viral_launches set total_saves = total_saves + 1, updated_at = now() where id = p_launch_id;
    v_action := 'saves';
  elsif p_event_type = 'share_intent' then
    update viral_launches set total_shares = total_shares + 1, updated_at = now() where id = p_launch_id;
    v_action := 'shares';
  elsif p_event_type = 'qualified_post' then
    update viral_launches set qualified_posts = qualified_posts + 1, updated_at = now() where id = p_launch_id;
    v_action := 'posts';
  end if;

  if v_action is not null then
    update viral_unlocks
      set current_value = current_value + 1,
          unlocked_at = case when unlocked_at is null and current_value + 1 >= target then now() else unlocked_at end
      where launch_id = p_launch_id and action = v_action;
  end if;

  return v_event_id;
end;
$$;

revoke all on function public.record_viral_event(uuid, text, text, uuid, uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.record_viral_event(uuid, text, text, uuid, uuid, text, jsonb) to service_role;

create or replace function public.record_viral_genome_fork(
  p_launch_id uuid,
  p_genome_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update viral_template_genomes
    set fork_count = fork_count + 1
    where id = p_genome_id and launch_id = p_launch_id;
  if not found then raise exception 'Template genome not found'; end if;

  update viral_launches set total_forks = total_forks + 1, updated_at = now() where id = p_launch_id;
  update viral_unlocks
    set current_value = current_value + 1,
        unlocked_at = case when unlocked_at is null and current_value + 1 >= target then now() else unlocked_at end
    where launch_id = p_launch_id and action = 'forks';
end;
$$;

create or replace function public.join_viral_squad(
  p_squad_id uuid,
  p_creator_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_squad viral_squads%rowtype;
  v_inserted integer;
begin
  select * into v_squad from viral_squads where id = p_squad_id for update;
  if v_squad.id is null then raise exception 'Squad not found'; end if;
  if not exists (select 1 from viral_launches where id = v_squad.launch_id and is_public) then raise exception 'Launch is not public'; end if;
  if exists (select 1 from viral_squad_members where squad_id = p_squad_id and creator_id = p_creator_id) then return 'already_joined'; end if;
  if v_squad.member_count >= v_squad.max_members then return 'full'; end if;

  insert into viral_squad_members (squad_id, creator_id) values (p_squad_id, p_creator_id) on conflict do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then return 'already_joined'; end if;
  update viral_squads set member_count = member_count + 1 where id = p_squad_id;
  update viral_launches set creators_activated = creators_activated + 1, updated_at = now() where id = v_squad.launch_id;
  return 'joined';
end;
$$;

revoke all on function public.record_viral_genome_fork(uuid, uuid) from public, anon, authenticated;
revoke all on function public.join_viral_squad(uuid, uuid) from public, anon, authenticated;
grant execute on function public.record_viral_genome_fork(uuid, uuid) to service_role;
grant execute on function public.join_viral_squad(uuid, uuid) to service_role;
