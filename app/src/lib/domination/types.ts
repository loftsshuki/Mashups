export type DominationSystemKey =
  | "guaranteed_launch"
  | "truth_graph"
  | "growth_license"
  | "exclusive_inventory"
  | "creator_liquidity"
  | "scene_beachhead"
  | "paid_flywheel"
  | "artist_contract"
  | "partner_rails"
  | "trust_network"
  | "mashups_index"
  | "ar_data"
  | "revenue_model"
  | "launch_protection"

export interface LiftMetric {
  metric: "save_rate" | "follow_rate" | "stream_rate" | "qualified_post_rate"
  treatmentVisitors: number
  treatmentConversions: number
  controlVisitors: number
  controlConversions: number
  treatmentRate: number
  controlRate: number
  absoluteLift: number
  relativeLift: number
  confidence: number
  credible: boolean
}

export interface TruthGraphNode {
  id: string
  kind: "track" | "genome" | "creator" | "post" | "city" | "save" | "stream"
  label: string
  value: string
}

export interface TruthGraphEdge {
  from: string
  to: string
  weight: number
  evidence: string
}

export interface GrowthLicense {
  code: string
  version: string
  status: "draft" | "offered" | "accepted" | "expired"
  permittedUses: string[]
  territories: string[]
  termDays: number
  paidMediaCapCents: number
  derivativePolicy: string
  takedownSlaHours: number
  acceptedAt: string | null
}

export interface GrowthLicenseDocument {
  agreementId: string
  launchTitle: string
  artistName: string
  trackTitle: string
  organizationName: string
  termsMarkdown: string
  offeredAt: string
  expiresAt: string
  license: GrowthLicense
}

export interface InventoryWindow {
  id: string
  artistName: string
  trackTitle: string
  genre: string
  exclusivityEndsAt: string
  campaignSlots: number
  launchReadiness: number
  rightsStatus: "verified" | "review"
}

export interface LiquidityCell {
  city: string
  niche: string
  qualifiedCreators: number
  openBriefs: number
  medianAcceptMinutes: number
  fillRate: number
  pressure: "balanced" | "creator_shortage" | "brief_shortage"
}

export interface SceneProgram {
  city: string
  code: string
  captains: number
  venues: number
  creators: number
  qualifiedPosts: number
  saves: number
  status: "recruiting" | "live" | "graduated"
}

export interface AmplificationCandidate {
  id: string
  creatorHandle: string
  genomeName: string
  organicLift: number
  trustScore: number
  consent: "pending" | "granted" | "declined"
  rights: "pending" | "cleared" | "blocked"
  recommendedSpendCents: number
}

export interface ArtistObligation {
  id: string
  action: string
  required: number
  completed: number
  dueAt: string
  status: "pending" | "complete" | "late"
}

export interface PartnerRail {
  id: string | null
  provider: "linkfire" | "featurefm" | "distributor" | "ad_platform"
  label: string
  status: "connected" | "action_required" | "not_connected"
  capabilities: string[]
  deliveries: number
  lastDeliveryAt: string | null
}

export interface TrustAssessment {
  score: number
  level: "verified" | "review" | "restricted"
  signals: Array<{ label: string; impact: number; status: "clear" | "warning" | "blocked" }>
  assessedAt: string
}

export interface IndexEntry {
  rank: number
  slug: string
  trackTitle: string
  artistName: string
  genre: string
  breakoutScore: number
  creatorKFactor: number
  incrementalSaveLift: number
  strongestCity: string
  strongestHookSec: number
  movement: number
}

export interface ArIntelligence {
  breakoutProbability: number
  strongestHookSec: number
  recommendedNiche: string
  recommendedCity: string
  expectedQualifiedActivationCents: number
  paidReadiness: number
  explanation: string[]
}

export interface CampaignQuote {
  tier: "pilot" | "growth" | "label_os"
  platformFeeCents: number
  creatorBudgetCents: number
  mediaBudgetCents: number
  operationsFeeCents: number
  totalCents: number
  deliverables: string[]
}

export interface LaunchProtection {
  status: "eligible" | "conditional" | "ineligible" | "protected"
  serviceCreditCents: number
  conditions: Array<{ label: string; passed: boolean; detail: string }>
  terms: string
}

export interface DominationSnapshot {
  launchSlug: string
  launchTitle: string
  mode: "demo" | "live"
  guarantee: { status: "configured" | "active" | "settled"; qualifiedPostFloor: number; creatorTestFloor: number; reportDueDays: number; completion: number }
  lift: LiftMetric
  graph: { nodes: TruthGraphNode[]; edges: TruthGraphEdge[] }
  license: GrowthLicense
  inventory: InventoryWindow[]
  liquidity: LiquidityCell[]
  scenes: SceneProgram[]
  amplification: AmplificationCandidate[]
  artistObligations: ArtistObligation[]
  partners: PartnerRail[]
  trust: TrustAssessment
  index: IndexEntry[]
  ar: ArIntelligence
  quote: CampaignQuote
  protection: LaunchProtection
}
