import { NextResponse } from "next/server"
import { z } from "zod"

import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ launchSlug: z.string().min(2).max(100), genomeId: z.string().min(2).max(100), confidence: z.number().int().min(1).max(100) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid prediction." }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, reputation: 824, potentialPoints: parsed.data.confidence * 2, demo: true })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Sign in to stake your reputation." }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Prediction storage is unavailable." }, { status: 503 })
  const { data: launch } = await admin.from("viral_launches").select("id").eq("slug", parsed.data.launchSlug).eq("is_public", true).maybeSingle()
  if (!launch || !z.uuid().safeParse(parsed.data.genomeId).success) return NextResponse.json({ error: "Launch or genome not found." }, { status: 404 })
  const { error } = await admin.from("viral_predictions").upsert({ launch_id: launch.id, genome_id: parsed.data.genomeId, user_id: user.id, confidence: parsed.data.confidence, outcome: "pending" }, { onConflict: "launch_id,user_id" })
  if (error) return NextResponse.json({ error: "Unable to record prediction." }, { status: 500 })
  return NextResponse.json({ ok: true, potentialPoints: parsed.data.confidence * 2 })
}
