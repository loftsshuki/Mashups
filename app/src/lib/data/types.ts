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
  // V2 fields (nullable for backward compat)
  parent_id?: string | null
  timestamp_sec?: number | null
  edited_at?: string | null
  user?: Profile
  reactions?: CommentReactionGroup[]
  replies?: Comment[]
  reply_count?: number
  mentions?: CommentMention[]
}

export interface CommentReactionGroup {
  emoji: string
  count: number
  user_reacted: boolean
}

export interface CommentMention {
  id: string
  comment_id: string
  mentioned_user_id: string
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

// ---------------------------------------------------------------------------
// Collaborative Playlists
// ---------------------------------------------------------------------------

export interface Playlist {
  id: string
  title: string
  description: string | null
  cover_image_url: string | null
  creator_id: string
  is_collaborative: boolean
  is_public: boolean
  track_count: number
  created_at: string
  updated_at: string
  creator?: Profile
  tracks?: PlaylistTrack[]
}

export interface PlaylistTrack {
  id: string
  playlist_id: string
  mashup_id: string
  added_by: string
  position: number
  added_at: string
  mashup?: Mashup
  added_by_user?: Profile
}

export interface PlaylistComment {
  id: string
  playlist_id: string
  user_id: string
  content: string
  created_at: string
  user?: Profile
}

// ---------------------------------------------------------------------------
// Follow Feed
// ---------------------------------------------------------------------------

export interface FeedPreferences {
  user_id: string
  preferred_genres: string[]
  preferred_bpm_min: number | null
  preferred_bpm_max: number | null
  updated_at: string
}

// ---------------------------------------------------------------------------
// Stems Registry (first-class stem entities)
// ---------------------------------------------------------------------------

export type StemSource = "upload" | "ai_generated" | "separated" | "recorded"

export interface Stem {
  id: string
  creator_id: string
  title: string
  instrument: string | null // vocal, drums, bass, synth, texture, other
  genre: string | null
  bpm: number | null
  key: string | null // e.g. "Cm", "F#"
  duration_ms: number | null
  audio_url: string
  waveform_data: unknown | null
  tags: string[]
  source: StemSource
  play_count: number
  usage_count: number
  created_at: string
  // Joined fields
  creator?: Profile
}

export interface StemMashupLink {
  mashup_id: string
  stem_id: string
  track_number: number | null
}

// ---------------------------------------------------------------------------
// Crates — shared stem collections
// ---------------------------------------------------------------------------

export interface Crate {
  id: string
  creator_id: string
  title: string
  description: string | null
  is_public: boolean
  follower_count: number
  created_at: string
  // Joined fields
  creator?: Profile
  stems?: CrateStem[]
}

export interface CrateStem {
  crate_id: string
  stem_id: string
  added_by: string
  added_at: string
  // Joined fields
  stem?: Stem
  added_by_user?: Profile
}

// ---------------------------------------------------------------------------
// Creative Streaks
// ---------------------------------------------------------------------------

export interface CreativeStreak {
  user_id: string
  current_weekly_streak: number
  longest_weekly_streak: number
  last_creation_week: string | null // ISO week like '2026-W07'
  streak_history: StreakWeek[]
}

export interface StreakWeek {
  week: string // ISO week
  mashup_count: number
  mashup_ids: string[]
}

// ---------------------------------------------------------------------------
// Platform Challenges v2
// ---------------------------------------------------------------------------

export type ChallengeType = "flip" | "chain" | "collision" | "blind_test" | "roulette"
export type ChallengeStatus = "upcoming" | "active" | "voting" | "completed"

export interface PlatformChallenge {
  id: string
  type: ChallengeType
  title: string
  description: string | null
  stem_ids: string[]
  genre_pair: string[] | null
  rules: Record<string, unknown> | null
  starts_at: string | null
  ends_at: string | null
  max_entries: number | null
  prize_description: string | null
  status: ChallengeStatus
  created_at: string
}

// ---------------------------------------------------------------------------
// Seasons
// ---------------------------------------------------------------------------

export type SeasonStatus = "upcoming" | "active" | "completed"

export interface Season {
  id: string
  name: string
  theme: string | null
  description: string | null
  stem_pack_ids: string[]
  collective_goal: number | null
  current_count: number
  starts_at: string | null
  ends_at: string | null
  status: SeasonStatus
}

// ---------------------------------------------------------------------------
// Stem Usage / Provenance
// ---------------------------------------------------------------------------

export interface StemUsageLog {
  id: string
  stem_id: string
  mashup_id: string
  total_plays_contributed: number
  created_at: string
}
