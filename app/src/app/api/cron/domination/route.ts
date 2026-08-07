import { NextResponse } from "next/server"

import { scoreMashupsIndex } from "@/lib/domination/engines"
import type { LiftMetric } from "@/lib/domination/types"
import { createAdminClient } from "@/lib/supabase/admin"

type Row = Record<string, unknown>

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Domination storage is not configured." }, { status: 503 })

  const now = new Date()
  const periodStart = startOfUtcWeek(now)
  const periodEnd = new Date(periodStart)
  periodEnd.setUTCDate(periodEnd.getUTCDate() + 6)
  const editionSlug = `week-${periodStart.toISOString().slice(0, 10)}`

  const { data: launches, error: launchesError } = await admin.from("viral_launches").select("id,slug,qualified_posts,total_saves,creator_k_factor").eq("is_public", true).in("phase", ["live", "completed"]).limit(250)
  if (launchesError) return NextResponse.json({ error: "Unable to load index candidates." }, { status: 500 })
  const launchIds = (launches ?? []).map((launch) => launch.id)

  const [liftResult, trustResult, genomeResult, cityResult, rightsResult, previousEditionResult, liquidityResult] = await Promise.all([
    launchIds.length ? admin.from("campaign_lift_snapshots").select("*").in("launch_id", launchIds).order("calculated_at", { ascending: false }).limit(2000) : Promise.resolve({ data: [], error: null }),
    launchIds.length ? admin.from("trust_assessments").select("launch_id,score,assessed_at").in("launch_id", launchIds).order("assessed_at", { ascending: false }).limit(2000) : Promise.resolve({ data: [], error: null }),
    launchIds.length ? admin.from("viral_template_genomes").select("launch_id,hook_start_sec,viral_score").in("launch_id", launchIds).order("viral_score", { ascending: false }).limit(2000) : Promise.resolve({ data: [], error: null }),
    launchIds.length ? admin.from("city_campaign_cells").select("launch_id,city,score").in("launch_id", launchIds).order("score", { ascending: false }).limit(2000) : Promise.resolve({ data: [], error: null }),
    launchIds.length ? admin.from("growth_license_agreements").select("launch_id").in("launch_id", launchIds).eq("status", "accepted") : Promise.resolve({ data: [], error: null }),
    admin.from("mashups_index_editions").select("id").eq("status", "published").neq("slug", editionSlug).order("published_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("dynamic_bounty_offers").select("city,niche,creator_id,status,created_at").gte("created_at", new Date(now.getTime() - 30 * 86_400_000).toISOString()).limit(5000),
  ])

  const lifts = latestBy(liftResult.data ?? [], "launch_id")
  const trusts = latestBy(trustResult.data ?? [], "launch_id")
  const genomes = latestBy(genomeResult.data ?? [], "launch_id")
  const cities = latestBy(cityResult.data ?? [], "launch_id")
  const acceptedRights = new Set((rightsResult.data ?? []).map((row) => row.launch_id))
  const previousRanks = new Map<string, number>()
  if (previousEditionResult.data?.id) {
    const { data: previousEntries } = await admin.from("mashups_index_entries").select("launch_id,rank").eq("edition_id", previousEditionResult.data.id)
    for (const row of previousEntries ?? []) previousRanks.set(row.launch_id, row.rank)
  }

  const ranked = (launches ?? []).flatMap((launch) => {
    const liftRow = lifts.get(launch.id)
    if (!liftRow) return []
    const lift = mapLift(liftRow)
    const trustScore = numeric(trusts.get(launch.id)?.score)
    const score = scoreMashupsIndex({ lift, creatorKFactor: numeric(launch.creator_k_factor), trustScore, qualifiedPosts: numeric(launch.qualified_posts), verifiedSaves: numeric(launch.total_saves), rightsAccepted: acceptedRights.has(launch.id) })
    if (!score.qualified) return []
    return [{ launch, lift, trustScore, score, genome: genomes.get(launch.id), city: cities.get(launch.id) }]
  }).sort((a, b) => b.score.score - a.score.score).slice(0, 100)

  const { data: edition, error: editionError } = await admin.from("mashups_index_editions").upsert({ slug: editionSlug, title: `Mashups Index / ${periodStart.toISOString().slice(0, 10)}`, period_start: periodStart.toISOString().slice(0, 10), period_end: periodEnd.toISOString().slice(0, 10), methodology_version: "mashups-index-v1", status: "draft", published_at: null }, { onConflict: "slug" }).select("id").single()
  if (editionError || !edition) return NextResponse.json({ error: "Unable to create index edition." }, { status: 500 })
  const { error: clearError } = await admin.from("mashups_index_entries").delete().eq("edition_id", edition.id)
  if (clearError) return NextResponse.json({ error: "Unable to refresh index edition." }, { status: 500 })
  if (ranked.length) {
    const { error: entriesError } = await admin.from("mashups_index_entries").insert(ranked.map((candidate, index) => {
      const rank = index + 1
      const previousRank = previousRanks.get(candidate.launch.id)
      return { edition_id: edition.id, launch_id: candidate.launch.id, rank, breakout_score: candidate.score.score, movement: previousRank ? previousRank - rank : 0, strongest_city: string(candidate.city?.city, "Global"), strongest_hook_sec: Math.round(numeric(candidate.genome?.hook_start_sec)), incremental_save_lift: candidate.lift.relativeLift, creator_k_factor: numeric(candidate.launch.creator_k_factor), evidence_manifest: { methodology: "mashups-index-v1", liftCredible: candidate.lift.credible, confidence: candidate.lift.confidence, trustScore: candidate.trustScore, rightsAccepted: true, components: candidate.score.components, calculatedAt: now.toISOString() } }
    }))
    if (entriesError) return NextResponse.json({ error: "Unable to publish index entries." }, { status: 500 })
  }
  const { error: publishError } = await admin.from("mashups_index_editions").update({ status: "published", published_at: now.toISOString() }).eq("id", edition.id)
  if (publishError) return NextResponse.json({ error: "Unable to publish index edition." }, { status: 500 })

  const liquidityCells = aggregateLiquidity((liquidityResult.data ?? []) as Row[])
  if (liquidityCells.length) await admin.from("creator_liquidity_snapshots").insert(liquidityCells)
  await Promise.all([
    admin.from("inventory_exclusivity_windows").update({ status: "expired" }).eq("status", "active").lt("ends_at", now.toISOString()),
    admin.from("growth_license_agreements").update({ status: "expired" }).eq("status", "offered").lt("expires_at", now.toISOString()),
    admin.from("launch_protection_policies").update({ status: "expired", updated_at: now.toISOString() }).in("status", ["eligible", "conditional", "protected"]).lt("expires_at", now.toISOString()),
  ])

  return NextResponse.json({ ok: true, edition: editionSlug, candidates: launchIds.length, published: ranked.length, liquidityCells: liquidityCells.length })
}

