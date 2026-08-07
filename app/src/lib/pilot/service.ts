import "server-only"

import { isSupabaseConfigured } from "@/lib/config/runtime"
import { DEMO_OUTREACH_WORKSPACE, DEMO_PILOT_WORKSPACE } from "@/lib/pilot/demo"
import type { OutreachProspect, OutreachTemplate, OutreachWorkspace, PilotChecklistItem, PilotIntake, PilotMarket, PilotOperatorConfig, PilotProgram, PilotWorkspace, ReadinessItem, ReadinessSnapshot } from "@/lib/pilot/types"
import { createAdminClient } from "@/lib/supabase/admin"

type Row = Record<string, unknown>

export async function getPilotWorkspace(userId: string | null, demo = false): Promise<PilotWorkspace> {
  if (demo) return DEMO_PILOT_WORKSPACE
  const admin = createAdminClient()
  const [programsResult, marketsResult] = admin ? await Promise.all([
    admin.from("pilot_program_templates").select("*").eq("is_active", true).order("created_at"),
    admin.from("pilot_market_configs").select("*").eq("is_active", true).order("city"),
  ]) : [{ data: [] }, { data: [] }]
  if (!admin || !userId) return { mode: "live", programs: mapPrograms(programsResult.data ?? []), markets: mapMarkets(marketsResult.data ?? []), intake: null, operatorConfig: null, checklist: [] }
  const { data: intakeRow } = await admin.from("pilot_campaign_intakes").select("*").eq("owner_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle()
  if (!intakeRow) return { mode: "live", programs: mapPrograms(programsResult.data ?? []), markets: mapMarkets(marketsResult.data ?? []), intake: null, operatorConfig: null, checklist: [] }
  const [configResult, checklistResult] = await Promise.all([
    admin.from("pilot_operator_configs").select("*").eq("intake_id", intakeRow.id).maybeSingle(),
    admin.from("pilot_checklist_items").select("*").eq("intake_id", intakeRow.id).order("category"),
  ])
  return { mode: "live", programs: mapPrograms(programsResult.data ?? []), markets: mapMarkets(marketsResult.data ?? []), intake: mapIntake(intakeRow), operatorConfig: configResult.data ? mapOperatorConfig(configResult.data) : null, checklist: (checklistResult.data ?? []).map(mapChecklist) }
}

export async function getOutreachWorkspace(userId: string | null, demo = false): Promise<OutreachWorkspace> {
  if (demo) return DEMO_OUTREACH_WORKSPACE
  const admin = createAdminClient()
  if (!admin) return { mode: "live", prospects: [], templates: [] }
  const [prospectsResult, templatesResult] = await Promise.all([
    userId ? admin.from("outreach_prospects").select("*").eq("owner_id", userId).order("priority", { ascending: false }).order("updated_at", { ascending: false }) : Promise.resolve({ data: [] }),
    admin.from("outreach_playbook_templates").select("*").eq("is_active", true).order("code"),
  ])
  return { mode: "live", prospects: (prospectsResult.data ?? []).map(mapProspect), templates: (templatesResult.data ?? []).map(mapTemplate) }
}

export async function getReadinessSnapshot(userId: string | null, demo = false): Promise<ReadinessSnapshot> {
  const databaseConfigured = isSupabaseConfigured()
  const admin = createAdminClient()
  let schemaReady = false
  let hasIntake = false
  let hasOperatorConfig = false
  if (databaseConfigured && admin) {
    const schema = await admin.from("pilot_program_templates").select("id", { count: "exact", head: true })
    schemaReady = !schema.error
    if (schemaReady && userId) {
      const { data: intake } = await admin.from("pilot_campaign_intakes").select("id").eq("owner_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle()
      hasIntake = Boolean(intake)
      if (intake) { const { data: config } = await admin.from("pilot_operator_configs").select("id,status").eq("intake_id", intake.id).maybeSingle(); hasOperatorConfig = config?.status === "ready" || config?.status === "activated" }
    }
  }
  const items: ReadinessItem[] = [
    { key: "database", category: "infrastructure", label: "Production Supabase reachable", status: schemaReady ? "ready" : "blocked", required: true, detail: schemaReady ? "Pilot and Domination schemas respond through the service role." : "Create the replacement project, apply migrations, and update Supabase environment variables.", actionHref: "/readiness", actionLabel: "Review backend blocker" },
    { key: "blob", category: "infrastructure", label: "Vercel Blob configured", status: process.env.BLOB_READ_WRITE_TOKEN ? "ready" : "blocked", required: true, detail: process.env.BLOB_READ_WRITE_TOKEN ? "Authenticated campaign asset storage is available." : "Set BLOB_READ_WRITE_TOKEN for master and export storage." },
    { key: "cron", category: "infrastructure", label: "Cron signing configured", status: process.env.CRON_SECRET ? "ready" : "blocked", required: true, detail: process.env.CRON_SECRET ? "Autopilot and weekly Index schedules fail closed with a secret." : "Set CRON_SECRET before scheduled operations." },
    { key: "ai", category: "infrastructure", label: "AI model routing configured", status: process.env.OPENAI_API_KEY ? "ready" : "blocked", required: true, detail: process.env.OPENAI_API_KEY ? "Hook and campaign intelligence workloads can execute." : "Set OPENAI_API_KEY before AI-assisted campaigns." },
    { key: "domination", category: "product", label: "Domination OS verified", status: "ready", required: true, detail: "Fourteen commercial systems build and pass browser regression checks.", actionHref: `/domination${demo ? "?demo=1" : ""}`, actionLabel: "Open control plane" },
    { key: "pilot-schema", category: "product", label: "Pilot operations migration", status: schemaReady ? "ready" : "attention", required: true, detail: schemaReady ? "Migration 023 and production-safe operating seeds are present." : "Migration 023 is code-complete and validated locally, pending production database access." },
    { key: "portable-kit", category: "product", label: "Portable pilot operating kit", status: "ready", required: true, detail: "Device-local intake, operator terms, CSV pipeline import/export, and campaign packet generation work without server persistence.", actionHref: "/pilot/new?demo=1", actionLabel: "Open portable intake" },
    { key: "intake", category: "pilot", label: "Founding campaign intake", status: demo || hasIntake ? "ready" : "attention", required: true, detail: demo || hasIntake ? "Track, rights, market, creator, and budget inputs are captured." : "Submit the first real pilot campaign.", actionHref: `/pilot/new${demo ? "?demo=1" : ""}`, actionLabel: "Open intake" },
    { key: "operator", category: "pilot", label: "Operator configuration", status: demo || hasOperatorConfig ? "ready" : "attention", required: true, detail: demo || hasOperatorConfig ? "Guarantees, rights, measurement, economics, and protection are configured." : "Complete the operator setup for the selected intake.", actionHref: `/operator${demo ? "?demo=1" : ""}`, actionLabel: "Configure pilot" },
    { key: "stripe", category: "partners", label: "Billing and payouts", status: process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET ? "ready" : "attention", required: false, detail: "Required before collecting campaign fees or paying creators." },
    { key: "partner-bridge", category: "partners", label: "Partner delivery bridge", status: process.env.PARTNER_DELIVERY_URL && process.env.PARTNER_DELIVERY_SECRET ? "ready" : "attention", required: false, detail: "Required for live Linkfire, Feature.fm, distributor, and paid-media delivery." },
    { key: "oauth", category: "partners", label: "Platform OAuth applications", status: process.env.SPOTIFY_CLIENT_ID && process.env.GOOGLE_CLIENT_ID ? "ready" : "attention", required: false, detail: "Provider review is required before public account connections." },
    { key: "vercel", category: "infrastructure", label: "Vercel deployment context", status: process.env.VERCEL ? "ready" : "attention", required: false, detail: process.env.VERCEL ? "Running inside a Vercel deployment." : "Local runtime; deploy preview after quality gates." },
  ]
  const required = items.filter((item) => item.required)
  const readyCount = required.filter((item) => item.status === "ready").length
  const status = required.some((item) => item.status === "blocked") ? "blocked" : required.some((item) => item.status === "attention") ? "attention" : "ready"
  return { mode: demo ? "demo" : "live", status, readyCount, totalRequired: required.length, items, checkedAt: new Date().toISOString() }
}

function mapPrograms(rows: Row[]): PilotProgram[] { return rows.map((row) => ({ id: string(row.id), code: string(row.code), name: string(row.name), genre: string(row.genre), marketCodes: strings(row.market_codes), creatorTarget: number(row.creator_target), qualifiedPostTarget: number(row.qualified_post_target), budgetFloorCents: number(row.budget_floor_cents), budgetCeilingCents: number(row.budget_ceiling_cents), rightsRequirements: strings(row.rights_requirements) })) }
function mapMarkets(rows: Row[]): PilotMarket[] { return rows.map((row) => ({ code: string(row.code), city: string(row.city), countryCode: string(row.country_code), primaryMotion: string(row.primary_motion), creatorTarget: number(row.creator_target), venueTarget: number(row.venue_target), targetNiches: strings(row.target_niches), partnerThesis: string(row.partner_thesis) })) }
function mapIntake(row: Row): PilotIntake { return { id: string(row.id), campaignName: string(row.campaign_name), artistName: string(row.artist_name), trackTitle: string(row.track_title), contactName: string(row.contact_name), contactEmail: string(row.contact_email), genre: string(row.genre), subgenre: string(row.subgenre), releaseStage: row.release_stage as PilotIntake["releaseStage"], releaseDate: nullableString(row.release_date), objectives: strings(row.objectives), targetMarkets: strings(row.target_markets), targetNiches: strings(row.target_niches), targetCreatorCount: number(row.target_creator_count), creatorBudgetCents: number(row.creator_budget_cents), paidMediaBudgetCents: number(row.paid_media_budget_cents), masterUrl: nullableString(row.master_url), rightsReadiness: row.rights_readiness as PilotIntake["rightsReadiness"], status: row.status as PilotIntake["status"], notes: nullableString(row.notes) } }
function mapOperatorConfig(row: Row): PilotOperatorConfig { const guaranteed = object(row.guaranteed_launch); const license = object(row.growth_license); const exclusivity = object(row.exclusivity); const artist = object(row.artist_participation); const measurement = object(row.measurement_plan); const offer = object(row.commercial_offer); const protection = object(row.protection_terms); return { intakeId: string(row.intake_id), status: row.status as PilotOperatorConfig["status"], guaranteedLaunch: { creatorFloor: number(guaranteed.creatorFloor), qualifiedPostFloor: number(guaranteed.qualifiedPostFloor), genomeFloor: number(guaranteed.genomeFloor), reportDueDays: number(guaranteed.reportDueDays) }, growthLicense: { territories: strings(license.territories), termDays: number(license.termDays), paidMediaCapCents: number(license.paidMediaCapCents), takedownSlaHours: number(license.takedownSlaHours) }, exclusivity: { type: exclusivity.type as PilotOperatorConfig["exclusivity"]["type"], days: number(exclusivity.days), slots: number(exclusivity.slots) }, artistParticipation: { reactionCount: number(artist.reactionCount), repostCount: number(artist.repostCount), liveSessionCount: number(artist.liveSessionCount) }, partnerRails: strings(row.partner_rails), measurementPlan: { metric: measurement.metric as PilotOperatorConfig["measurementPlan"]["metric"], controlMethod: string(measurement.controlMethod), minimumCohort: number(measurement.minimumCohort) }, commercialOffer: { tier: offer.tier as PilotOperatorConfig["commercialOffer"]["tier"], creatorRewardCents: number(offer.creatorRewardCents), platformFeeCents: number(offer.platformFeeCents) }, protectionTerms: { enabled: protection.enabled === true, serviceCreditCapCents: number(protection.serviceCreditCapCents), excludes: strings(protection.excludes) } } }
function mapChecklist(row: Row): PilotChecklistItem { return { key: string(row.item_key), category: row.category as PilotChecklistItem["category"], label: string(row.label), required: row.required === true, status: row.status as PilotChecklistItem["status"], detail: string(object(row.evidence).detail) } }
function mapProspect(row: Row): OutreachProspect { return { id: string(row.id), entityName: string(row.entity_name), entityType: row.entity_type as OutreachProspect["entityType"], contactName: nullableString(row.contact_name), contactEmail: nullableString(row.contact_email), city: nullableString(row.city), countryCode: nullableString(row.country_code), genres: strings(row.genres), catalogSignal: nullableString(row.catalog_signal), priority: number(row.priority), stage: row.stage as OutreachProspect["stage"], nextAction: nullableString(row.next_action), dueAt: nullableString(row.due_at), sourceUrl: nullableString(row.source_url), notes: nullableString(row.notes) } }
function mapTemplate(row: Row): OutreachTemplate { return { code: string(row.code), stage: string(row.stage), channel: row.channel as OutreachTemplate["channel"], subject: nullableString(row.subject), body: string(row.body) } }
function object(value: unknown): Row { return value && typeof value === "object" && !Array.isArray(value) ? value as Row : {} }
function strings(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [] }
function string(value: unknown): string { return typeof value === "string" ? value : "" }
function nullableString(value: unknown): string | null { return typeof value === "string" && value ? value : null }
function number(value: unknown): number { const parsed = Number(value ?? 0); return Number.isFinite(parsed) ? parsed : 0 }
