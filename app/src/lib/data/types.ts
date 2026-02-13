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
