-- Phase 5: AI-Powered Features
-- AI Mastering, Style Transfer, Stem Swapping, Lyrics/Transcription

-- ============================================================
-- 1. AI Mastering
-- ============================================================

CREATE TABLE IF NOT EXISTS mastering_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  genre TEXT,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mastering_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mashup_id UUID REFERENCES mashups(id) ON DELETE SET NULL,
  preset_id UUID REFERENCES mastering_presets(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  input_url TEXT,
  output_url TEXT,
  analysis JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. Style Transfer
-- ============================================================

CREATE TABLE IF NOT EXISTS style_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  artist_reference TEXT,
  genre TEXT,
  style_embedding JSONB DEFAULT '{}',
  preview_url TEXT,
  is_system BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS style_transfer_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mashup_id UUID REFERENCES mashups(id) ON DELETE SET NULL,
  style_preset_id UUID REFERENCES style_presets(id) ON DELETE SET NULL,
  target_stem TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  input_url TEXT,
  output_url TEXT,
  settings JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. Stem Swapping
-- ============================================================

CREATE TABLE IF NOT EXISTS stem_swap_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL,
  stem_type TEXT NOT NULL,
  audio_url TEXT,
  bpm_range_min INTEGER,
  bpm_range_max INTEGER,
  is_system BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stem_swap_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mashup_id UUID REFERENCES mashups(id) ON DELETE SET NULL,
  kit_id UUID REFERENCES stem_swap_kits(id) ON DELETE SET NULL,
  target_stem TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  input_url TEXT,
  output_url TEXT,
  settings JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. Lyrics / Transcription
-- ============================================================

CREATE TABLE IF NOT EXISTS lyrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id UUID NOT NULL REFERENCES mashups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'en',
  synced_lyrics JSONB NOT NULL DEFAULT '[]',
  plain_text TEXT,
  source TEXT DEFAULT 'transcription',
  confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_mastering_presets_user ON mastering_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_mastering_presets_system ON mastering_presets(is_system) WHERE is_system = true;
CREATE INDEX IF NOT EXISTS idx_mastering_jobs_user ON mastering_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_mastering_jobs_mashup ON mastering_jobs(mashup_id);
CREATE INDEX IF NOT EXISTS idx_mastering_jobs_status ON mastering_jobs(status);

CREATE INDEX IF NOT EXISTS idx_style_presets_system ON style_presets(is_system) WHERE is_system = true;
CREATE INDEX IF NOT EXISTS idx_style_presets_genre ON style_presets(genre);
CREATE INDEX IF NOT EXISTS idx_style_transfer_jobs_user ON style_transfer_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_style_transfer_jobs_mashup ON style_transfer_jobs(mashup_id);
CREATE INDEX IF NOT EXISTS idx_style_transfer_jobs_status ON style_transfer_jobs(status);

CREATE INDEX IF NOT EXISTS idx_stem_swap_kits_genre ON stem_swap_kits(genre);
CREATE INDEX IF NOT EXISTS idx_stem_swap_kits_stem_type ON stem_swap_kits(stem_type);
CREATE INDEX IF NOT EXISTS idx_stem_swap_jobs_user ON stem_swap_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_stem_swap_jobs_mashup ON stem_swap_jobs(mashup_id);
CREATE INDEX IF NOT EXISTS idx_stem_swap_jobs_status ON stem_swap_jobs(status);

CREATE INDEX IF NOT EXISTS idx_lyrics_mashup ON lyrics(mashup_id);
CREATE INDEX IF NOT EXISTS idx_lyrics_user ON lyrics(user_id);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE mastering_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastering_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_transfer_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stem_swap_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE stem_swap_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lyrics ENABLE ROW LEVEL SECURITY;

-- Mastering Presets: SELECT system presets (public) or own presets, INSERT own only
CREATE POLICY mastering_presets_select ON mastering_presets
  FOR SELECT USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY mastering_presets_insert ON mastering_presets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mastering Jobs: SELECT/INSERT own user only
CREATE POLICY mastering_jobs_select ON mastering_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY mastering_jobs_insert ON mastering_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Style Presets: SELECT for all authenticated users (system presets are public)
CREATE POLICY style_presets_select ON style_presets
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Style Transfer Jobs: SELECT/INSERT own user only
CREATE POLICY style_transfer_jobs_select ON style_transfer_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY style_transfer_jobs_insert ON style_transfer_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Stem Swap Kits: SELECT for all authenticated users
CREATE POLICY stem_swap_kits_select ON stem_swap_kits
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Stem Swap Jobs: SELECT/INSERT own user only
CREATE POLICY stem_swap_jobs_select ON stem_swap_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY stem_swap_jobs_insert ON stem_swap_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Lyrics: SELECT/INSERT own user only
CREATE POLICY lyrics_select ON lyrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY lyrics_insert ON lyrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
