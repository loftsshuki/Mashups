-- 020_ai_jobs_ai_generation_type.sql
--
-- Allow 'ai_generation' as an ai_jobs.job_type.
--
-- enforceTierLimit("ai_generations") counts rows where job_type = 'ai_generation',
-- but the original CHECK constraint (012) did not permit that value — so AI
-- generation usage could never be recorded and the monthly limit never triggered.
-- The app now records usage via recordUsage(); this widens the constraint so
-- those inserts succeed.
--
-- Purely additive (widens an allow-list); safe to apply. Until it is applied,
-- AI usage recording fails quietly (best-effort) and limits behave as before.

alter table public.ai_jobs drop constraint if exists ai_jobs_job_type_check;

alter table public.ai_jobs add constraint ai_jobs_job_type_check
  check (job_type in (
    'mashup',
    'stem_separation',
    'vocal_generation',
    'caption',
    'sound_extraction',
    'ai_generation'
  ));
