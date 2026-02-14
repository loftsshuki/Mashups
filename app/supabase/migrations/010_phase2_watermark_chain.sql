-- Phase 2: Attribution Watermark System — chain-of-custody tracking
-- Extends the existing attribution/fingerprint infrastructure

-- Audio fingerprints for watermark detection
CREATE TABLE IF NOT EXISTS audio_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id UUID NOT NULL REFERENCES mashups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fingerprint_hash TEXT NOT NULL,
  spectral_features JSONB DEFAULT '{}',
  duration_seconds NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mashup_id)
);

-- Watermark embeddings
CREATE TABLE IF NOT EXISTS watermark_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id UUID NOT NULL REFERENCES mashups(id) ON DELETE CASCADE,
  fingerprint_id UUID REFERENCES audio_fingerprints(id) ON DELETE SET NULL,
  watermark_type TEXT NOT NULL DEFAULT 'metadata', -- metadata, spectral, inaudible
  payload JSONB NOT NULL DEFAULT '{}',
  embedded_at TIMESTAMPTZ DEFAULT now()
);

-- Chain-of-custody log: tracks every usage/detection of a watermarked file
CREATE TABLE IF NOT EXISTS watermark_custody_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint_id UUID NOT NULL REFERENCES audio_fingerprints(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'created', 'exported', 'detected', 'claimed', 'verified'
  platform TEXT, -- 'tiktok', 'youtube', 'instagram', 'soundcloud', etc.
  detected_url TEXT,
  detected_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  confidence NUMERIC,
  metadata JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ DEFAULT now()
);

-- Generated captions storage
CREATE TABLE IF NOT EXISTS generated_captions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id UUID NOT NULL REFERENCES mashups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'en',
  segments JSONB NOT NULL DEFAULT '[]',
  social_captions JSONB DEFAULT '{}',
  format TEXT DEFAULT 'srt',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Generated thumbnails storage
CREATE TABLE IF NOT EXISTS generated_thumbnails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id UUID NOT NULL REFERENCES mashups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id TEXT,
  platform TEXT DEFAULT 'youtube',
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fingerprints_mashup ON audio_fingerprints(mashup_id);
CREATE INDEX IF NOT EXISTS idx_fingerprints_hash ON audio_fingerprints(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_watermark_embeddings_mashup ON watermark_embeddings(mashup_id);
CREATE INDEX IF NOT EXISTS idx_custody_log_fingerprint ON watermark_custody_log(fingerprint_id);
CREATE INDEX IF NOT EXISTS idx_custody_log_event ON watermark_custody_log(event_type);
CREATE INDEX IF NOT EXISTS idx_captions_mashup ON generated_captions(mashup_id);
CREATE INDEX IF NOT EXISTS idx_thumbnails_mashup ON generated_thumbnails(mashup_id);

-- RLS
ALTER TABLE audio_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE watermark_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE watermark_custody_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_thumbnails ENABLE ROW LEVEL SECURITY;

CREATE POLICY fingerprints_select ON audio_fingerprints
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY fingerprints_insert ON audio_fingerprints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY watermark_embeddings_select ON watermark_embeddings
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM audio_fingerprints WHERE id = fingerprint_id)
  );

CREATE POLICY custody_log_select ON watermark_custody_log
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM audio_fingerprints WHERE id = fingerprint_id)
  );

CREATE POLICY captions_select ON generated_captions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY captions_insert ON generated_captions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY thumbnails_select ON generated_thumbnails
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY thumbnails_insert ON generated_thumbnails
  FOR INSERT WITH CHECK (auth.uid() = user_id);
