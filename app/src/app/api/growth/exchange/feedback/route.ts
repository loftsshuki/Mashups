import { NextResponse } from "next/server"
import { z } from "zod"

import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ roomId: z.string().min(2), breakoutConfidence: z.number().int().min(1).max(100), strongestTimestampSec: z.number().int().min(0).max(3600), feedback: z.string().trim().min(10).max(1000), ndaAccepted: z.literal(true) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Complete the embargo agreement and feedback." }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, sealed: true, reputationAtStake: parsed.data.breakoutConfidence, demo: true }, { status: 201 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !z.uuid().safeParse(parsed.data.roomId).success) return NextResponse.json({ error: "An accepted room invitation is required." }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Exchange storage is unavailable." }, { status: 503 })
  const { data: member } = await admin.from("pre_release_members").select("access_status,nda_accepted_at").eq("room_id", parsed.data.roomId).eq("user_id", user.id).maybeSingle()
  if (!member || member.access_status !== "accepted") return NextResponse.json({ error: "This room is invitation-only." }, { status: 403 })
  if (!member.nda_accepted_at) await admin.from("pre_release_members").update({ nda_accepted_at: new Date().toISOString() }).eq("room_id", parsed.data.roomId).eq("user_id", user.id)
  const { error } = await admin.from("pre_release_feedback").upsert({ room_id: parsed.data.roomId, user_id: user.id, breakout_confidence: parsed.data.breakoutConfidence, strongest_timestamp_sec: parsed.data.strongestTimestampSec, feedback: parsed.data.feedback }, { onConflict: "room_id,user_id" })
  if (error) return NextResponse.json({ error: "Unable to seal feedback." }, { status: 500 })
  return NextResponse.json({ ok: true, sealed: true, reputationAtStake: parsed.data.breakoutConfidence }, { status: 201 })
}