function startOfUtcWeek(value: Date) { const result = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())); result.setUTCDate(result.getUTCDate() - ((result.getUTCDay() + 6) % 7)); return result }
function latestBy(rows: Row[], key: string) { const map = new Map<string, Row>(); for (const row of rows) { const id = string(row[key]); if (id && !map.has(id)) map.set(id, row) } return map }
function numeric(value: unknown) { const parsed = Number(value ?? 0); return Number.isFinite(parsed) ? parsed : 0 }
function string(value: unknown, fallback = "") { return typeof value === "string" ? value : fallback }
function mapLift(row: Row): LiftMetric { return { metric: row.metric as LiftMetric["metric"], treatmentVisitors: numeric(row.treatment_visitors), treatmentConversions: numeric(row.treatment_conversions), controlVisitors: numeric(row.control_visitors), controlConversions: numeric(row.control_conversions), treatmentRate: numeric(row.treatment_rate), controlRate: numeric(row.control_rate), absoluteLift: numeric(row.absolute_lift), relativeLift: numeric(row.relative_lift), confidence: numeric(row.confidence), credible: row.credible === true } }

function aggregateLiquidity(rows: Row[]) {
  const cells = new Map<string, { city: string; niche: string; creators: Set<string>; total: number; open: number; filled: number }>()
  for (const row of rows) {
    const city = string(row.city, "Global")
    const niche = string(row.niche, "Open")
    const key = `${city.toLowerCase()}::${niche.toLowerCase()}`
    const cell = cells.get(key) ?? { city, niche, creators: new Set<string>(), total: 0, open: 0, filled: 0 }
    cell.total += 1
    if (row.status === "offered") cell.open += 1
    if (row.status === "accepted" || row.status === "qualified" || row.status === "paid") {
      cell.filled += 1
      if (typeof row.creator_id === "string") cell.creators.add(row.creator_id)
    }
    cells.set(key, cell)
  }
  return [...cells.values()].map((cell) => {
    const qualifiedCreators = cell.creators.size
    const pressure = cell.open === 0 && qualifiedCreators > 0 ? "brief_shortage" : cell.open > Math.max(qualifiedCreators, 1) ? "creator_shortage" : "balanced"
    return { city: cell.city, niche: cell.niche, qualified_creators: qualifiedCreators, open_briefs: cell.open, median_accept_minutes: 0, fill_rate: cell.total ? cell.filled / cell.total : 0, pressure, calculated_at: new Date().toISOString() }
  })
}
