-- Stem registry and growth foundation tables
-- Date: 2026-02-14
-- Supports: #1 One-Tap Remix, #2 Stem Roulette, #10 Challenges v2,
--           #12 Stems Like This, #15 Sample Credit Trail, #17 Flip Chains,
--           #20 Crates, #22 Creative Streaks, #23 Seasons, #26 Stem Royalties,
--           #31 Infinite Stems, #44 Stem Provenance

-- =========================================================================
-- Stems as first-class entities (separate from mashup_stems separation data)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.stems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  instrument TEXT, -- vocal, drums, bass, synth, texture, other
  genre TEXT,
  bpm SMALLINT,
  key TEXT, -- e.g. "Cm", "F#"
  duration_ms INT,
  audio_url TEXT NOT NULL,
  waveform_data JSONB,
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'upload', -- upload, ai_generated, separated, recorded
  play_count INT DEFAULT 0,
  usage_count INT DEFAULT 0, -- how many mashups use this stem
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Junction: which first-class stems appear in which mashups
-- Named stem_mashup_links to avoid conflict with existing mashup_stems table
CREATE TABLE IF NOT EXISTS public.stem_mashup_links (
  mashup_id UUID REFERENCES public.mashups(id) ON DELETE CASCADE,
  stem_id UUID REFERENCES public.stems(id),
  track_number SMALLINT,
  PRIMARY KEY (mashup_id, stem_id)
);

-- =========================================================================
-- Crates — shared stem collections (idea #20)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.crates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  follower_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crate_stems (
  crate_id UUID REFERENCES public.crates(id) ON DELETE CASCADE,
  stem_id UUID REFERENCES public.stems(id),
  added_by UUID REFERENCES public.profiles(id),
  added_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (crate_id, stem_id)
);

-- =========================================================================
-- Stem provenance tracking (idea #44)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.stem_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stem_id UUID REFERENCES public.stems(id),
  mashup_id UUID REFERENCES public.mashups(id),
  total_plays_contributed INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- Creative streaks (idea #22)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.creative_streaks (
  user_id UUID REFERENCES public.profiles(id) PRIMARY KEY,
  current_weekly_streak INT DEFAULT 0,
  longest_weekly_streak INT DEFAULT 0,
  last_creation_week TEXT, -- ISO week like '2026-W07'
  streak_history JSONB DEFAULT '[]'
);

-- =========================================================================
-- Platform challenges v2 (ideas #10, #17, #18)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.platform_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'flip', 'chain', 'collision', 'blind_test', 'roulette'
  title TEXT NOT NULL,
  description TEXT,
  stem_ids UUID[] DEFAULT '{}',
  genre_pair TEXT[], -- for collision events
  rules JSONB,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  max_entries INT,
  prize_description TEXT,
  status TEXT DEFAULT 'upcoming', -- upcoming, active, voting, completed
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- Seasons (idea #23)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  theme TEXT,
  description TEXT,
  stem_pack_ids UUID[] DEFAULT '{}',
  collective_goal INT, -- target mashup count
  current_count INT DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  status TEXT DEFAULT 'upcoming'
);

-- =========================================================================
-- Indexes
-- =========================================================================
CREATE INDEX IF NOT EXISTS stems_creator_idx ON public.stems (creator_id);
CREATE INDEX IF NOT EXISTS stems_instrument_idx ON public.stems (instrument);
CREATE INDEX IF NOT EXISTS stems_genre_idx ON public.stems (genre);
CREATE INDEX IF NOT EXISTS stems_source_idx ON public.stems (source);
CREATE INDEX IF NOT EXISTS stems_created_idx ON public.stems (created_at DESC);
CREATE INDEX IF NOT EXISTS stem_mashup_links_stem_idx ON public.stem_mashup_links (stem_id);
CREATE INDEX IF NOT EXISTS crates_creator_idx ON public.crates (creator_id);
CREATE INDEX IF NOT EXISTS crate_stems_stem_idx ON public.crate_stems (stem_id);
CREATE INDEX IF NOT EXISTS stem_usage_log_stem_idx ON public.stem_usage_log (stem_id);
CREATE INDEX IF NOT EXISTS stem_usage_log_mashup_idx ON public.stem_usage_log (mashup_id);
CREATE INDEX IF NOT EXISTS platform_challenges_status_idx ON public.platform_challenges (status);
CREATE INDEX IF NOT EXISTS platform_challenges_type_idx ON public.platform_challenges (type);
CREATE INDEX IF NOT EXISTS seasons_status_idx ON public.seasons (status);

-- =========================================================================
-- Enable RLS on all new tables
-- =========================================================================
ALTER TABLE public.stems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stem_mashup_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crate_stems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stem_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- RLS Policies
-- =========================================================================

-- Stems: public read, creator insert/update/delete
CREATE POLICY "Stems are publicly readable" ON public.stems
  FOR SELECT USING (true);
CREATE POLICY "Creators can insert own stems" ON public.stems
  FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own stems" ON public.stems
  FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete own stems" ON public.stems
  FOR DELETE USING (auth.uid() = creator_id);

-- Stem mashup links: public read, mashup creator can manage
CREATE POLICY "Stem links are publicly readable" ON public.stem_mashup_links
  FOR SELECT USING (true);
CREATE POLICY "Mashup creators can manage stem links" ON public.stem_mashup_links
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.mashups WHERE id = mashup_id AND creator_id = auth.uid())
  );

-- Crates: public crates readable, creator manages own
CREATE POLICY "Public crates are readable" ON public.crates
  FOR SELECT USING (is_public OR creator_id = auth.uid());
CREATE POLICY "Creators can insert own crates" ON public.crates
  FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own crates" ON public.crates
  FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete own crates" ON public.crates
  FOR DELETE USING (auth.uid() = creator_id);

-- Crate stems: readable if crate is readable, contributor can add
CREATE POLICY "Crate stems are readable" ON public.crate_stems
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.crates WHERE id = crate_id AND (is_public OR creator_id = auth.uid()))
  );
CREATE POLICY "Users can add stems to crates" ON public.crate_stems
  FOR INSERT WITH CHECK (auth.uid() = added_by);

-- Stem usage log: public read
CREATE POLICY "Stem usage log is publicly readable" ON public.stem_usage_log
  FOR SELECT USING (true);

-- Creative streaks: user sees own
CREATE POLICY "Users can view own streaks" ON public.creative_streaks
  FOR SELECT USING (true);
CREATE POLICY "Users can manage own streaks" ON public.creative_streaks
  FOR ALL USING (auth.uid() = user_id);

-- Platform challenges: public read, admin insert (no RLS restriction for now)
CREATE POLICY "Challenges are publicly readable" ON public.platform_challenges
  FOR SELECT USING (true);

-- Seasons: public read
CREATE POLICY "Seasons are publicly readable" ON public.seasons
  FOR SELECT USING (true);
