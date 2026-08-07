import { NextResponse } from "next/server"
import { z } from "zod"

import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ launchSlug: z.string().min(2).max(100), creatorTestFloor: z.number().int().min(10).max(10_000), qualifiedPostFloor: z.number().int().min(1).max(10_000), hookGenomeFloor: z.number().int().min(1).max(20).default(3), reportDueDays: z.number().int().min(1).max(90).default(14) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid guaranteed-launch configuration." }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, programId: "guarantee-demo", status: "active", demo: true })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Guarantee storage is unavailable." }, { status: 503 })
  const { data: launch } = await admin.from("viral_launches").select("id").eq("slug", parsed.data.launchSlug).eq("owner_id", user.id).maybeSingle()
  if (!launch) return NextResponse.json({ error: "Launch not found." }, { status: 404 })
  const { data, error } = await admin.from("guaranteed_launch_programs").upsert({ launch_id: launch.id, owner_id: user.id, creator_test_floor: parsed.data.creatorTestFloor, qualified_post_floor: parsed.data.qualifiedPostFloor, hook_genome_floor: parsed.data.hookGenomeFloor, report_due_days: parsed.data.reportDueDays, status: "active", deliverables: ["creator test volume", "qualified post floor", "rights proof", "incremental lift report"], activated_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: "launch_id" }).select("id").single()
  if (error || !data) return NextResponse.json({ error: "Unable to activate guaranteed launch." }, { status: 500 })
  return NextResponse.json({ ok: true, programId: data.id, status: "active" })
}
