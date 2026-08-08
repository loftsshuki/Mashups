-- Green Room pilot: permissioned catalog, rights, processing, review, and beta measurement.

create table if not exists public.green_catalog_tracks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  organization_id uuid references public.rightsholder_organizations(id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  artist_name text not null check (char_length(artist_name) between 2 and 100),
  track_title text not null check (char_length(track_title) between 2 and 120),
  source_type text not null default 'artist_direct' check (source_type in ('mashups_original', 'artist_direct', 'label')),
  isrc text,
  genre text not null,
  bpm numeric(6,2),
  musical_key text,
  camelot_key text,
  energy smallint check (energy between 0 and 100),
  status text not null default 'draft' check (status in ('draft', 'rights_review', 'processing', 'listening_review', 'green', 'quarantined', 'withdrawn')),
  rights_status text not null default 'pending' check (rights_status in ('pending', 'verified', 'rejected', 'expired', 'withdrawn')),
  quality_status text not null default 'pending' check (quality_status in ('pending', 'passed', 'failed', 'manual_review')),
  public_preview_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint green_publish_gate check (
    status <> 'green' or
    (rights_status = 'verified' and quality_status = 'passed' and published_at is not null)
  )
);

create table if not exists public.green_rights_grants (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null unique references public.green_catalog_tracks(id) on delete cascade,
  submitted_by uuid not null references auth.users(id) on delete restrict,
  master_controller text not null,
  composition_controller text not null,
  master_control_confirmed boolean not null default false,
  composition_control_confirmed boolean not null default false,
  sample_status text not null check (sample_status in ('sample_free', 'cleared_samples', 'unknown')),
  stem_extraction_allowed boolean not null default false,
  cross_track_derivatives_allowed boolean not null default false,
  in_app_playback_allowed boolean not null default false,
  short_video_export_allowed boolean not null default false,
  standalone_audio_export_allowed boolean not null default false,
  paid_media_allowed boolean not null default false,
  territories text[] not null default array['Worldwide']::text[],
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  pairing_rules jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  attested_at timestamptz not null default now(),
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint green_rights_term_valid check (ends_at is null or ends_at > starts_at),
  constraint green_no_standalone_export check (standalone_audio_export_allowed = false)
);

create table if not exists public.green_track_assets (
  id uuid primary key default gen_random_uuid(),
  track_id uuid references public.green_catalog_tracks(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete restrict,
  asset_kind text not null check (asset_kind in ('master', 'stem_vocal', 'stem_drums', 'stem_bass', 'stem_other', 'preview', 'video_export')),
  blob_url text not null unique,
  blob_pathname text not null,
  content_type text not null,
  byte_size bigint not null check (byte_size > 0),
  access_level text not null default 'private' check (access_level in ('private', 'public')),
  sha256 text,
  quarantined_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.green_processing_jobs (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.green_catalog_tracks(id) on delete cascade,
  job_type text not null check (job_type in ('fingerprint', 'analyze', 'separate', 'render_candidates', 'render_video')),
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  provider text not null default 'internal',
  attempt_count smallint not null default 0,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error_code text,
  error_message text,
  available_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.green_track_analysis (
  track_id uuid primary key references public.green_catalog_tracks(id) on delete cascade,
  bpm numeric(6,2) not null,
  musical_key text not null,
  camelot_key text not null,
  integrated_lufs numeric(6,2) not null,
  true_peak_db numeric(6,2) not null,
  vocal_bleed_db numeric(6,2),
  separation_sdr_db numeric(6,2),
  phrase_confidence numeric(5,4) not null check (phrase_confidence between 0 and 1),
  sample_scan_status text not null check (sample_scan_status in ('clear', 'flagged', 'unavailable')),
  quality_reasons text[] not null default '{}',
  analyzed_at timestamptz not null default now()
);

create table if not exists public.green_projects (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references auth.users(id) on delete set null,
  anonymous_session_id text,
  left_track_id uuid not null references public.green_catalog_tracks(id) on delete restrict,
  right_track_id uuid not null references public.green_catalog_tracks(id) on delete restrict,
  parent_project_id uuid references public.green_projects(id) on delete set null,
  parameters jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'rendering', 'ready', 'published', 'archived')),
  selected_candidate_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint green_distinct_sources check (left_track_id <> right_track_id),
  constraint green_project_owner check (creator_id is not null or anonymous_session_id is not null)
);

create table if not exists public.green_render_candidates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.green_projects(id) on delete cascade,
  arrangement text not null check (arrangement in ('vocal_a_beat_b', 'vocal_b_beat_a', 'drop_swap')),
  asset_id uuid references public.green_track_assets(id) on delete set null,
  duration_seconds numeric(7,3) not null check (duration_seconds > 0 and duration_seconds <= 30.5),
  quality_score smallint not null check (quality_score between 0 and 100),
  quality_status text not null check (quality_status in ('passed', 'failed', 'manual_review')),
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(project_id, arrangement)
);

