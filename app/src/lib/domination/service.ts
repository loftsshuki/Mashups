import "server-only"

import { isSupabaseConfigured } from "@/lib/config/runtime"
import { DEMO_DOMINATION } from "@/lib/domination/demo"
import { assessTrust, calculateIncrementalLift, priceCampaign, qualifyLaunchProtection, scoreArIntelligence } from "@/lib/domination/engines"
import type { DominationSnapshot, GrowthLicense, GrowthLicenseDocument, IndexEntry, InventoryWindow, PartnerRail } from "@/lib/domination/types"
import { createAdminClient } from "@/lib/supabase/admin"

type Row = Record<string, unknown>

export async function getPublicMashupsIndex(demo = false): Promise<IndexEntry[]> {
  if (demo) return DEMO_DOMINATION.index
  if (!isSupabaseConfigured()) return []
  const admin = createAdminClient()
  if (!admin) return []
  const { data: edition } = await admin.from("mashups_index_editions").select("id").eq("status", "published").order("published_at", { ascending: false }).limit(1).maybeSingle()
  if (!edition) return []
  const { data } = await admin.from("mashups_index_entries").select("rank,breakout_score,movement,strongest_city,strongest_hook_sec,incremental_save_lift,creator_k_factor,viral_launches(slug,track_title,artist_name,settings)").eq("edition_id", edition.id).order("rank")
  return (data ?? []).map((raw) => {
    const row = raw as unknown as Row
    const launch = relation(row.viral_launches)
    const settings = relation(launch.settings)
    return { rank: number(row.rank), slug: string(launch.slug), trackTitle: string(launch.track_title, "Untitled"), artistName: string(launch.artist_name, "Independent artist"), genre: string(settings.genre, "Electronic"), breakoutScore: number(row.breakout_score), creatorKFactor: number(row.creator_k_factor), incrementalSaveLift: number(row.incremental_save_lift), strongestCity: string(row.strongest_city, "Global"), strongestHookSec: number(row.strongest_hook_sec), movement: number(row.movement) }
  })
}

export async function getGrowthLicenseDocument(userId: string | null, demo = false): Promise<GrowthLicenseDocument | null> {
  if (demo) return {
    agreementId: "agreement-demo",
    launchTitle: DEMO_DOMINATION.launchTitle,
    artistName: "Nia Vale",
    trackTitle: "Midnight Velocity",
    organizationName: "Nia Vale Music",
    termsMarkdown: "Mashups may coordinate attributed short-form creator campaigns, create campaign-only hook edits, and amplify cleared winning posts within the stated cap. The rightsholder keeps ownership. No standalone DSP derivative may be distributed. Either party may invoke the stated takedown process.",
    offeredAt: "2026-08-01T14:00:00.000Z",
    expiresAt: "2026-08-15T14:00:00.000Z",
    license: DEMO_DOMINATION.license,
  }
  if (!userId || !isSupabaseConfigured()) return null
  const admin = createAdminClient()
  if (!admin) return null
  const [{ data: ownedOrganizations }, { data: memberships }] = await Promise.all([
    admin.from("rightsholder_organizations").select("id").eq("owner_id", userId),
    admin.from("rightsholder_members").select("organization_id").eq("user_id", userId),
  ])
  const organizationIds = [...new Set([...(ownedOrganizations ?? []).map((row) => row.id), ...(memberships ?? []).map((row) => row.organization_id)])]
  const select = "*,growth_license_templates(code,version,terms_markdown,permitted_uses,derivative_policy,takedown_sla_hours),viral_launches(title,artist_name,track_title),rightsholder_organizations(name)"
  const queries = [
    admin.from("growth_license_agreements").select(select).eq("offered_by", userId).order("offered_at", { ascending: false }).limit(5),
    admin.from("growth_license_agreements").select(select).eq("accepted_by", userId).order("offered_at", { ascending: false }).limit(5),
  ]
  if (organizationIds.length) queries.push(admin.from("growth_license_agreements").select(select).in("organization_id", organizationIds).order("offered_at", { ascending: false }).limit(5))
  const results = await Promise.all(queries)
  const candidates = new Map<string, Row>()
  for (const result of results) for (const raw of result.data ?? []) candidates.set(raw.id, raw as unknown as Row)
  const latest = [...candidates.values()].sort((a, b) => string(b.offered_at).localeCompare(string(a.offered_at)))[0]
  if (!latest) return null
  const launch = relation(latest.viral_launches)
  const organization = relation(latest.rightsholder_organizations)
  const template = relation(latest.growth_license_templates)
  return {
    agreementId: string(latest.id),
    launchTitle: string(launch.title, "Campaign license"),
    artistName: string(launch.artist_name, "Independent artist"),
    trackTitle: string(launch.track_title, "Untitled track"),
    organizationName: string(organization.name, "Rightsholder"),
    termsMarkdown: string(template.terms_markdown, "Review the terms snapshot before acceptance."),
    offeredAt: string(latest.offered_at),
    expiresAt: string(latest.expires_at),
    license: mapLicense(latest),
  }
}

