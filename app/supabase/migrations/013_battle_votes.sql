CREATE TABLE IF NOT EXISTS public.battle_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL,
  entry_id uuid NOT NULL REFERENCES public.challenge_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (battle_id, user_id)  -- one vote per user per battle
);

CREATE INDEX IF NOT EXISTS battle_votes_battle_idx ON public.battle_votes (battle_id);
CREATE INDEX IF NOT EXISTS battle_votes_user_idx ON public.battle_votes (user_id);

ALTER TABLE public.battle_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes in public battles"
  ON public.battle_votes FOR SELECT USING (true);

CREATE POLICY "Users can cast own votes"
  ON public.battle_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
