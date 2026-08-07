import type { ViralPlatform } from "@/lib/viral/types"

export type PlatformProvider = ViralPlatform | "spotify"
export type ConnectionStatus = "connected" | "expired" | "action_required" | "not_connected"

export interface PlatformConnection {
  provider: PlatformProvider
  label: string
  handle: string | null
  status: ConnectionStatus
  capabilities: string[]
  lastSyncedAt: string | null
}

export type AutopilotActionType =
  | "promote_genome"
  | "retire_genome"
  | "hold_for_signal"
  | "expand_city"
  | "raise_bounty"
  | "handoff_paid_media"

export interface GenomeSignal {
  genomeId: string
  name: string
  niche: string
  city: string
  qualifiedActivations: number
  completionRate: number
  shareRate: number
  saveRate: number
  costPerQualifiedActivationCents: number
  followerMedian: number
}

export interface AutopilotAction {
  id: string
  type: AutopilotActionType
  target: string
  reason: string
  confidence: number
  budgetDeltaCents: number
  status: "proposed" | "executed" | "blocked"
}

export interface DynamicBounty {
  id: string
  title: string
  city: string
  niche: string
  baseRewardCents: number
  multiplier: number
  availableSlots: number
  reason: string
}

export interface PayoutRail {
  status: "ready" | "pending" | "not_started"
  provider: "stripe_connect"
  escrowBalanceCents: number
  availableBalanceCents: number
  nextPayoutAt: string | null
  qualifiedAwards: number
}

export interface SupplyTrack {
  id: string
  artistName: string
  trackTitle: string
  organization: string
  rightsStatus: "verified" | "review" | "missing_party"
  territories: string[]
  permittedUses: string[]
  launchReadiness: number
  submittedAt: string
}

export interface CityCell {
  id: string
  city: string
  code: string
  creators: number
  qualifiedPosts: number
  saves: number
  score: number
  rank: number
  direction: "up" | "flat" | "down"
}

export interface FanArMarket {
  reputation: number
  correctCalls: number
  settledCalls: number
  currentPrediction: {
    genomeId: string
    genomeName: string
    confidence: number
    potentialPoints: number
  }
}

export interface PaidMediaHandoff {
  id: string
  genomeName: string
  creatorHandle: string
  organicLift: number
  licenseStatus: "cleared" | "pending" | "blocked"
  spendCapCents: number
  targetMarkets: string[]
}

export interface ClubActivation {
  code: string
  venue: string
  city: string
  scans: number
  saves: number
  activeUntil: string
  reward: string
}

export interface CreatorPassport {
  username: string
  displayName: string
  verifiedRightsUses: number
  qualifiedCampaigns: number
  liftPercentile: number
  reliabilityScore: number
  fanArReputation: number
  paidMediaCleared: number
  badges: string[]
  recentProofs: Array<{ label: string; value: string; verifiedAt: string }>
}

export interface PreReleaseRoom {
  id: string
  slug: string
  artistName: string
  trackTitle: string
  releaseAt: string
  seats: number
  seatsFilled: number
  embargoStatus: "sealed" | "open" | "released"
  feedbackPrompts: string[]
}

export interface GrowthOsSnapshot {
  launchSlug: string
  launchTitle: string
  mode: "demo" | "live"
  connections: PlatformConnection[]
  signals: GenomeSignal[]
  autopilotActions: AutopilotAction[]
  bounties: DynamicBounty[]
  payout: PayoutRail
  supplyTracks: SupplyTrack[]
  cities: CityCell[]
  fanAr: FanArMarket
  paidMedia: PaidMediaHandoff[]
  club: ClubActivation
  passport: CreatorPassport
  exchange: PreReleaseRoom[]
}