export async function getDominationSnapshot(userId: string | null, demo = false, launchSlug?: string): Promise<DominationSnapshot | null> {
  if (demo) return DEMO_DOMINATION
  if (!userId || !isSupabaseConfigured()) return null
  const admin = createAdminClient()
  if (!admin) return null
  const launchQuery = admin.from("viral_launches").select("id,slug,title,artist_name,track_title,qualified_posts,creators_activated,creator_k_factor").eq("owner_id", userId)
  const { data: launch } = launchSlug
    ? await launchQuery.eq("slug", launchSlug).maybeSingle()
    : await launchQuery.order("created_at", { ascending: false }).limit(1).maybeSingle()
  if (!launch) return null

  const { data: organizations } = await admin.from("rightsholder_organizations").select("id,name").eq("owner_id", userId)
  const organizationIds = (organizations ?? []).map((organization) => organization.id)
  const [guaranteeResult, liftResult, licenseResult, liquidityResult, scenesResult, amplificationResult, contractResult, partnersResult, trustResult, arResult, quoteResult, policyResult, index, genomeResult, cityResult] = await Promise.all([
    admin.from("guaranteed_launch_programs").select("*").eq("launch_id", launch.id).maybeSingle(),
    admin.from("campaign_lift_snapshots").select("*").eq("launch_id", launch.id).order("calculated_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("growth_license_agreements").select("*,growth_license_templates(code,version,permitted_uses,derivative_policy,takedown_sla_hours)").eq("launch_id", launch.id).order("offered_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("creator_liquidity_snapshots").select("*").order("calculated_at", { ascending: false }).limit(200),
    admin.from("scene_programs").select("*").eq("genre", "Electronic").order("starts_at"),
    admin.from("amplification_allocations").select("*,paid_media_handoffs(genome_id,organic_proof,consent_status,license_status)").eq("launch_id", launch.id).order("created_at", { ascending: false }),
    admin.from("artist_participation_contracts").select("*,artist_participation_obligations(*)").eq("launch_id", launch.id).maybeSingle(),
    admin.from("partner_integrations").select("*").eq("owner_id", userId),
    admin.from("trust_assessments").select("*").eq("launch_id", launch.id).order("assessed_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("ar_intelligence_reports").select("*").eq("launch_id", launch.id).order("generated_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("commercial_offers").select("*").eq("owner_id", userId).eq("launch_id", launch.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("launch_protection_policies").select("*").eq("launch_id", launch.id).maybeSingle(),
    getPublicMashupsIndex(),
    admin.from("viral_template_genomes").select("id,name,niche,hook_start_sec,completion_rate").eq("launch_id", launch.id).order("viral_score", { ascending: false }).limit(1).maybeSingle(),
    admin.from("city_campaign_cells").select("city").eq("launch_id", launch.id).order("score", { ascending: false }).limit(1).maybeSingle(),
  ])

  const liftRow = liftResult.data
  const lift = liftRow ? { metric: liftRow.metric, treatmentVisitors: liftRow.treatment_visitors, treatmentConversions: liftRow.treatment_conversions, controlVisitors: liftRow.control_visitors, controlConversions: liftRow.control_conversions, treatmentRate: number(liftRow.treatment_rate), controlRate: number(liftRow.control_rate), absoluteLift: number(liftRow.absolute_lift), relativeLift: number(liftRow.relative_lift), confidence: number(liftRow.confidence), credible: liftRow.credible } as DominationSnapshot["lift"] : calculateIncrementalLift({ metric: "save_rate", treatmentVisitors: 1, treatmentConversions: 0, controlVisitors: 1, controlConversions: 0 })
  const trustRow = trustResult.data
  const trust = trustRow ? { score: trustRow.score, level: trustRow.level, signals: trustSignals(trustRow.signals), assessedAt: trustRow.assessed_at } as DominationSnapshot["trust"] : assessTrust({ rightsVerified: false, audienceOverlap: 0, engagementAnomaly: 0, duplicateContentRate: 0, suspiciousSaveRate: 0, payoutDisputes: 0 })
  const quoteRow = quoteResult.data
  const quote = quoteRow ? { tier: quoteRow.tier, platformFeeCents: quoteRow.platform_fee_cents, creatorBudgetCents: quoteRow.creator_budget_cents, mediaBudgetCents: quoteRow.media_budget_cents, operationsFeeCents: quoteRow.operations_fee_cents, totalCents: quoteRow.total_cents, deliverables: stringArray(quoteRow.deliverables) } as DominationSnapshot["quote"] : priceCampaign({ tier: "pilot", targetCreators: 50, mediaBudgetCents: 0, creatorRewardCents: 5000 })
  const topGenome = genomeResult.data
  const strongestCity = cityResult.data?.city ?? "Global"
  const arRow = arResult.data
  const ar = arRow ? { breakoutProbability: arRow.breakout_probability, strongestHookSec: arRow.strongest_hook_sec, recommendedNiche: arRow.recommended_niche, recommendedCity: arRow.recommended_city, expectedQualifiedActivationCents: arRow.expected_qpa_cents, paidReadiness: arRow.paid_readiness, explanation: stringArray(arRow.explanation) } : scoreArIntelligence({ lift, creatorKFactor: number(launch.creator_k_factor), trustScore: trust.score, completionRate: number(topGenome?.completion_rate), strongestHookSec: number(topGenome?.hook_start_sec), niche: topGenome?.niche ?? "Open", city: strongestCity, costPerQualifiedActivationCents: 1500 })
  const license = mapLicense(licenseResult.data)
  const inventory = await loadInventory(admin, organizationIds)
  const guaranteeRow = guaranteeResult.data
  const guaranteeFloor = guaranteeRow?.qualified_post_floor ?? 50
  const completion = guaranteeFloor > 0 ? Math.min(100, Math.round((launch.qualified_posts / guaranteeFloor) * 100)) : 0
  const policyRow = policyResult.data
  const protection = policyRow ? { status: protectionStatus(policyRow.status), serviceCreditCents: policyRow.service_credit_cents, conditions: protectionConditions(policyRow.conditions), terms: string(relation(policyRow.terms_snapshot).summary, "Operational service-credit protection only. This is not insurance.") } as DominationSnapshot["protection"] : qualifyLaunchProtection({ platformFeeCents: quote.platformFeeCents, rightsVerified: license.status === "accepted", trustScore: trust.score, treatmentSample: lift.treatmentVisitors, controlSample: lift.controlVisitors, artistContractAccepted: contractResult.data?.status === "accepted" || contractResult.data?.status === "completed", measurementConnected: lift.treatmentVisitors >= 100 && lift.controlVisitors >= 100 })
  const sceneRows = scenesResult.data ?? []
  const sceneIds = sceneRows.map((row) => row.id)
  const sceneCities = sceneRows.map((row) => row.city)
  const [sceneMembersResult, sceneCellsResult] = await Promise.all([
    sceneIds.length ? admin.from("scene_program_members").select("scene_program_id,role,status").in("scene_program_id", sceneIds).eq("status", "active") : Promise.resolve({ data: [] }),
    sceneCities.length ? admin.from("city_campaign_cells").select("city,creator_count,qualified_posts,saves").in("city", sceneCities) : Promise.resolve({ data: [] }),
  ])
  const sceneMembership = countSceneMembers((sceneMembersResult.data ?? []) as Row[])
  const scenePerformance = sumSceneCells((sceneCellsResult.data ?? []) as Row[])

  return {
    launchSlug: launch.slug,
    launchTitle: launch.title,
    mode: "live",
    guarantee: { status: guaranteeStatus(guaranteeRow?.status), qualifiedPostFloor: guaranteeFloor, creatorTestFloor: guaranteeRow?.creator_test_floor ?? 50, reportDueDays: guaranteeRow?.report_due_days ?? 14, completion },
    lift,
    graph: buildTruthGraph(launch, topGenome, strongestCity, lift, trust.score),
    license,
    inventory,
    liquidity: dedupeLiquidity((liquidityResult.data ?? []) as Row[]),
    scenes: sceneRows.map((row) => { const members = sceneMembership.get(row.id) ?? { captains: 0, venues: 0, creators: 0 }; const performance = scenePerformance.get(row.city) ?? { creators: 0, qualifiedPosts: 0, saves: 0 }; return { city: row.city, code: row.code, captains: members.captains, venues: members.venues, creators: Math.max(members.creators, performance.creators), qualifiedPosts: performance.qualifiedPosts, saves: performance.saves, status: row.status === "live" || row.status === "graduated" ? row.status : "recruiting" } }),
    amplification: (amplificationResult.data ?? []).map((raw) => { const row = raw as unknown as Row; const handoff = relation(row.paid_media_handoffs); const proof = relation(handoff.organic_proof); return { id: string(row.id), creatorHandle: `Creator ${string(row.creator_id).slice(0, 8)}`, genomeName: topGenome?.name ?? `Genome ${string(handoff.genome_id).slice(0, 8)}`, organicLift: number(proof.lift), trustScore: trust.score, consent: handoff.consent_status as "pending" | "granted" | "declined", rights: handoff.license_status as "pending" | "cleared" | "blocked", recommendedSpendCents: number(row.recommended_spend_cents) } }),
    artistObligations: relations(contractResult.data?.artist_participation_obligations).map((row) => ({ id: string(row.id), action: string(row.action), required: number(row.required_count), completed: number(row.completed_count), dueAt: string(row.due_at), status: row.status as "pending" | "complete" | "late" })),
    partners: mapPartners(partnersResult.data ?? []),
    trust,
    index,
    ar,
    quote,
    protection,
  }
}

async function loadInventory(admin: NonNullable<ReturnType<typeof createAdminClient>>, organizationIds: string[]): Promise<InventoryWindow[]> {
  if (!organizationIds.length) return []
  const { data: windows } = await admin.from("inventory_exclusivity_windows").select("*").in("organization_id", organizationIds).eq("status", "active").order("ends_at")
  const trackIds = (windows ?? []).map((window) => window.track_submission_id)
  if (!trackIds.length) return []
  const { data: tracks } = await admin.from("supply_track_submissions").select("id,artist_name,track_title,launch_readiness,rights_status,rights_attestation").in("id", trackIds)
  const trackMap = new Map((tracks ?? []).map((track) => [track.id, track]))
  return (windows ?? []).flatMap((window) => { const track = trackMap.get(window.track_submission_id); if (!track) return []; return [{ id: window.id, artistName: track.artist_name, trackTitle: track.track_title, genre: string(relation(track.rights_attestation).genre, "Electronic"), exclusivityEndsAt: window.ends_at, campaignSlots: window.campaign_slot_limit - window.campaign_slots_used, launchReadiness: track.launch_readiness, rightsStatus: track.rights_status === "verified" ? "verified" as const : "review" as const }] })
}

function mapLicense(raw: unknown): GrowthLicense {
  const row = relation(raw)
  const template = relation(row.growth_license_templates)
  const status = row.status === "offered" || row.status === "accepted" || row.status === "expired" ? row.status : row.status === "terminated" ? "expired" : "draft"
  return { code: string(row.verification_code, "Not issued"), version: string(template.version, "1.0"), status, permittedUses: stringArray(template.permitted_uses), territories: stringArray(row.territories), termDays: number(row.term_days), paidMediaCapCents: number(row.paid_media_cap_cents), derivativePolicy: string(template.derivative_policy, "No derivatives authorized."), takedownSlaHours: number(template.takedown_sla_hours), acceptedAt: typeof row.accepted_at === "string" ? row.accepted_at : null }
}

function mapPartners(rows: Row[]): PartnerRail[] {
  const found = new Map(rows.map((row) => [row.provider, row]))
  return (["linkfire", "featurefm", "distributor", "ad_platform"] as const).map((provider) => { const row = found.get(provider); return { id: typeof row?.id === "string" ? row.id : null, provider, label: provider === "featurefm" ? "Feature.fm pre-save" : provider === "linkfire" ? "Linkfire routing" : provider === "distributor" ? "Distributor metadata" : "Paid media export", status: row ? row.status as PartnerRail["status"] : "not_connected", capabilities: stringArray(row?.capabilities), deliveries: 0, lastDeliveryAt: typeof row?.last_delivery_at === "string" ? row.last_delivery_at : null } })
}

function buildTruthGraph(launch: Row, genome: Row | null, city: string, lift: DominationSnapshot["lift"], trustScore: number): DominationSnapshot["graph"] {
  return { nodes: [
    { id: "track", kind: "track", label: string(launch.track_title, "Track"), value: "campaign source" },
    { id: "genome", kind: "genome", label: string(genome?.name, "Awaiting genome"), value: `${Math.round(number(genome?.completion_rate) * 100)}% completion` },
    { id: "creator", kind: "creator", label: "Creator network", value: `${trustScore} trust` },
    { id: "city", kind: "city", label: city, value: `${number(launch.creator_k_factor).toFixed(2)} creator K` },
    { id: "save", kind: "save", label: "Measured intent", value: `${Math.round(lift.relativeLift * 100)}% lift` },
  ], edges: [
    { from: "track", to: "genome", weight: 1, evidence: "licensed source" },
    { from: "genome", to: "creator", weight: number(genome?.completion_rate), evidence: "qualified activation" },
    { from: "creator", to: "city", weight: trustScore / 100, evidence: "trust-adjusted attribution" },
    { from: "city", to: "save", weight: lift.confidence, evidence: "matched holdout" },
  ] }
}

function relation(value: unknown): Row { if (Array.isArray(value)) return (value[0] ?? {}) as Row; return value && typeof value === "object" ? value as Row : {} }
function relations(value: unknown): Row[] { return Array.isArray(value) ? value.filter((item): item is Row => Boolean(item) && typeof item === "object") : [] }
function number(value: unknown): number { const result = Number(value ?? 0); return Number.isFinite(result) ? result : 0 }
function string(value: unknown, fallback = ""): string { return typeof value === "string" ? value : fallback }
function stringArray(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [] }
function trustSignals(value: unknown): DominationSnapshot["trust"]["signals"] { return relations(value).flatMap((row) => typeof row.label === "string" ? [{ label: row.label, impact: number(row.impact), status: row.status as "clear" | "warning" | "blocked" }] : []) }
function protectionConditions(value: unknown): DominationSnapshot["protection"]["conditions"] { return relations(value).flatMap((row) => typeof row.label === "string" ? [{ label: row.label, passed: row.passed === true, detail: string(row.detail) }] : []) }
function protectionStatus(value: unknown): DominationSnapshot["protection"]["status"] { return value === "protected" || value === "claimed" || value === "credited" ? "protected" : value === "eligible" || value === "conditional" ? value : "ineligible" }
function guaranteeStatus(value: unknown): DominationSnapshot["guarantee"]["status"] { return value === "active" ? "active" : value === "completed" || value === "failed" || value === "settled" ? "settled" : "configured" }
function dedupeLiquidity(rows: Row[]): DominationSnapshot["liquidity"] { const cells = new Map<string, DominationSnapshot["liquidity"][number]>(); for (const row of rows) { const key = `${string(row.city)}::${string(row.niche)}`; if (!cells.has(key)) cells.set(key, { city: string(row.city), niche: string(row.niche), qualifiedCreators: number(row.qualified_creators), openBriefs: number(row.open_briefs), medianAcceptMinutes: number(row.median_accept_minutes), fillRate: number(row.fill_rate), pressure: row.pressure === "creator_shortage" || row.pressure === "brief_shortage" ? row.pressure : "balanced" }) } return [...cells.values()].slice(0, 20) }
function countSceneMembers(rows: Row[]) { const counts = new Map<string, { captains: number; venues: number; creators: number }>(); for (const row of rows) { const id = string(row.scene_program_id); const current = counts.get(id) ?? { captains: 0, venues: 0, creators: 0 }; if (row.role === "captain") current.captains += 1; if (row.role === "venue") current.venues += 1; if (row.role === "creator") current.creators += 1; counts.set(id, current) } return counts }
function sumSceneCells(rows: Row[]) { const counts = new Map<string, { creators: number; qualifiedPosts: number; saves: number }>(); for (const row of rows) { const city = string(row.city); const current = counts.get(city) ?? { creators: 0, qualifiedPosts: 0, saves: 0 }; current.creators += number(row.creator_count); current.qualifiedPosts += number(row.qualified_posts); current.saves += number(row.saves); counts.set(city, current) } return counts }
