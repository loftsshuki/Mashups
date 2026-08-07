import { NextResponse } from "next/server"
import { z } from "zod"

import { isSupabaseConfigured } from "@/lib/config/runtime"
import { isDemoRequest } from "@/lib/demo/runtime"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { ViralEventType } from "@/lib/viral/types"

const eventSchema = z.object({
  eventType: z.enum(["page_view", "save_click", "share_intent", "template_start", "squad_join", "vote", "follow_click", "qualified_post"]),
  genomeId: z.string().min(1).max(100).nullable().optional(),
  anonymousKey: z.string().trim().min(8).max(120),
  platform: z.enum(["tiktok", "instagram", "youtube", "spotify", "apple"]).nullable().optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
})

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const parsed = eventSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid viral event." }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, eventType: parsed.data.eventType, demo: true })
  if (parsed.data.genomeId && !z.uuid().safeParse(parsed.data.genomeId).success) {
    return NextResponse.json({ error: "Invalid template genome identifier." }, { status: 400 })
  }
  const rate = await consumeRateLimit({ key: resolveRateLimitKey(request, `viral.event.${parsed.data.eventType}`), limit: 40, windowMs: 60_000 })
  if (!rate.allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Viral event storage is not configured." }, { status: 503 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Viral event storage is not configured." }, { status: 503 })
  const { data: launch } = await admin.from("viral_launches").select("id").eq("slug", slug).eq("is_public", true).maybeSingle()
  if (!launch) return NextResponse.json({ error: "Launch not found." }, { status: 404 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await admin.rpc("record_viral_event", {
    p_launch_id: launch.id,
    p_event_type: parsed.data.eventType as ViralEventType,
    p_anonymous_key: parsed.data.anonymousKey,
    p_genome_id: parsed.data.genomeId ?? null,
    p_creator_id: user?.id ?? null,
    p_platform: parsed.data.platform ?? null,
    p_metadata: parsed.data.metadata ?? {},
  })
  if (error) return NextResponse.json({ error: "Unable to record event." }, { status: 500 })
  return NextResponse.json({ ok: true, eventType: parsed.data.eventType })
}
