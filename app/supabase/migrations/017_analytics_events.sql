CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  mashup_id uuid REFERENCES public.mashups(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('play', 'like', 'share', 'comment', 'save', 'skip', 'download', 'embed')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_mashup_time_idx
  ON public.analytics_events (mashup_id, created_at);
CREATE INDEX IF NOT EXISTS analytics_events_user_time_idx
  ON public.analytics_events (user_id, created_at);
CREATE INDEX IF NOT EXISTS analytics_events_type_time_idx
  ON public.analytics_events (event_type, created_at);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "Users can log own events" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Creators can read events on their mashups
CREATE POLICY "Creators can view events on own mashups" ON public.analytics_events
  FOR SELECT USING (
    mashup_id IN (SELECT id FROM public.mashups WHERE creator_id = auth.uid())
  );
