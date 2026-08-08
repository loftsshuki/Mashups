import { NextResponse } from "next/server"
import { z } from "zod"

import { scoreArIntelligence } from "@/lib/domination/engines"
import type { LiftMetric } from "@/lib/domination/types"
import { isDemoRequest } from "@/lib/demo/runtime"
import { DEMO_DOMINATION } from "@/lib/domination/demo"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ launchSlug: z.string().trim().min(2).max(100), expectedQualifiedActivationCents: z.number().int().min(0).max(10_000_000).default(1500) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid A&R report request." }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, report: DEMO_DOMINATION.ar, reportId: "ar-demo", demo: true })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "A&R storage is unavailable." }, { status: 503 })
  const { data: launch } = await admin.from("viral_launches").select("id,creator_k_factor").eq("slug", parsed.data.launchSlug).eq("owner_id", user.id).maybeSingle()
  if (!launch) return NextResponse.json({ error: "Launch not found." }, { status: 404 })
  const [{ data: liftRow }, { data: trustRow }, { data: genome }, { data: city }] = await Promise.all([
    admin.from("campaign_lift_snapshots").select("*").eq("launch_id", launch.id).order("calculated_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("trust_assessments").select("score").eq("launch_id", launch.id).order("assessed_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("viral_template_genomes").select("niche,hook_start_sec,completion_rate").eq("launch_id", launch.id).order("viral_score", { ascending: false }).limit(1).maybeSingle(),
    admin.from("city_campaign_cells").select("city").eq("launch_id", launch.id).order("score", { ascending: false }).limit(1).maybeSingle(),
  ])
  if (!liftRow) return NextResponse.json({ error: "Run a matched-control measurement before generating A&R intelligence." }, { status: 409 })
  const lift: LiftMetric = { metric: liftRow.metric, treatmentVisitors: liftRow.treatment_visitors, treatmentConversions: liftRow.treatment_conversions, controlVisitors: liftRow.control_visitors, controlConversions: liftRow.control_conversions, treatmentRate: Number(liftRow.treatment_rate), controlRate: Number(liftRow.control_rate), absoluteLift: Number(liftRow.absolute_lift), relativeLift: Number(liftRow.relative_lift), confidence: Number(liftRow.confidence), credible: liftRow.credible }
  const report = scoreArIntelligence({ lift, creatorKFactor: Number(launch.creator_k_factor), trustScore: trustRow?.score ?? 0, completionRate: Number(genome?.completion_rate ?? 0), strongestHookSec: Number(genome?.hook_start_sec ?? 0), niche: genome?.niche ?? "Open", city: city?.city ?? "Global", costPerQualifiedActivationCents: parsed.data.expectedQualifiedActivationCents })
  const { data, error } = await admin.from("ar_intelligence_reports").insert({ launch_id: launch.id, owner_id: user.id, breakout_probability: report.breakoutProbability, strongest_hook_sec: report.strongestHookSec, recommended_niche: report.recommendedNiche, recommended_city: report.recommendedCity, expected_qpa_cents: report.expectedQualifiedActivationCents, paid_readiness: report.paidReadiness, explanation: report.explanation }).select("id").single()
  if (error || !data) return NextResponse.json({ error: "Unable to save A&R report." }, { status: 500 })
  return NextResponse.json({ ok: true, report, reportId: data.id }, { status: 201 })
}