alter table public.green_projects
  add constraint green_selected_candidate_fk foreign key (selected_candidate_id)
  references public.green_render_candidates(id) on delete set null;

create table if not exists public.green_listening_reviews (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.green_render_candidates(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete restrict,
  decision text not null check (decision in ('keep', 'reject', 'rework')),
  musicality smallint not null check (musicality between 1 and 5),
  artifact_score smallint not null check (artifact_score between 1 and 5),
  share_confidence smallint not null check (share_confidence between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  unique(candidate_id, reviewer_id)
);

create table if not exists public.green_funnel_events (
  id bigint generated always as identity primary key,
  event_name text not null check (event_name in ('create_viewed', 'source_previewed', 'pair_selected', 'render_started', 'render_completed', 'candidate_played', 'candidate_kept', 'preview_downloaded', 'share_started')),
  user_id uuid references auth.users(id) on delete set null,
  session_id text not null check (char_length(session_id) between 8 and 120),
  project_id uuid references public.green_projects(id) on delete set null,
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists public.green_beta_invites (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  email text,
  cohort text not null default 'founding',
  max_uses smallint not null default 1 check (max_uses between 1 and 100),
  use_count smallint not null default 0 check (use_count >= 0 and use_count <= max_uses),
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists green_catalog_status_idx on public.green_catalog_tracks(status, published_at desc);
create index if not exists green_jobs_claim_idx on public.green_processing_jobs(status, available_at, created_at);
create index if not exists green_events_funnel_idx on public.green_funnel_events(event_name, occurred_at desc);
create index if not exists green_events_session_idx on public.green_funnel_events(session_id, occurred_at);

alter table public.green_catalog_tracks enable row level security;
alter table public.green_rights_grants enable row level security;
alter table public.green_track_assets enable row level security;
alter table public.green_processing_jobs enable row level security;
alter table public.green_track_analysis enable row level security;
alter table public.green_projects enable row level security;
alter table public.green_render_candidates enable row level security;
alter table public.green_listening_reviews enable row level security;
alter table public.green_funnel_events enable row level security;
alter table public.green_beta_invites enable row level security;

create policy "green catalog is publicly readable" on public.green_catalog_tracks
  for select using (status = 'green' and rights_status = 'verified' and quality_status = 'passed');
create policy "owners manage green submissions" on public.green_catalog_tracks
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "submitters read rights grants" on public.green_rights_grants
  for select using (submitted_by = auth.uid());
create policy "owners read private asset metadata" on public.green_track_assets
  for select using (owner_id = auth.uid());
create policy "creators manage their green projects" on public.green_projects
  for all using (creator_id = auth.uid()) with check (creator_id = auth.uid());
create policy "creators read project candidates" on public.green_render_candidates
  for select using (exists (select 1 from public.green_projects p where p.id = project_id and p.creator_id = auth.uid()));

comment on table public.green_catalog_tracks is 'Fail-closed source catalog. Green status requires verified rights and passed quality.';
comment on table public.green_track_assets is 'Blob metadata only. Master and stem objects live in a separate private Vercel Blob store.';
comment on table public.green_funnel_events is 'Server-validated pilot funnel used for progression and kill gates.';
