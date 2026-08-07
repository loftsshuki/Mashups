import { NextResponse } from "next/server"
import { z } from "zod"

import { isSupabaseConfigured } from "@/lib/config/runtime"
import { isDemoRequest } from "@/lib/demo/runtime"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const forkSchema = z.object({
  parentGenomeId: z.string().min(1).max(100),
  name: z.string().trim().min(3).max(80),
  niche: z.string().trim().min(2).max(40),
  platform: z.enum(["tiktok", "instagram", "youtube"]),
})

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const parsed = forkSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid fork configuration." }, { status: 400 })
  const demo = isDemoRequest(request)
  if (demo) return NextResponse.json({ fork: { id: `demo-fork-${Date.now()}`, ...parsed.data }, demo: true }, { status: 201 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isSupabaseConfigured() || !user) return NextResponse.json({ error: "Sign in to save and publish your fork.", next: `/launches/${slug}` }, { status: 401 })
  const rate = await consumeRateLimit({ key: resolveRateLimitKey(request, "viral.fork", user?.id), limit: 12, windowMs: 60_000 })
  if (!rate.allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Fork storage is not configured." }, { status: 503 })
  const { data: launch } = await admin.from("viral_launches").select("id").eq("slug", slug).eq("is_public", true).maybeSingle()
  if (!launch) return NextResponse.json({ error: "Launch not found." }, { status: 404 })
  const { data: parent } = await admin.from("viral_template_genomes").select("*").eq("id", parsed.data.parentGenomeId).eq("launch_id", launch.id).maybeSingle()
  if (!parent) return NextResponse.json({ error: "Template genome not found." }, { status: 404 })

  const { data: fork, error } = await admin.from("viral_template_genomes").insert({
    launch_id: launch.id,
    parent_id: parent.id,
    creator_id: user!.id,
    name: parsed.data.name,
    platform: parsed.data.platform,
    niche: parsed.data.niche,
    hook_start_sec: parent.hook_start_sec,
    hook_duration_sec: parent.hook_duration_sec,
    opening_frame: parent.opening_frame,
    pattern: parent.pattern,
    text_beats: parent.text_beats,
    shot_count: parent.shot_count,
    status: "draft",
  }).select("id,name,parent_id").single()
  if (error || !fork) return NextResponse.json({ error: "Unable to create fork." }, { status: 500 })
  const { error: counterError } = await admin.rpc("record_viral_genome_fork", { p_launch_id: launch.id, p_genome_id: parent.id })
  if (counterError) {
    await admin.from("viral_template_genomes").delete().eq("id", fork.id)
    return NextResponse.json({ error: "Unable to attach the fork to its lineage." }, { status: 500 })
  }
  return NextResponse.json({ fork }, { status: 201 })
}
