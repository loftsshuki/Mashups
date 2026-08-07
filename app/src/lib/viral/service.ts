import "server-only"

import { randomUUID } from "node:crypto"

import { DEMO_VIRAL_LAUNCHES, getDemoViralLaunch } from "@/lib/viral/demo"
import type {
  ArtistCommitment,
  CampaignRaid,
  CommunityUnlock,
  CreateViralLaunchInput,
  CreatorSquad,
  SaveDestination,
  TemplateGenome,
  ViralLaunch,
  ViralPlatform,
} from "@/lib/viral/types"
import { isSupabaseConfigured } from "@/lib/config/runtime"
import { createAdminClient } from "@/lib/supabase/admin"

type DatabaseRow = Record<string, unknown>

const launchSelect = `
  *,
  viral_template_genomes(*),
  viral_squads(*),
  viral_raids(*),
  viral_unlocks(*),
  viral_artist_commitments(*)
`

function text(row: DatabaseRow, key: string, fallback = ""): string {
  return typeof row[key] === "string" ? row[key] : fallback
}

function integer(row: DatabaseRow, key: string): number {
  const value = Number(row[key] ?? 0)
  return Number.isFinite(value) ? value : 0
}

function rows(row: DatabaseRow, key: string): DatabaseRow[] {
  return Array.isArray(row[key]) ? (row[key] as DatabaseRow[]) : []
}

function mapGenome(row: DatabaseRow): TemplateGenome {
  return {
    id: text(row, "id"),
    name: text(row, "name"),
    parentId: text(row, "parent_id") || null,
    platform: text(row, "platform", "tiktok") as ViralPlatform,
    niche: text(row, "niche", "Open"),
    hookStartSec: integer(row, "hook_start_sec"),
    hookDurationSec: integer(row, "hook_duration_sec"),
    openingFrame: text(row, "opening_frame"),
    pattern: text(row, "pattern"),
    textBeats: Array.isArray(row.text_beats) ? row.text_beats.filter((beat): beat is string => typeof beat === "string") : [],
    shotCount: integer(row, "shot_count"),
    forkCount: integer(row, "fork_count"),
    qualifiedActivations: integer(row, "qualified_activations"),
    completionRate: Number(row.completion_rate ?? 0),
    shareRate: Number(row.share_rate ?? 0),
    saveRate: Number(row.save_rate ?? 0),
    viralScore: Number(row.viral_score ?? 0),
  }
}

function mapSquad(row: DatabaseRow, index: number): CreatorSquad {
  return {
    id: text(row, "id"),
    name: text(row, "name"),
    identity: text(row, "identity"),
    captain: text(row, "captain_handle", "Captain pending"),
    memberCount: integer(row, "member_count"),
    qualifiedPosts: integer(row, "qualified_posts"),
    score: Number(row.score ?? 0),
    rank: index + 1,
  }
}

function mapRaid(row: DatabaseRow): CampaignRaid {
  return {
    id: text(row, "id"),
    name: text(row, "name"),
    phase: text(row, "phase", "test") as CampaignRaid["phase"],
    startsAt: text(row, "starts_at"),
    targetCreators: integer(row, "target_creators"),
    activatedCreators: integer(row, "activated_creators"),
    status: text(row, "status", "queued") as CampaignRaid["status"],
  }
}

function mapUnlock(row: DatabaseRow): CommunityUnlock {
  const target = integer(row, "target")
  const current = integer(row, "current_value")
  return {
    id: text(row, "id"),
    title: text(row, "title"),
    action: text(row, "action", "forks") as CommunityUnlock["action"],
    target,
    current,
    reward: text(row, "reward"),
    unlocked: Boolean(row.unlocked_at) || current >= target,
  }
}

function mapCommitment(row: DatabaseRow): ArtistCommitment {
  return {
    id: text(row, "id"),
    label: text(row, "label"),
    target: integer(row, "target"),
    completed: integer(row, "completed"),
  }
}

