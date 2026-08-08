import { NextResponse } from "next/server"

import { greenEventSchema } from "@/lib/green-room/schemas"
import { recordGreenEvent } from "@/lib/green-room/service"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const rate = await consumeRateLimit({ key: resolveRateLimitKey(request, "green.events"), limit: 120, windowMs: 60_000 })
  // Telemetry must never break the creator experience. Security-sensitive routes still fail closed.
  if (!rate.allowed) return NextResponse.json({ accepted: false, persisted: false, reason: "rate_limited" }, { status: 202 })
  const parsed = greenEventSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid event." }, { status: 400 })
  let userId: string | null = null
  try { const supabase = await createClient(); userId = (await supabase.auth.getUser()).data.user?.id ?? null } catch { /* Anonymous pilot events are valid. */ }
  const persisted = await recordGreenEvent({ ...parsed.data, userId })
  return NextResponse.json({ accepted: true, persisted }, { status: 202 })
}
