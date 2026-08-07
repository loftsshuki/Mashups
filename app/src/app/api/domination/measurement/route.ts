import { NextResponse } from "next/server"
import { z } from "zod"

import { calculateIncrementalLift } from "@/lib/domination/engines"
import { isDemoRequest } from "@/lib/demo/runtime"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ launchSlug: z.string().min(2).max(100), metric: z.enum(["save_rate", "follow_rate", "stream_rate", "qualified_post_rate"]), treatmentVisitors: z.number().int().min(1).max(100_000_000), treatmentConversions: z.number().int().min(0), controlVisitors: z.number().int().min(1).max(100_000_000), controlConversions: z.number().int().min(0), hypothesis: z.string().trim().min(10).max(500).default("Creator activation increases downstream music intent against a matched holdout.") })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid experiment evidence." }, { status: 400 })
  const lift = calculateIncrementalLift(parsed.data)
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, lift, snapshotId: "lift-demo", demo: true })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  const rate = await consumeRateLimit({ key: resolveRateLimitKey(request, "domination.measurement", user.id), limit: 12, windowMs: 60_000 })
  if (!rate.allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Measurement storage is unavailable." }, { status: 503 })
  const { data: launch } = await admin.from("viral_launches").select("id").eq("slug", parsed.data.launchSlug).eq("owner_id", user.id).maybeSingle()
  if (!launch) return NextResponse.json({ error: "Launch not found." }, { status: 404 })
  const { data: experiment, error: experimentError } = await admin.from("campaign_experiments").insert({ launch_id: launch.id, owner_id: user.id, name: `${parsed.data.metric} lift test`, hypothesis: parsed.data.hypothesis, primary_metric: parsed.data.metric, assignment_unit: "visitor", status: "completed", started_at: new Date().toISOString(), ended_at: new Date().toISOString(), settings: { methodology: "matched_holdout" } }).select("id").single()
  if (experimentError || !experiment) return NextResponse.json({ error: "Unable to create experiment." }, { status: 500 })
  const writes = await Promise.all([
    admin.from("campaign_experiment_cohorts").insert([
      { experiment_id: experiment.id, name: "Activated audience", cohort_type: "treatment", assignment_key: "treatment", visitor_count: lift.treatmentVisitors, conversion_count: lift.treatmentConversions },
      { experiment_id: experiment.id, name: "Matched holdout", cohort_type: "control", assignment_key: "control", visitor_count: lift.controlVisitors, conversion_count: lift.controlConversions },
    ]),
    admin.from("campaign_lift_snapshots").insert({ experiment_id: experiment.id, launch_id: launch.id, metric: lift.metric, treatment_visitors: lift.treatmentVisitors, treatment_conversions: lift.treatmentConversions, control_visitors: lift.controlVisitors, control_conversions: lift.controlConversions, treatment_rate: lift.treatmentRate, control_rate: lift.controlRate, absolute_lift: lift.absoluteLift, relative_lift: lift.relativeLift, confidence: lift.confidence, credible: lift.credible }).select("id").single(),
  ])
  if (writes.some((write) => write.error)) return NextResponse.json({ error: "Unable to persist experiment evidence." }, { status: 500 })
  return NextResponse.json({ ok: true, lift, experimentId: experiment.id, snapshotId: writes[1].data?.id })
}
