export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  email?: string
}

export interface Mashup {
  id: string
  title: string
  description: string | null
  creator_id: string
  audio_url: string
  cover_image_url: string | null
  genre: string | null
  bpm: number | null
  duration: number | null
  play_count: number
  is_published: boolean
  created_at: string
  updated_at: string
  // Joined fields
  creator?: Profile
  source_tracks?: SourceTrack[]
  like_count?: number
  comment_count?: number
}

export interface SourceTrack {
  id: string
  mashup_id: string
  title: string
  artist: string
  position: number | null
}

export interface Comment {
  id: string
  mashup_id: string
  user_id: string
  content: string
  created_at: string
  user?: Profile
}

export interface Like {
  user_id: string
  mashup_id: string
  created_at: string
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export type RightsMode = "owned" | "precleared" | "licensed"
export type RightsStatus = "verified" | "pending" | "rejected"

export interface RightsDeclaration {
  id: string
  mashup_id: string
  mode: RightsMode
  attested_at: string
  attestation_version: string
  status: RightsStatus
}

export interface RightsLicense {
  id: string
  rights_declaration_id: string
  licensor_name: string
  license_type: string
  start_date: string | null
  end_date: string | null
  territory: string | null
  document_url: string | null
  notes: string | null
}

export type ClaimStatus = "open" | "under_review" | "resolved" | "rejected"

export interface RightsClaim {
  id: string
  mashup_id: string
  claimant_contact: string
  claim_type: string
  submitted_at: string
  status: ClaimStatus
  resolution: string | null
  resolved_at: string | null
}

export type EarningsStatus = "pending" | "available" | "paid" | "reversed"

export interface EarningsLedgerEntry {
  id: string
  user_id: string
  source_type: string
  source_id: string | null
  amount_cents: number
  currency: string
  status: EarningsStatus
  available_at: string
  created_at: string
}

export interface Payout {
  id: string
  user_id: string
  amount_cents: number
  method: string
  status: "pending" | "paid" | "failed"
  requested_at: string
  paid_at: string | null
}

// ── Phase 4: Monetization 2.0 ──

export type SampleType = "loop" | "one_shot" | "stem" | "vocal" | "full_track"
export type MarketplaceLicenseType = "standard" | "exclusive" | "creative_commons"

export interface MarketplaceListing {
  id: string
  seller_id: string
  title: string
  description: string | null
  sample_type: SampleType
  genre: string | null
  bpm: number | null
  key: string | null
  duration_seconds: number | null
  preview_url: string | null
  download_url: string | null
  price_cents: number
  bulk_price_cents: number | null
  license_type: MarketplaceLicenseType
  is_ai_alternative: boolean
  tags: string[]
  download_count: number
  rating_avg: number
  rating_count: number
  is_published: boolean
  created_at: string
  updated_at: string
  // Joined
  seller?: Profile
}

export interface SampleClearance {
  id: string
  listing_id: string
  buyer_id: string
  mashup_id: string | null
  price_cents: number
  license_type: string
  cleared_at: string
  license_document_url: string | null
  // Joined
  listing?: MarketplaceListing
}

export interface SampleRating {
  id: string
  listing_id: string
  user_id: string
  rating: number
  review: string | null
  created_at: string
  user?: Profile
}

export interface MarketplacePack {
  id: string
  seller_id: string
  title: string
  description: string | null
  cover_image_url: string | null
  price_cents: number
  discount_percent: number
  created_at: string
  // Joined
  seller?: Profile
  items?: MarketplaceListing[]
  item_count?: number
}

export interface Tip {
  id: string
  tipper_id: string
  creator_id: string
  mashup_id: string | null
  amount_cents: number
  currency: string
  message: string | null
  is_public: boolean
  created_at: string
  // Joined
  tipper?: Profile
  creator?: Profile
}

export interface TipThankYou {
  id: string
  tip_id: string
  creator_id: string
  message: string
  created_at: string
}

export interface RoyaltyStream {
  id: string
  user_id: string
  mashup_id: string | null
  source: string
  platform: string | null
  amount_cents: number
  currency: string
  metadata: Record<string, unknown>
  streamed_at: string
  // Joined
  mashup?: Mashup
}

export interface RoyaltyProjection {
  id: string
  user_id: string
  month: string
  projected_cents: number
  actual_cents: number
  source_breakdown: Record<string, number>
  computed_at: string
}

export interface TaxDocument {
  id: string
  user_id: string
  tax_year: number
  document_type: string
  total_earnings_cents: number
  document_url: string | null
  generated_at: string
}

// ── Phase 2: Watermark & Export ──

export type WatermarkType = "metadata" | "spectral" | "inaudible"
export type CustodyEventType = "created" | "exported" | "detected" | "claimed" | "verified"

export interface AudioFingerprintRecord {
  id: string
  mashup_id: string
  user_id: string
  fingerprint_hash: string
  spectral_features: Record<string, unknown>
  duration_seconds: number | null
  created_at: string
}

export interface WatermarkEmbedding {
  id: string
  mashup_id: string
  fingerprint_id: string | null
  watermark_type: WatermarkType
  payload: Record<string, unknown>
  embedded_at: string
}

export interface WatermarkCustodyEvent {
  id: string
  fingerprint_id: string
  event_type: CustodyEventType
  platform: string | null
  detected_url: string | null
  detected_by: string | null
  confidence: number | null
  metadata: Record<string, unknown>
  occurred_at: string
}

export interface StoredCaptions {
  id: string
  mashup_id: string
  user_id: string
  language: string
  segments: Array<{
    id: string
    text: string
    startTime: number
    endTime: number
    confidence: number
  }>
  social_captions: Record<string, string>
  format: string
  created_at: string
  updated_at: string
}

export interface StoredThumbnail {
  id: string
  mashup_id: string
  user_id: string
  template_id: string | null
  platform: string
  width: number
  height: number
  image_url: string | null
  created_at: string
}
