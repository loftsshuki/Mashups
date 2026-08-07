import { NextResponse } from "next/server"
import { z } from "zod"

import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ stage: z.enum(["research", "qualified", "contacted", "replied", "meeting", "pilot", "won", "lost"]), nextAction: z.string().trim().max(500).nullable().optional() })

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const [{ id }, body] = await Promise.all([params, request.json().catch(() => null)]); const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid pipeline update." }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, prospectId: id, stage: parsed.data.stage, demo: true })
  if (!z.uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid prospect." }, { status: 400 })
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 })
  const admin = createAdminClient(); if (!admin) return NextResponse.json({ error: "Outreach storage is unavailable." }, { status: 503 })
  const { data, error } = await admin.from("outreach_prospects").update({ stage: parsed.data.stage, next_action: parsed.data.nextAction ?? null, updated_at: new Date().toISOString() }).eq("id", id).eq("owner_id", user.id).select("id").maybeSingle()
  if (error || !data) return NextResponse.json({ error: "Prospect not found." }, { status: 404 })
  await admin.from("outreach_activities").insert({ prospect_id: id, owner_id: user.id, activity_type: "stage_change", summary: `Moved to ${parsed.data.stage}`, metadata: { nextAction: parsed.data.nextAction ?? null } })
  return NextResponse.json({ ok: true, prospectId: id, stage: parsed.data.stage })
}
