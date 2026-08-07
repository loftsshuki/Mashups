import { decideAutopilotActions } from "@/lib/growth-os/autopilot"
import type { GrowthOsSnapshot } from "@/lib/growth-os/types"

const signals = [
  { genomeId: "genome-drop-confession", name: "Drop Confession", niche: "Nightlife", city: "Miami", qualifiedActivations: 72, completionRate: 0.84, shareRate: 0.128, saveRate: 0.074, costPerQualifiedActivationCents: 740, followerMedian: 3200 },
  { genomeId: "genome-fit-check", name: "One-Beat Fit Check", niche: "Fashion", city: "London", qualifiedActivations: 49, completionRate: 0.79, shareRate: 0.142, saveRate: 0.061, costPerQualifiedActivationCents: 910, followerMedian: 7800 },
  { genomeId: "genome-squad-switch", name: "Squad Switch", niche: "Dance", city: "Baltimore", qualifiedActivations: 22, completionRate: 0.88, shareRate: 0.096, saveRate: 0.082, costPerQualifiedActivationCents: 1120, followerMedian: 1900 },
]

export const DEMO_GROWTH_OS: GrowthOsSnapshot = {
  launchSlug: "midnight-velocity",
  launchTitle: "Midnight Velocity / Global Breakout",
  mode: "demo",
  connections: [
    { provider: "spotify", label: "Spotify", handle: "Nia Vale", status: "connected", capabilities: ["one-tap save", "release identity"], lastSyncedAt: "2026-08-06T14:20:00.000Z" },
    { provider: "tiktok", label: "TikTok", handle: "@niavale", status: "connected", capabilities: ["draft export", "performance sync"], lastSyncedAt: "2026-08-06T14:18:00.000Z" },
    { provider: "instagram", label: "Instagram", handle: "@nia.afterdark", status: "action_required", capabilities: ["Reels package", "performance sync"], lastSyncedAt: null },
    { provider: "youtube", label: "YouTube", handle: "Nia Vale", status: "connected", capabilities: ["Shorts upload", "analytics sync"], lastSyncedAt: "2026-08-06T14:16:00.000Z" },
  ],
  signals,
  autopilotActions: decideAutopilotActions(signals).slice(0, 7),
  bounties: [
    { id: "bounty-baltimore", title: "Baltimore first-wave", city: "Baltimore", niche: "Dance", baseRewardCents: 4000, multiplier: 2.35, availableSlots: 8, reason: "Strong completion, low creator supply, zero-follower discovery boost." },
    { id: "bounty-manchester", title: "Manchester afterhours", city: "Manchester", niche: "Nightlife", baseRewardCents: 5000, multiplier: 1.8, availableSlots: 12, reason: "City priority increased after save intent outpaced qualified posts." },
    { id: "bounty-seoul", title: "Seoul handoff chain", city: "Seoul", niche: "Fashion", baseRewardCents: 4500, multiplier: 1.55, availableSlots: 16, reason: "Genome-localization test needs its first credible sample." },
  ],
  payout: { status: "ready", provider: "stripe_connect", escrowBalanceCents: 184500, availableBalanceCents: 62500, nextPayoutAt: "2026-08-09T16:00:00.000Z", qualifiedAwards: 14 },
  supplyTracks: [
    { id: "track-midnight", artistName: "Nia Vale", trackTitle: "Midnight Velocity", organization: "Vale Works", rightsStatus: "verified", territories: ["Worldwide"], permittedUses: ["organic short-form", "creator whitelisting", "paid social <= $25k"], launchReadiness: 96, submittedAt: "2026-08-01T12:00:00.000Z" },
    { id: "track-soft-static", artistName: "AERON", trackTitle: "Soft Static", organization: "North Relay", rightsStatus: "review", territories: ["US", "CA", "GB"], permittedUses: ["organic short-form"], launchReadiness: 72, submittedAt: "2026-08-05T09:30:00.000Z" },
  ],
  cities: [
    { id: "city-miami", city: "Miami", code: "MIA", creators: 38, qualifiedPosts: 31, saves: 1240, score: 946, rank: 1, direction: "up" },
    { id: "city-london", city: "London", code: "LDN", creators: 31, qualifiedPosts: 24, saves: 1112, score: 881, rank: 2, direction: "flat" },
    { id: "city-baltimore", city: "Baltimore", code: "BWI", creators: 17, qualifiedPosts: 19, saves: 894, score: 834, rank: 3, direction: "up" },
    { id: "city-seoul", city: "Seoul", code: "SEL", creators: 21, qualifiedPosts: 14, saves: 721, score: 702, rank: 4, direction: "up" },
  ],
  fanAr: { reputation: 824, correctCalls: 17, settledCalls: 23, currentPrediction: { genomeId: "genome-drop-confession", genomeName: "Drop Confession", confidence: 82, potentialPoints: 164 } },
  paidMedia: [
    { id: "media-1", genomeName: "Drop Confession", creatorHandle: "@julesafterdark", organicLift: 4.8, licenseStatus: "cleared", spendCapCents: 2500000, targetMarkets: ["US", "GB", "CA"] },
    { id: "media-2", genomeName: "One-Beat Fit Check", creatorHandle: "@mika.mov", organicLift: 3.9, licenseStatus: "pending", spendCapCents: 1000000, targetMarkets: ["GB", "DE"] },
  ],
  club: { code: "AFTERDARK", venue: "The Ground", city: "Miami", scans: 482, saves: 219, activeUntil: "2026-08-09T07:00:00.000Z", reward: "Save the track and unlock the official afterhours edit." },
  passport: {
    username: "julesafterdark", displayName: "Jules Navarro", verifiedRightsUses: 42, qualifiedCampaigns: 18, liftPercentile: 96, reliabilityScore: 94, fanArReputation: 824, paidMediaCleared: 7,
    badges: ["Rights clean", "Breakout caller", "City captain", "Paid-use ready"],
    recentProofs: [
      { label: "Incremental saves", value: "+1,240", verifiedAt: "2026-08-05T18:00:00.000Z" },
      { label: "Best completion", value: "84%", verifiedAt: "2026-08-03T18:00:00.000Z" },
      { label: "Qualified activation", value: "Midnight Velocity", verifiedAt: "2026-08-02T18:00:00.000Z" },
    ],
  },
  exchange: [
    { id: "room-soft-static", slug: "soft-static-first-listen", artistName: "AERON", trackTitle: "Soft Static", releaseAt: "2026-08-21T04:00:00.000Z", seats: 40, seatsFilled: 31, embargoStatus: "sealed", feedbackPrompts: ["Where did you stop scrolling?", "Which creator niche owns this first?", "Would you stake your reputation on the hook?"] },
    { id: "room-heat-index", slug: "heat-index-47", artistName: "Miko Mesa", trackTitle: "Heat Index", releaseAt: "2026-08-28T04:00:00.000Z", seats: 24, seatsFilled: 24, embargoStatus: "sealed", feedbackPrompts: ["Call the strongest 15 seconds.", "Name the city that should break it."] },
  ],
}

export function getDemoPassport(username: string) {
  return username.toLowerCase() === DEMO_GROWTH_OS.passport.username ? DEMO_GROWTH_OS.passport : null
}

export function getDemoExchangeRoom(slug: string) {
  return DEMO_GROWTH_OS.exchange.find((room) => room.slug === slug) ?? null
}
