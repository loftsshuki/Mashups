import { assessTrust, calculateIncrementalLift, priceCampaign, qualifyLaunchProtection, scoreArIntelligence } from "@/lib/domination/engines"
import type { DominationSnapshot } from "@/lib/domination/types"

const lift = calculateIncrementalLift({ metric: "save_rate", treatmentVisitors: 5200, treatmentConversions: 624, controlVisitors: 1800, controlConversions: 92 })
const trust = assessTrust({ rightsVerified: true, audienceOverlap: 0.08, engagementAnomaly: 0.06, duplicateContentRate: 0.04, suspiciousSaveRate: 0.03, payoutDisputes: 0 })
const quote = priceCampaign({ tier: "pilot", targetCreators: 50, mediaBudgetCents: 0, creatorRewardCents: 5000 })
const protection = qualifyLaunchProtection({ platformFeeCents: quote.platformFeeCents, rightsVerified: true, trustScore: trust.score, treatmentSample: lift.treatmentVisitors, controlSample: lift.controlVisitors, artistContractAccepted: true, measurementConnected: true })
const ar = scoreArIntelligence({ lift, creatorKFactor: 1.42, trustScore: trust.score, completionRate: 0.84, strongestHookSec: 42, niche: "Nightlife", city: "Miami", costPerQualifiedActivationCents: 740 })