function mapLaunch(row: DatabaseRow): ViralLaunch {
  const squads = rows(row, "viral_squads")
    .sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0))
    .map(mapSquad)
  const destinations = Array.isArray(row.save_destinations)
    ? (row.save_destinations as SaveDestination[])
    : []
  return {
    id: text(row, "id"),
    slug: text(row, "slug"),
    title: text(row, "title"),
    artistName: text(row, "artist_name"),
    trackTitle: text(row, "track_title"),
    trackAudioUrl: text(row, "track_audio_url") || null,
    objective: text(row, "objective"),
    phase: text(row, "phase", "draft") as ViralLaunch["phase"],
    startsAt: text(row, "starts_at"),
    endsAt: text(row, "ends_at"),
    releaseAt: text(row, "release_at") || null,
    isPreRelease: Boolean(row.is_pre_release),
    bountyCents: integer(row, "bounty_cents"),
    creatorsActivated: integer(row, "creators_activated"),
    qualifiedPosts: integer(row, "qualified_posts"),
    totalForks: integer(row, "total_forks"),
    totalSaves: integer(row, "total_saves"),
    totalShares: integer(row, "total_shares"),
    creatorKFactor: Number(row.creator_k_factor ?? 0),
    saveDestinations: destinations,
    genomes: rows(row, "viral_template_genomes").sort((a, b) => Number(b.viral_score ?? 0) - Number(a.viral_score ?? 0)).map(mapGenome),
    squads,
    raids: rows(row, "viral_raids").sort((a, b) => text(a, "starts_at").localeCompare(text(b, "starts_at"))).map(mapRaid),
    unlocks: rows(row, "viral_unlocks").map(mapUnlock),
    artistCommitments: rows(row, "viral_artist_commitments").map(mapCommitment),
  }
}

export async function getViralLaunches(input: { userId?: string | null; demo?: boolean }): Promise<ViralLaunch[]> {
  if (input.demo) return DEMO_VIRAL_LAUNCHES
  if (!isSupabaseConfigured()) return []

  const admin = createAdminClient()
  if (!admin) return []
  let query = admin.from("viral_launches").select(launchSelect).order("created_at", { ascending: false }).limit(20)
  query = input.userId ? query.eq("owner_id", input.userId) : query.eq("is_public", true)
  const { data, error } = await query
  if (error) {
    console.error("[ViralLaunches] Unable to load launches:", error.message)
    return []
  }
  return ((data ?? []) as DatabaseRow[]).map(mapLaunch)
}

export async function getViralLaunchBySlug(slug: string, demo = false): Promise<ViralLaunch | null> {
  if (demo) return getDemoViralLaunch(slug)
  if (!isSupabaseConfigured()) return null
  const admin = createAdminClient()
  if (!admin) return null
  const { data, error } = await admin.from("viral_launches").select(launchSelect).eq("slug", slug).eq("is_public", true).maybeSingle()
  if (error || !data) return null
  return mapLaunch(data as DatabaseRow)
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "viral-launch"
}

