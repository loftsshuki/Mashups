-- Phase 4: Rights & Monetization 2.0 (Medium Priority)
-- Sample Clearance Marketplace, Creator Tip Jar, Royalty Dashboard 2.0

-- =====================================================
-- 1. Sample Clearance Marketplace
-- =====================================================

-- Marketplace listings (samples available for licensing)
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sample_type TEXT NOT NULL DEFAULT 'loop', -- loop, one_shot, stem, vocal, full_track
  genre TEXT,
  bpm INTEGER,
  key TEXT,
  duration_seconds NUMERIC,
  preview_url TEXT,
  download_url TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  bulk_price_cents INTEGER, -- price for bulk/pack purchase
  license_type TEXT NOT NULL DEFAULT 'standard', -- standard, exclusive, creative_commons
  is_ai_alternative BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  download_count INTEGER DEFAULT 0,
  rating_avg NUMERIC DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sample purchases / clearances
CREATE TABLE IF NOT EXISTS sample_clearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mashup_id UUID REFERENCES mashups(id) ON DELETE SET NULL,
  price_cents INTEGER NOT NULL,
  license_type TEXT NOT NULL,
  cleared_at TIMESTAMPTZ DEFAULT now(),
  license_document_url TEXT,
  UNIQUE(listing_id, buyer_id, mashup_id)
);

-- Sample ratings
CREATE TABLE IF NOT EXISTS sample_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(listing_id, user_id)
);

-- Marketplace collections / packs
CREATE TABLE IF NOT EXISTS marketplace_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  price_cents INTEGER NOT NULL,
  discount_percent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_pack_items (
  pack_id UUID NOT NULL REFERENCES marketplace_packs(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  PRIMARY KEY (pack_id, listing_id)
);

-- =====================================================
-- 2. Creator Tip Jar
-- =====================================================

CREATE TABLE IF NOT EXISTS tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipper_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mashup_id UUID REFERENCES mashups(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 100), -- minimum $1
  currency TEXT NOT NULL DEFAULT 'USD',
  message TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Public thank-you wall view
CREATE TABLE IF NOT EXISTS tip_thank_yous (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id UUID NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 3. Royalty Dashboard 2.0 (enhanced analytics)
-- =====================================================

-- Stream-by-stream tracking for royalty breakdown
CREATE TABLE IF NOT EXISTS royalty_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mashup_id UUID REFERENCES mashups(id) ON DELETE SET NULL,
  source TEXT NOT NULL, -- 'play', 'tip', 'marketplace_sale', 'subscription', 'split', 'referral'
  platform TEXT, -- 'web', 'tiktok', 'instagram', 'youtube', 'spotify'
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  metadata JSONB DEFAULT '{}',
  streamed_at TIMESTAMPTZ DEFAULT now()
);

-- Monthly projections (pre-computed for dashboard)
CREATE TABLE IF NOT EXISTS royalty_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- 'YYYY-MM' format
  projected_cents INTEGER NOT NULL DEFAULT 0,
  actual_cents INTEGER DEFAULT 0,
  source_breakdown JSONB DEFAULT '{}', -- { "tip": 500, "play": 300, ... }
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month)
);

-- Tax documents
CREATE TABLE IF NOT EXISTS tax_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  document_type TEXT NOT NULL DEFAULT '1099-MISC', -- 1099-MISC, W-9, etc.
  total_earnings_cents INTEGER NOT NULL DEFAULT 0,
  document_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tax_year, document_type)
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_genre ON marketplace_listings(genre);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_type ON marketplace_listings(sample_type);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_price ON marketplace_listings(price_cents);
CREATE INDEX IF NOT EXISTS idx_sample_clearances_buyer ON sample_clearances(buyer_id);
CREATE INDEX IF NOT EXISTS idx_sample_clearances_listing ON sample_clearances(listing_id);
CREATE INDEX IF NOT EXISTS idx_tips_creator ON tips(creator_id);
CREATE INDEX IF NOT EXISTS idx_tips_tipper ON tips(tipper_id);
CREATE INDEX IF NOT EXISTS idx_tips_mashup ON tips(mashup_id);
CREATE INDEX IF NOT EXISTS idx_royalty_streams_user ON royalty_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_royalty_streams_mashup ON royalty_streams(mashup_id);
CREATE INDEX IF NOT EXISTS idx_royalty_streams_source ON royalty_streams(source);
CREATE INDEX IF NOT EXISTS idx_royalty_streams_date ON royalty_streams(streamed_at);
CREATE INDEX IF NOT EXISTS idx_royalty_projections_user ON royalty_projections(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_documents_user ON tax_documents(user_id);

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_clearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_pack_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_thank_yous ENABLE ROW LEVEL SECURITY;
ALTER TABLE royalty_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE royalty_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_documents ENABLE ROW LEVEL SECURITY;

-- Marketplace: anyone can view published listings
CREATE POLICY marketplace_listings_select ON marketplace_listings
  FOR SELECT USING (is_published = true);

CREATE POLICY marketplace_listings_insert ON marketplace_listings
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY marketplace_listings_update ON marketplace_listings
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY marketplace_listings_delete ON marketplace_listings
  FOR DELETE USING (auth.uid() = seller_id);

-- Clearances: buyer and seller can view
CREATE POLICY sample_clearances_select ON sample_clearances
  FOR SELECT USING (
    auth.uid() = buyer_id OR
    auth.uid() IN (SELECT seller_id FROM marketplace_listings WHERE id = listing_id)
  );

CREATE POLICY sample_clearances_insert ON sample_clearances
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Ratings: anyone can view, owner can insert/update
CREATE POLICY sample_ratings_select ON sample_ratings
  FOR SELECT USING (true);

CREATE POLICY sample_ratings_insert ON sample_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tips: public tips visible to all, private tips to tipper + creator
CREATE POLICY tips_select ON tips
  FOR SELECT USING (is_public = true OR auth.uid() = tipper_id OR auth.uid() = creator_id);

CREATE POLICY tips_insert ON tips
  FOR INSERT WITH CHECK (auth.uid() = tipper_id);

-- Thank yous: public
CREATE POLICY tip_thank_yous_select ON tip_thank_yous
  FOR SELECT USING (true);

CREATE POLICY tip_thank_yous_insert ON tip_thank_yous
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Royalty streams: owner only
CREATE POLICY royalty_streams_select ON royalty_streams
  FOR SELECT USING (auth.uid() = user_id);

-- Projections: owner only
CREATE POLICY royalty_projections_select ON royalty_projections
  FOR SELECT USING (auth.uid() = user_id);

-- Tax docs: owner only
CREATE POLICY tax_documents_select ON tax_documents
  FOR SELECT USING (auth.uid() = user_id);

-- Packs: public view, seller manages
CREATE POLICY marketplace_packs_select ON marketplace_packs
  FOR SELECT USING (true);

CREATE POLICY marketplace_packs_insert ON marketplace_packs
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY marketplace_pack_items_select ON marketplace_pack_items
  FOR SELECT USING (true);
