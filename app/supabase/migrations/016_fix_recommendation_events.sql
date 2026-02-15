-- Expand event_type CHECK to include recommendation-specific events
ALTER TABLE public.recommendation_events
  DROP CONSTRAINT IF EXISTS recommendation_events_event_type_check;

ALTER TABLE public.recommendation_events
  ADD CONSTRAINT recommendation_events_event_type_check
  CHECK (event_type IN (
    'impression', 'play', 'skip', 'like', 'share', 'open',
    'shown', 'clicked', 'dismissed', 'completed'
  ));

-- Add columns that recommendations.ts expects
ALTER TABLE public.recommendation_events
  ADD COLUMN IF NOT EXISTS recommendation_id text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