export async function createViralLaunch(input: CreateViralLaunchInput, ownerId: string): Promise<{ id: string; slug: string }> {
  const admin = createAdminClient()
  if (!admin) throw new Error("Viral launch storage is not configured.")

  const startsAt = new Date(input.startsAt)
  const endsAt = new Date(startsAt.getTime() + 72 * 60 * 60 * 1000)
  const slug = `${slugify(input.title)}-${randomUUID().slice(0, 6)}`
  const { data: launch, error: launchError } = await admin
    .from("viral_launches")
    .insert({
      owner_id: ownerId,
      slug,
      title: input.title,
      artist_name: input.artistName,
      track_title: input.trackTitle,
      objective: input.objective,
      phase: "testing",
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      release_at: input.releaseAt || null,
      is_pre_release: Boolean(input.releaseAt),
      is_public: true,
      bounty_cents: input.bountyCents,
      save_destinations: input.saveDestinations,
      settings: { qualification: { minimumEngagedViews: 100, maximumFraudScore: 0.65 } },
    })
    .select("id,slug")
    .single()

  if (launchError || !launch) throw new Error(launchError?.message ?? "Unable to create launch.")
  const launchId = String(launch.id)
  const niches = input.niches.length ? input.niches.slice(0, 3) : ["Open"]
  const genomes = niches.map((niche, index) => ({
    launch_id: launchId,
    name: ["Stop-Scroll Confession", "One-Beat Reveal", "Pass-The-Drop Chain"][index] ?? `${niche} Breakout`,
    platform: (["tiktok", "instagram", "youtube"] as const)[index] ?? "tiktok",
    niche,
    hook_start_sec: [42, 18, 31][index] ?? 18,
    hook_duration_sec: 15,
    opening_frame: ["Open on the consequence.", "Hold the before frame for one beat.", "Begin with one creator and pass the frame."][index] ?? "Open on motion.",
    pattern: ["Confession -> tension -> reveal", "Before -> beat hit -> acceleration", "Solo -> handoff -> full squad"][index] ?? "Hook -> reveal",
    text_beats: [["The confession", "Wait for it", "The consequence"], ["Before", "After"], ["Pass it", "Keep the chain alive"]][index] ?? ["Make your version"],
    shot_count: [4, 5, 6][index] ?? 4,
    status: "testing",
  }))

  const { data: createdGenomes, error: genomeError } = await admin
    .from("viral_template_genomes")
    .insert(genomes)
    .select("id,name,platform")
  if (genomeError || !createdGenomes) {
    await admin.from("viral_launches").delete().eq("id", launchId)
    throw new Error(genomeError?.message ?? "Unable to create template genomes.")
  }

  const platformPackages = createdGenomes.flatMap((genome) =>
    (["tiktok", "instagram", "youtube"] as const).map((platform) => ({
      launch_id: launchId,
      genome_id: genome.id,
      platform,
      duration_sec: platform === "youtube" ? 18 : 15,
      caption: `${input.trackTitle} / ${genome.name}. Make your version and keep the branch alive.`,
      first_comment: platform === "instagram" ? "Send this to the friend who should take the next branch." : "Who should take the next branch?",
      posting_window_start: startsAt.toISOString(),
      asset_manifest: { cleanMaster: true, watermark: false, attributionRequired: true },
    })),
  )

  const writes = await Promise.all([
    admin.from("viral_platform_packages").insert(platformPackages),
    admin.from("viral_raids").insert([
      { launch_id: launchId, name: "Signal Test", phase: "test", starts_at: startsAt.toISOString(), target_creators: input.testCreators, status: "queued" },
      { launch_id: launchId, name: "Niche Scale", phase: "scale", starts_at: new Date(startsAt.getTime() + 24 * 60 * 60 * 1000).toISOString(), target_creators: input.scaleCreators, status: "queued" },
      { launch_id: launchId, name: "Breakout Blast", phase: "blast", starts_at: new Date(startsAt.getTime() + 48 * 60 * 60 * 1000).toISOString(), target_creators: Math.max(input.scaleCreators * 5, 100), status: "queued" },
    ]),
    admin.from("viral_squads").insert(niches.map((niche) => ({ launch_id: launchId, name: `${niche} Unit`, identity: `${niche} creators`, max_members: 20 }))),
    admin.from("viral_bounties").insert({ launch_id: launchId, title: "Qualified breakout pool", metric: "lift", pool_cents: Math.max(input.bountyCents, 100), status: "open", rules: { rewardsIncrementalLift: true, rawViewsExcluded: true } }),
    admin.from("viral_unlocks").insert([
      { launch_id: launchId, title: "Official stems", action: "forks", target: 500, reward: "Release the approved instrumental and vocal stems." },
      { launch_id: launchId, title: "Double the pool", action: "saves", target: 5000, reward: "Double the final squad bounty." },
      { launch_id: launchId, title: "Artist enters the room", action: "posts", target: 100, reward: "The artist reacts live to the strongest branches." },
    ]),
    admin.from("viral_artist_commitments").insert([
      { launch_id: launchId, commitment_type: "reaction", label: "Creator reactions", target: input.artistReactionCount },
      { launch_id: launchId, commitment_type: "repost", label: "Winner reposts", target: 3 },
      { launch_id: launchId, commitment_type: "live_session", label: "Live squad session", target: 1 },
    ]),
    admin.from("viral_royalty_rules").insert([
      { launch_id: launchId, beneficiary_type: "rightsholder", share_bps: 5000, depth_limit: 0 },
      { launch_id: launchId, beneficiary_type: "template_creator", share_bps: 1000, depth_limit: 3 },
      { launch_id: launchId, beneficiary_type: "creator", share_bps: 2500, depth_limit: 0 },
      { launch_id: launchId, beneficiary_type: "platform", share_bps: 1500, depth_limit: 0 },
    ]),
  ])

  const failed = writes.find((result) => result.error)
  if (failed?.error) {
    await admin.from("viral_launches").delete().eq("id", launchId)
    throw new Error(failed.error.message)
  }
  return { id: launchId, slug: String(launch.slug) }
}
