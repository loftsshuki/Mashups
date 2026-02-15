-- Phase 4: AI job tracking for async audio processing
-- Date: 2026-02-15

create table if not exists public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  job_type text not null check (job_type in ('mashup', 'stem_separation', 'vocal_generation', 'caption', 'sound_extraction')),
  status text not null check (status in ('queued', 'processing', 'complete', 'error')) default 'queued',
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  input_data jsonb not null default '{}'::jsonb,
  output_data jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists ai_jobs_user_idx on public.ai_jobs (user_id);
create index if not exists ai_jobs_status_idx on public.ai_jobs (status);
create index if not exists ai_jobs_type_idx on public.ai_jobs (job_type);

alter table public.ai_jobs enable row level security;

-- Users can view their own jobs
create policy "Users can view own AI jobs" on public.ai_jobs
  for select using (auth.uid() = user_id);

-- Users can create jobs
create policy "Users can create AI jobs" on public.ai_jobs
  for insert with check (auth.uid() = user_id);