export const DEMO_DOMINATION: DominationSnapshot = {
  launchSlug: "midnight-velocity",
  launchTitle: "Midnight Velocity / Global Breakout",
  mode: "demo",
  guarantee: { status: "active", qualifiedPostFloor: 50, creatorTestFloor: 50, reportDueDays: 14, completion: 86 },
  lift,
  graph: {
    nodes: [
      { id: "track", kind: "track", label: "Midnight Velocity", value: "Rights verified" },
      { id: "genome", kind: "genome", label: "Drop Confession", value: "91 signal" },
      { id: "creator", kind: "creator", label: "@julesafterdark", value: "94 trust" },
      { id: "post", kind: "post", label: "Miami branch", value: "84% completion" },
      { id: "city", kind: "city", label: "Miami", value: "1.42 creator K" },
      { id: "save", kind: "save", label: "Verified saves", value: "624 treatment" },
      { id: "stream", kind: "stream", label: "Streaming lift", value: "+135% incremental" },
    ],
    edges: [
      { from: "track", to: "genome", weight: 1, evidence: "licensed source" },
      { from: "genome", to: "creator", weight: 0.91, evidence: "opportunity assignment" },
      { from: "creator", to: "post", weight: 0.94, evidence: "attributed export" },
      { from: "post", to: "city", weight: 0.84, evidence: "qualified activation" },
      { from: "city", to: "save", weight: 0.77, evidence: "signed save event" },
      { from: "save", to: "stream", weight: 0.69, evidence: "matched holdout lift" },
    ],
  },
  license: {
    code: "MGL-MV-2026-001",
    version: "1.0",
    status: "accepted",
    permittedUses: ["Organic short-form", "15-second hook cuts", "Creator whitelisting", "Paid social up to $25K", "Attributed remix forks"],
    territories: ["Worldwide"],
    termDays: 90,
    paidMediaCapCents: 2_500_000,
    derivativePolicy: "Campaign derivatives only; no standalone DSP distribution.",
    takedownSlaHours: 24,
    acceptedAt: "2026-08-01T15:00:00.000Z",
  },
  inventory: [
    { id: "inventory-midnight", artistName: "Nia Vale", trackTitle: "Midnight Velocity", genre: "Melodic house", exclusivityEndsAt: "2026-10-30T04:00:00.000Z", campaignSlots: 3, launchReadiness: 96, rightsStatus: "verified" },
    { id: "inventory-soft-static", artistName: "AERON", trackTitle: "Soft Static", genre: "Progressive house", exclusivityEndsAt: "2026-11-18T04:00:00.000Z", campaignSlots: 2, launchReadiness: 84, rightsStatus: "verified" },
    { id: "inventory-heat-index", artistName: "Miko Mesa", trackTitle: "Heat Index", genre: "Tech house", exclusivityEndsAt: "2026-09-28T04:00:00.000Z", campaignSlots: 1, launchReadiness: 72, rightsStatus: "review" },
  ],
  liquidity: [
    { city: "Miami", niche: "Nightlife", qualifiedCreators: 84, openBriefs: 6, medianAcceptMinutes: 11, fillRate: 0.94, pressure: "balanced" },
    { city: "London", niche: "Fashion", qualifiedCreators: 61, openBriefs: 14, medianAcceptMinutes: 27, fillRate: 0.78, pressure: "creator_shortage" },
    { city: "Berlin", niche: "Dance", qualifiedCreators: 103, openBriefs: 4, medianAcceptMinutes: 8, fillRate: 1, pressure: "brief_shortage" },
  ],
  scenes: [
    { city: "Miami", code: "MIA", captains: 4, venues: 7, creators: 84, qualifiedPosts: 61, saves: 2480, status: "live" },
    { city: "London", code: "LDN", captains: 3, venues: 5, creators: 61, qualifiedPosts: 48, saves: 1912, status: "live" },
    { city: "Berlin", code: "BER", captains: 4, venues: 9, creators: 103, qualifiedPosts: 71, saves: 3104, status: "live" },
    { city: "New York", code: "NYC", captains: 2, venues: 4, creators: 53, qualifiedPosts: 37, saves: 1420, status: "recruiting" },
    { city: "Los Angeles", code: "LAX", captains: 2, venues: 3, creators: 47, qualifiedPosts: 29, saves: 1108, status: "recruiting" },
  ],
  amplification: [
    { id: "amp-jules", creatorHandle: "@julesafterdark", genomeName: "Drop Confession", organicLift: 4.8, trustScore: 94, consent: "granted", rights: "cleared", recommendedSpendCents: 250000 },
    { id: "amp-mika", creatorHandle: "@mika.mov", genomeName: "One-Beat Fit Check", organicLift: 3.9, trustScore: 91, consent: "pending", rights: "cleared", recommendedSpendCents: 125000 },
  ],
  artistObligations: [
    { id: "artist-reactions", action: "Creator reactions", required: 5, completed: 3, dueAt: "2026-08-10T16:00:00.000Z", status: "pending" },
    { id: "artist-reposts", action: "Winner reposts", required: 3, completed: 2, dueAt: "2026-08-11T16:00:00.000Z", status: "pending" },
    { id: "artist-live", action: "Live squad session", required: 1, completed: 1, dueAt: "2026-08-12T16:00:00.000Z", status: "complete" },
  ],
  partners: [
    { id: "integration-demo", provider: "linkfire", label: "Linkfire routing", status: "connected", capabilities: ["Smart links", "DSP routing", "click attribution"], deliveries: 18, lastDeliveryAt: "2026-08-06T15:10:00.000Z" },
    { id: "integration-feature-demo", provider: "featurefm", label: "Feature.fm pre-save", status: "connected", capabilities: ["Pre-save", "fan capture", "retargeting"], deliveries: 9, lastDeliveryAt: "2026-08-06T13:40:00.000Z" },
    { id: "integration-distributor-demo", provider: "distributor", label: "Distributor metadata", status: "action_required", capabilities: ["ISRC sync", "release status", "territories"], deliveries: 3, lastDeliveryAt: null },
    { id: "integration-ad-demo", provider: "ad_platform", label: "Paid media export", status: "connected", capabilities: ["Audience package", "creator authorization", "conversion events"], deliveries: 6, lastDeliveryAt: "2026-08-06T14:55:00.000Z" },
  ],
  trust,
  index: [
    { rank: 1, slug: "midnight-velocity", trackTitle: "Midnight Velocity", artistName: "Nia Vale", genre: "Melodic house", breakoutScore: 94, creatorKFactor: 1.42, incrementalSaveLift: 1.35, strongestCity: "Miami", strongestHookSec: 42, movement: 3 },
    { rank: 2, slug: "soft-static", trackTitle: "Soft Static", artistName: "AERON", genre: "Progressive house", breakoutScore: 89, creatorKFactor: 1.28, incrementalSaveLift: 1.12, strongestCity: "Berlin", strongestHookSec: 36, movement: 6 },
    { rank: 3, slug: "heat-index", trackTitle: "Heat Index", artistName: "Miko Mesa", genre: "Tech house", breakoutScore: 84, creatorKFactor: 1.17, incrementalSaveLift: 0.88, strongestCity: "London", strongestHookSec: 28, movement: -1 },
    { rank: 4, slug: "mercury-line", trackTitle: "Mercury Line", artistName: "Kori V", genre: "Afro house", breakoutScore: 81, creatorKFactor: 1.09, incrementalSaveLift: 0.74, strongestCity: "New York", strongestHookSec: 51, movement: 4 },
  ],
  ar,
  quote,
  protection,
}
