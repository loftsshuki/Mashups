import { NextResponse } from "next/server"
import { z } from "zod"

import { isDemoRequest } from "@/lib/demo/runtime"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"

const schema = z.object({ eventType: z.enum(["scan", "save", "share", "join"]), anonymousKey: z.string().min(8).max(120), metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional() })

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid venue event." }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, code, eventType: parsed.data.eventType, demo: true })
  const rate = await consumeRateLimit({ key: resolveRateLimitKey(request, `growth.club.${code}`), limit: 30, windowMs: 60_000 })
  if (!rate.allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Venue activation storage is unavailable." }, { status: 503 })
  const { error } = await admin.rpc("record_club_activation_event", { p_code: code.toUpperCase(), p_event_type: parsed.data.eventType, p_anonymous_key: parsed.data.anonymousKey, p_metadata: parsed.data.metadata ?? {} })
  if (error) return NextResponse.json({ error: "Venue activation is unavailable." }, { status: 404 })
  return NextResponse.json({ ok: true, code, eventType: parsed.data.eventType })
}
