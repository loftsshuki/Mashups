export const GREEN_FUNNEL_EVENTS = [
  "create_viewed",
  "source_previewed",
  "pair_selected",
  "render_started",
  "render_completed",
  "candidate_played",
  "candidate_kept",
  "preview_downloaded",
  "share_started",
] as const

export type GreenFunnelEvent = (typeof GREEN_FUNNEL_EVENTS)[number]

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

export type GreenPilotMetrics = {
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
  d30RetentionRate: number
}
