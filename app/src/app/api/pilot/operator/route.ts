import { NextResponse } from "next/server"
import { z } from "zod"

import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ intakeId: z.string().min(2).max(120), guaranteedLaunch: z.object({ creatorFloor: z.number().int().min(10), qualifiedPostFloor: z.number().int().min(1), genomeFloor: z.number().int().min(1).max(20), reportDueDays: z.number().int().min(1).max(90) }), growthLicense: z.object({ territories: z.array(z.string()).min(1), termDays: z.number().int().min(1).max(3650), paidMediaCapCents: z.number().int().min(0), takedownSlaHours: z.number().int().min(1).max(720) }), exclusivity: z.object({ type: z.enum(["campaign", "category", "platform", "territory"]), days: z.number().int().min(1).max(3650), slots: z.number().int().min(1).max(1000) }), artistParticipation: z.object({ reactionCount: z.number().int().min(0).max(100), repostCount: z.number().int().min(0).max(100), liveSessionCount: z.number().int().min(0).max(100) }), partnerRails: z.array(z.enum(["linkfire", "featurefm", "distributor", "ad_platform"])).min(1), measurementPlan: z.object({ metric: z.enum(["save_rate", "follow_rate", "stream_rate", "qualified_post_rate"]), controlMethod: z.string().min(2).max(80), minimumCohort: z.number().int().min(100).max(1_000_000) }), commercialOffer: z.object({ tier: z.enum(["pilot", "growth", "label_os"]), creatorRewardCents: z.number().int().min(1500), platformFeeCents: z.number().int().min(0) }), protectionTerms: z.object({ enabled: z.boolean(), serviceCreditCapCents: z.number().int().min(0), excludes: z.array(z.string()).min(1) }) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid operator configuration.", issues: parsed.error.issues }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, configId: "operator-demo", status: "ready", readiness: 88, demo: true })
  if (!z.uuid().safeParse(parsed.data.intakeId).success) return NextResponse.json({ error: "Invalid intake." }, { status: 400 })
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 })
  const admin = createAdminClient(); if (!admin) return NextResponse.json({ error: "Operator storage is unavailable." }, { status: 503 })
  const { data: intake } = await admin.from("pilot_campaign_intakes").select("id,rights_readiness").eq("id", parsed.data.intakeId).eq("owner_id", user.id).maybeSingle()
  if (!intake) return NextResponse.json({ error: "Pilot intake not found." }, { status: 404 })
  const status = intake.rights_readiness === "verified" ? "ready" : "draft"
  const { data, error } = await admin.from("pilot_operator_configs").upsert({ intake_id: intake.id, owner_id: user.id, guaranteed_launch: parsed.data.guaranteedLaunch, growth_license: parsed.data.growthLicense, exclusivity: parsed.data.exclusivity, artist_participation: parsed.data.artistParticipation, partner_rails: parsed.data.partnerRails, measurement_plan: parsed.data.measurementPlan, commercial_offer: parsed.data.commercialOffer, protection_terms: parsed.data.protectionTerms, status, updated_at: new Date().toISOString() }, { onConflict: "intake_id" }).select("id").single()
  if (error || !data) return NextResponse.json({ error: "Unable to save operator configuration." }, { status: 500 })
  const readyKeys = ["growth-license", "hook-genomes", "creator-liquidity", "measurement", "artist-contract", "partner-rails"]
  await admin.from("pilot_checklist_items").update({ status: "ready", evidence: { detail: "Configured in operator workspace." }, updated_at: new Date().toISOString() }).eq("intake_id", intake.id).in("item_key", readyKeys)
  return NextResponse.json({ ok: true, configId: data.id, status, readiness: status === "ready" ? 88 : 75 })
}
