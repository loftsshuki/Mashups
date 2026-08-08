import { NextResponse } from "next/server"
import { z } from "zod"

import { assessTrust } from "@/lib/domination/engines"
import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ launchSlug: z.string().min(2).max(100), subjectType: z.enum(["creator", "track", "post", "launch", "organization"]), subjectId: z.string().min(2).max(120), rightsVerified: z.boolean(), audienceOverlap: z.number().min(0).max(1), engagementAnomaly: z.number().min(0).max(1), duplicateContentRate: z.number().min(0).max(1), suspiciousSaveRate: z.number().min(0).max(1), payoutDisputes: z.number().int().min(0).max(100) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid trust evidence." }, { status: 400 })
  const assessment = assessTrust(parsed.data)
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, assessment, assessmentId: "trust-demo", demo: true })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Trust storage is unavailable." }, { status: 503 })
  const { data: launch } = await admin.from("viral_launches").select("id").eq("slug", parsed.data.launchSlug).eq("owner_id", user.id).maybeSingle()
  if (!launch) return NextResponse.json({ error: "Launch not found." }, { status: 404 })
  const { data, error } = await admin.from("trust_assessments").insert({ subject_type: parsed.data.subjectType, subject_id: parsed.data.subjectId, launch_id: launch.id, score: assessment.score, level: assessment.level, input_snapshot: parsed.data, signals: assessment.signals }).select("id").single()
  if (error || !data) return NextResponse.json({ error: "Unable to persist trust assessment." }, { status: 500 })
  return NextResponse.json({ ok: true, assessment, assessmentId: data.id })
}
