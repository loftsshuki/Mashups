import "server-only"

import { isSupabaseConfigured } from "@/lib/config/runtime"
import { DEMO_GROWTH_OS, getDemoPassport } from "@/lib/growth-os/demo"
import { decideAutopilotActions } from "@/lib/growth-os/autopilot"
import type { AutopilotAction, ClubActivation, CreatorPassport, DynamicBounty, GenomeSignal, GrowthOsSnapshot, PaidMediaHandoff, PlatformConnection, PreReleaseRoom, SupplyTrack } from "@/lib/growth-os/types"
import { createAdminClient } from "@/lib/supabase/admin"

type Row = Record<string, unknown>

export async function getGrowthOsSnapshot(userId: string | null, demo = false): Promise<GrowthOsSnapshot | null> {
  if (demo) return DEMO_GROWTH_OS
  if (!userId || !isSupabaseConfigured()) return null
  const admin = createAdminClient()
  if (!admin) return null
  const { data: launch } = await admin.from("viral_launches").select("id,slug,title").eq("owner_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle()
  if (!launch) return null

  const [connectionResult, genomeResult, actionResult, bountyResult, payoutResult, escrowResult, cityResult, fanResult, paidResult, clubResult, profileResult, passportResult, supplyTracks, exchange] = await Promise.all([
    admin.from("platform_connections").select("provider,handle,status,scopes,last_synced_at").eq("user_id", userId),
    admin.from("viral_template_genomes").select("id,name,niche,qualified_activations,completion_rate,share_rate,save_rate").eq("launch_id", launch.id),
    admin.from("growth_autopilot_actions").select("id,action_type,target_id,reason,confidence,budget_delta_cents,status").eq("launch_id", launch.id).order("created_at", { ascending: false }).limit(12),
    admin.from("dynamic_bounty_offers").select("id,city,niche,base_reward_cents,multiplier,reason,status").eq("launch_id", launch.id).in("status", ["offered", "accepted"]),
    admin.from("creator_payout_accounts").select("onboarding_status").eq("user_id", userId).maybeSingle(),
    admin.from("creator_escrow_entries").select("entry_type,amount_cents,status,available_at").eq("creator_id", userId),
    admin.from("city_campaign_cells").select("id,city,code,creator_count,qualified_posts,saves,score").eq("launch_id", launch.id).order("score", { ascending: false }),
    admin.from("fan_ar_profiles").select("reputation,correct_calls,settled_calls").eq("user_id", userId).maybeSingle(),
    admin.from("paid_media_handoffs").select("id,genome_id,creator_id,organic_proof,license_status,spend_cap_cents,target_markets").eq("launch_id", launch.id).order("created_at", { ascending: false }),
    admin.from("club_activations").select("code,venue_name,city,scans,saves,ends_at,reward").eq("launch_id", launch.id).in("status", ["scheduled", "live"]).order("starts_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("profiles").select("username,display_name").eq("id", userId).maybeSingle(),
    admin.from("creator_passport_snapshots").select("*").eq("creator_id", userId).order("calculated_at", { ascending: false }).limit(1).maybeSingle(),
    getSupplyTracks(userId),
    getExchangeRooms(userId),
  ])

  const signals: GenomeSignal[] = (genomeResult.data ?? []).map((genome) => ({ genomeId: genome.id, name: genome.name, niche: genome.niche, city: "Global", qualifiedActivations: genome.qualified_activations, completionRate: Number(genome.completion_rate), shareRate: Number(genome.share_rate), saveRate: Number(genome.save_rate), costPerQualifiedActivationCents: 1500, followerMedian: 0 }))
  const persistedActions: AutopilotAction[] = (actionResult.data ?? []).map((action) => ({ id: action.id, type: action.action_type, target: action.target_id, reason: action.reason, confidence: Number(action.confidence), budgetDeltaCents: action.budget_delta_cents, status: action.status === "reversed" ? "blocked" : action.status }))
  const bounties: DynamicBounty[] = (bountyResult.data ?? []).map((bounty) => ({ id: bounty.id, title: `${bounty.city} ${bounty.niche} cell`, city: bounty.city, niche: bounty.niche, baseRewardCents: bounty.base_reward_cents, multiplier: Number(bounty.multiplier), availableSlots: bounty.status === "offered" ? 1 : 0, reason: bounty.reason }))
  const entries = escrowResult.data ?? []
  const escrowBalanceCents = entries.reduce((sum, entry) => sum + (entry.entry_type === "hold" || entry.entry_type === "release" ? entry.amount_cents : -entry.amount_cents), 0)
  const availableBalanceCents = entries.filter((entry) => entry.status === "available").reduce((sum, entry) => sum + entry.amount_cents, 0)
  const connectionsByProvider = new Map((connectionResult.data ?? []).map((connection) => [connection.provider, connection]))
  const connections: PlatformConnection[] = (["spotify", "tiktok", "instagram", "youtube"] as const).map((provider) => {
    const row = connectionsByProvider.get(provider)
    return { provider, label: provider === "youtube" ? "YouTube" : `${provider[0]?.toUpperCase()}${provider.slice(1)}`, handle: row?.handle ?? null, status: !row ? "not_connected" : row.status === "connected" || row.status === "expired" || row.status === "action_required" ? row.status : "action_required", capabilities: stringArray(row?.scopes), lastSyncedAt: row?.last_synced_at ?? null }
  })
  const cities = (cityResult.data ?? []).map((city, index, rows) => ({ id: city.id, city: city.city, code: city.code, creators: city.creator_count, qualifiedPosts: city.qualified_posts, saves: city.saves, score: Number(city.score), rank: index + 1, direction: (index === 0 ? "up" : Number(city.score) >= Number(rows[index - 1]?.score ?? 0) * 0.9 ? "flat" : "down") as "up" | "flat" | "down" }))
  const firstGenome = signals[0]
  const paidMedia: PaidMediaHandoff[] = (paidResult.data ?? []).map((handoff) => ({ id: handoff.id, genomeName: signals.find((signal) => signal.genomeId === handoff.genome_id)?.name ?? `Genome ${String(handoff.genome_id).slice(0, 8)}`, creatorHandle: `Creator ${String(handoff.creator_id).slice(0, 8)}`, organicLift: Number((handoff.organic_proof as Row | null)?.lift ?? 0), licenseStatus: handoff.license_status, spendCapCents: handoff.spend_cap_cents, targetMarkets: stringArray(handoff.target_markets) }))
  const profile = profileResult.data
  const proof = passportResult.data
  const passport: CreatorPassport = { username: profile?.username ?? "creator", displayName: profile?.display_name ?? profile?.username ?? "Creator", verifiedRightsUses: proof?.verified_rights_uses ?? 0, qualifiedCampaigns: proof?.qualified_campaigns ?? 0, liftPercentile: proof?.lift_percentile ?? 0, reliabilityScore: proof?.reliability_score ?? 0, fanArReputation: proof?.fan_ar_reputation ?? fanResult.data?.reputation ?? 500, paidMediaCleared: proof?.paid_media_cleared ?? 0, badges: stringArray(proof?.badges), recentProofs: mapProofManifest(proof?.proof_manifest) }
  const club = clubResult.data
  return {
    launchSlug: launch.slug,
    launchTitle: launch.title,
    mode: "live",
    connections,
    signals,
    autopilotActions: persistedActions.length ? persistedActions : decideAutopilotActions(signals),
    bounties,
    payout: { status: payoutResult.data?.onboarding_status === "ready" ? "ready" : payoutResult.data ? "pending" : "not_started", provider: "stripe_connect", escrowBalanceCents: Math.max(0, escrowBalanceCents), availableBalanceCents, nextPayoutAt: entries.find((entry) => entry.status === "available")?.available_at ?? null, qualifiedAwards: entries.filter((entry) => entry.entry_type === "release").length },
    supplyTracks,
    cities,
    fanAr: { reputation: fanResult.data?.reputation ?? 500, correctCalls: fanResult.data?.correct_calls ?? 0, settledCalls: fanResult.data?.settled_calls ?? 0, currentPrediction: { genomeId: firstGenome?.genomeId ?? "pending", genomeName: firstGenome?.name ?? "Awaiting signal", confidence: 50, potentialPoints: 100 } },
    paidMedia,
    club: club ? { code: club.code, venue: club.venue_name, city: club.city, scans: club.scans, saves: club.saves, activeUntil: club.ends_at, reward: club.reward } : { code: "NO-LIVE-DROP", venue: "Venue pending", city: "Global", scans: 0, saves: 0, activeUntil: new Date().toISOString(), reward: "Schedule a venue activation to open this bridge." },
    passport,
    exchange,
  }
}

export async function getCreatorPassport(username: string, demo = false): Promise<CreatorPassport | null> {
  if (demo) return getDemoPassport(username)
  if (!isSupabaseConfigured()) return null
  const admin = createAdminClient()
  if (!admin) return null
  const { data: profile } = await admin.from("profiles").select("id,username,display_name").eq("username", username).maybeSingle()
  if (!profile) return null
  const { data: proof } = await admin.from("creator_passport_snapshots").select("*").eq("creator_id", profile.id).order("calculated_at", { ascending: false }).limit(1).maybeSingle()
  if (!proof) return null
  return {
    username: profile.username,
    displayName: profile.display_name ?? profile.username,
    verifiedRightsUses: proof.verified_rights_uses,
    qualifiedCampaigns: proof.qualified_campaigns,
    liftPercentile: proof.lift_percentile,
    reliabilityScore: proof.reliability_score,
    fanArReputation: proof.fan_ar_reputation,
    paidMediaCleared: proof.paid_media_cleared,
    badges: Array.isArray(proof.badges) ? proof.badges.filter((value: unknown): value is string => typeof value === "string") : [],
    recentProofs: mapProofManifest(proof.proof_manifest),
  }
}

export async function getClubActivation(code: string, demo = false): Promise<ClubActivation | null> {
  if (demo && code.toUpperCase() === DEMO_GROWTH_OS.club.code) return DEMO_GROWTH_OS.club
  if (!isSupabaseConfigured()) return null
  const admin = createAdminClient()
  if (!admin) return null
  const { data } = await admin.from("club_activations").select("code,venue_name,city,scans,saves,ends_at,reward").eq("code", code.toUpperCase()).in("status", ["scheduled", "live"]).maybeSingle()
  if (!data) return null
  return { code: data.code, venue: data.venue_name, city: data.city, scans: data.scans, saves: data.saves, activeUntil: data.ends_at, reward: data.reward }
}

export async function getExchangeRooms(userId: string | null, demo = false): Promise<PreReleaseRoom[]> {
  if (demo) return DEMO_GROWTH_OS.exchange
  if (!userId || !isSupabaseConfigured()) return []
  const admin = createAdminClient()
  if (!admin) return []
  const { data: memberships } = await admin.from("pre_release_members").select("room_id").eq("user_id", userId).eq("access_status", "accepted")
  const roomIds = (memberships ?? []).map((item) => item.room_id)
  if (!roomIds.length) return []
  const { data } = await admin.from("pre_release_rooms").select("id,slug,name,release_at,embargo_status,seat_limit,feedback_prompts,supply_track_submissions(artist_name,track_title),pre_release_members(count)").in("id", roomIds).order("release_at")
  return (data ?? []).map((raw) => {
    const row = raw as unknown as Row
    const track = relation(row.supply_track_submissions)
    const memberCount = relation(row.pre_release_members)
    return { id: String(row.id), slug: String(row.slug), artistName: String(track.artist_name ?? "Private artist"), trackTitle: String(track.track_title ?? row.name), releaseAt: String(row.release_at), seats: Number(row.seat_limit ?? 0), seatsFilled: Number(memberCount.count ?? 0), embargoStatus: row.embargo_status as PreReleaseRoom["embargoStatus"], feedbackPrompts: stringArray(row.feedback_prompts) }
  })
}

export async function getSupplyTracks(userId: string | null, demo = false): Promise<SupplyTrack[]> {
  if (demo) return DEMO_GROWTH_OS.supplyTracks
  if (!userId || !isSupabaseConfigured()) return []
  const admin = createAdminClient()
  if (!admin) return []
  const { data: organizations } = await admin.from("rightsholder_organizations").select("id,name").eq("owner_id", userId)
  if (!organizations?.length) return []
  const names = new Map(organizations.map((org) => [org.id, org.name]))
  const { data } = await admin.from("supply_track_submissions").select("*").in("organization_id", organizations.map((org) => org.id)).order("created_at", { ascending: false })
  return (data ?? []).map((track) => ({ id: track.id, artistName: track.artist_name, trackTitle: track.track_title, organization: names.get(track.organization_id) ?? "Partner", rightsStatus: track.rights_status, territories: stringArray(track.territories), permittedUses: stringArray(track.permitted_uses), launchReadiness: track.launch_readiness, submittedAt: track.created_at }))
}

function relation(value: unknown): Row {
  if (Array.isArray(value)) return (value[0] ?? {}) as Row
  return value && typeof value === "object" ? value as Row : {}
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function mapProofManifest(value: unknown): CreatorPassport["recentProofs"] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return []
    const row = item as Row
    if (typeof row.label !== "string" || typeof row.value !== "string" || typeof row.verifiedAt !== "string") return []
    return [{ label: row.label, value: row.value, verifiedAt: row.verifiedAt }]
  })
}
