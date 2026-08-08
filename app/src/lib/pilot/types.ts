export type PilotStatus = "submitted" | "qualified" | "contracting" | "ready" | "launched" | "declined"
export type OutreachStage = "research" | "qualified" | "contacted" | "replied" | "meeting" | "pilot" | "won" | "lost"
export type ProspectType = "label" | "distributor" | "artist_manager" | "venue" | "creator_agency" | "artist"

export interface PilotProgram {
  id: string
  code: string
  name: string
  genre: string
  marketCodes: string[]
  creatorTarget: number
  qualifiedPostTarget: number
  budgetFloorCents: number
  budgetCeilingCents: number
  rightsRequirements: string[]
}

export interface PilotMarket {
  code: string
  city: string
  countryCode: string
  primaryMotion: string
  creatorTarget: number
  venueTarget: number
  targetNiches: string[]
  partnerThesis: string
}

export interface PilotIntake {
  id: string
  campaignName: string
  artistName: string
  trackTitle: string
  contactName: string
  contactEmail: string
  genre: string
  subgenre: string
  releaseStage: "unreleased" | "released" | "catalog"
  releaseDate: string | null
  objectives: string[]
  targetMarkets: string[]
  targetNiches: string[]
  targetCreatorCount: number
  creatorBudgetCents: number
  paidMediaBudgetCents: number
  masterUrl: string | null
  rightsReadiness: "unverified" | "review" | "verified"
  status: PilotStatus
  notes: string | null
}

export interface PilotOperatorConfig {
  intakeId: string
  status: "draft" | "ready" | "activated"
  guaranteedLaunch: { creatorFloor: number; qualifiedPostFloor: number; genomeFloor: number; reportDueDays: number }
  growthLicense: { territories: string[]; termDays: number; paidMediaCapCents: number; takedownSlaHours: number }
  exclusivity: { type: "campaign" | "category" | "platform" | "territory"; days: number; slots: number }
  artistParticipation: { reactionCount: number; repostCount: number; liveSessionCount: number }
  partnerRails: string[]
  measurementPlan: { metric: "save_rate" | "follow_rate" | "stream_rate" | "qualified_post_rate"; controlMethod: string; minimumCohort: number }
  commercialOffer: { tier: "pilot" | "growth" | "label_os"; creatorRewardCents: number; platformFeeCents: number }
  protectionTerms: { enabled: boolean; serviceCreditCapCents: number; excludes: string[] }
}

export interface PilotChecklistItem {
  key: string
  category: "rights" | "creative" | "creator" | "measurement" | "commercial" | "partner" | "deployment"
  label: string
  required: boolean
  status: "pending" | "blocked" | "ready" | "waived"
  detail: string
}

export interface PilotWorkspace {
  mode: "demo" | "live"
  programs: PilotProgram[]
  markets: PilotMarket[]
  intake: PilotIntake | null
  operatorConfig: PilotOperatorConfig | null
  checklist: PilotChecklistItem[]
}

export interface OutreachProspect {
  id: string
  entityName: string
  entityType: ProspectType
  contactName: string | null
  contactEmail: string | null
  city: string | null
  countryCode: string | null
  genres: string[]
  catalogSignal: string | null
  priority: number
  stage: OutreachStage
  nextAction: string | null
  dueAt: string | null
  sourceUrl: string | null
  notes: string | null
}

export interface OutreachTemplate {
  code: string
  stage: string
  channel: "email" | "dm" | "call"
  subject: string | null
  body: string
}

export interface OutreachWorkspace {
  mode: "demo" | "live"
  prospects: OutreachProspect[]
  templates: OutreachTemplate[]
}

export interface ReadinessItem {
  key: string
  category: "infrastructure" | "product" | "pilot" | "partners"
  label: string
  status: "ready" | "blocked" | "attention"
  required: boolean
  detail: string
  actionHref?: string
  actionLabel?: string
}

export interface ReadinessSnapshot {
  mode: "demo" | "live"
  status: "ready" | "blocked" | "attention"
  readyCount: number
  totalRequired: number
  items: ReadinessItem[]
  checkedAt: string
}
