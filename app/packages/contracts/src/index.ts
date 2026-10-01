export const GREEN_CONTRACT_VERSION = "2026-09-12" as const

export const GREEN_ARRANGEMENT_IDS = [
  "vocal-a-over-b",
  "vocal-b-over-a",
  "drop-swap",
] as const

export type GreenArrangementId = (typeof GREEN_ARRANGEMENT_IDS)[number]

export const GREEN_PROJECT_SCHEMA_VERSION = 1 as const
export const GREEN_PROTOTYPE_RENDERER_VERSION = "pcm-v1" as const

export type GreenProjectSources = {
  kind: "prototype"
  leftId: string
  rightId: string
  catalogVersion: string
} | {
  kind: "catalog"
  leftId: string
  rightId: string
}

export type GreenProjectInput = {
  id: string
  title: string
  sources: GreenProjectSources
  intensity: number
  selectedArrangement: GreenArrangementId | null
  expectedRevision: number
}

export type GreenSavedProject = Omit<GreenProjectInput, "expectedRevision"> & {
  revision: number
  status: "draft" | "rendering" | "ready" | "published" | "archived"
  createdAt: string
  updatedAt: string
}

export type GreenProjectErrorCode = "unauthenticated" | "unavailable" | "conflict" | "not_found" | "invalid_request" | "source_unavailable"

export function buildGreenProjectPath(id: string) {
  return `/create?project=${encodeURIComponent(id)}`
}

export type GreenPublicationSource = {
  id: string
  slug: string
  artistName: string
  trackTitle: string
}

export type GreenPublication = {
  id: string
  title: string
  parentProjectId: string | null
  publishedAt: string
  arrangement: GreenArrangementId
  durationSeconds: number
  creator: {
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
  leftSource: GreenPublicationSource
  rightSource: GreenPublicationSource
}

export function buildGreenPublicationPath(id: string) {
  return `/listen/${encodeURIComponent(id)}`
}

export const GREEN_FUNNEL_EVENTS = [
  "create_viewed",
  "source_previewed",
  "pair_selected",
  "preflight_rejected",
  "render_started",
  "render_completed",
  "candidate_played",
  "candidate_kept",
  "preview_downloaded",
  "video_export_started",
  "video_export_completed",
  "video_export_failed",
  "share_started",
  "pwa_installed",
  "audio_interrupted",
  "audio_recovered",
] as const

export type GreenFunnelEvent = (typeof GREEN_FUNNEL_EVENTS)[number]

export type GreenEventInput = {
  eventName: GreenFunnelEvent
  eventId?: string
  visitorId?: string
  sessionId: string
  projectId?: string | null
  properties: Record<string, string | number | boolean | null>
}

export type GreenEventReceipt = {
  accepted: boolean
  persisted: boolean
  reason?: "rate_limited" | "unavailable"
}

export type GreenRightsInput = {
  masterControlConfirmed: boolean
  compositionControlConfirmed: boolean
  sampleStatus: "sample_free" | "cleared_samples" | "unknown"
  stemExtractionAllowed: boolean
  crossTrackDerivativesAllowed: boolean
  inAppPlaybackAllowed: boolean
  shortVideoExportAllowed: boolean
  standaloneAudioExportAllowed: false
  paidMediaAllowed: boolean
  territories: string[]
  endsAt?: string | null
}

export type GreenAudioMetrics = {
  integratedLufs: number
  truePeakDb: number
  vocalBleedDb?: number | null
  separationSdrDb?: number | null
  phraseConfidence: number
  sampleScanStatus: "clear" | "flagged" | "unavailable"
}

export type GreenQualityGate = {
  passed: boolean
  score: number
  reasons: string[]
}

export type GreenCatalogSummary = {
  id: string
  slug: string
  artistName: string
  trackTitle: string
  genre: string
  bpm: number | null
  musicalKey: string | null
  camelotKey: string | null
  energy: number | null
  sourceType: "mashups_original" | "artist_direct" | "label"
  publicPreviewUrl: string | null
  rightsPassportId: string
}

export type GreenStaticCatalogTrack = {
  id: string
  title: string
  artist: string
  genre: string
  bpm: number
  key: string
  camelot: string
  energy: number
  passportId: string
  masterController: string
  compositionController: string
  sampleStatus: "sample-free" | "cleared-samples"
  stemExtraction: true
  crossTrackDerivatives: true
  inAppPlayback: true
  shortVideoExport: true
  standaloneAudioExport: false
  paidMedia: boolean
  territories: string[]
  pairingAllowlist: string[]
}

export type GreenStaticCatalog = {
  schemaVersion: "mashups.green-catalog.v1"
  catalogVersion: string
  issuedAt: string
  issuer: string
  rightsMode: "closed-green-room"
  outputs: Array<"in-app-playback" | "watermarked-video-15" | "watermarked-video-30">
  tracks: GreenStaticCatalogTrack[]
}

export type GreenCatalogVerification = {
  verified: boolean
  algorithm: "Ed25519"
  catalogVersion: string
  digest: string
  reason?: string
}

export type GreenPilotMetrics = {
  available: boolean
  sessions: number
  rendersStarted: number
  rendersCompleted: number
  candidatesKept: number
  sharesStarted: number
  renderCompletionRate: number
  keepRate: number
  shareRate: number
  d30Eligible: number
  d30Retained: number
  d30RetentionRate: number | null
}

export type GreenCreateLinkInput = {
  leftId: string
  rightId: string
  arrangement?: GreenArrangementId
  campaign?: string
}

export function buildGreenCreatePath(input: GreenCreateLinkInput) {
  const query = new URLSearchParams({ left: input.leftId, right: input.rightId })
  if (input.arrangement) query.set("arrangement", input.arrangement)
  if (input.campaign) query.set("campaign", input.campaign)
  return `/create?${query.toString()}`
}

export function buildGreenNativeLink(input: GreenCreateLinkInput) {
  return `mashups://create${buildGreenCreatePath(input).slice("/create".length)}`
}
