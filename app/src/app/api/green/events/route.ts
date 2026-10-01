import { NextResponse } from "next/server"

import { greenEventSchema } from "@/lib/green-room/schemas"
import { recordGreenEvent } from "@/lib/green-room/service"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const rate = await consumeRateLimit({ key: resolveRateLimitKey(request, "green.events"), limit: 120, windowMs: 60_000 })
  // Clients send telemetry asynchronously; delivery failures remain observable.
  if (!rate.allowed) return NextResponse.json(
    { accepted: false, persisted: false, reason: rate.unavailable ? "unavailable" : "rate_limited" },
    { status: rate.unavailable ? 503 : 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
  )
  const parsed = greenEventSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid event." }, { status: 400 })
  let userId: string | null = null
  try { const supabase = await createClient(); userId = (await supabase.auth.getUser()).data.user?.id ?? null } catch { /* Anonymous pilot events are valid. */ }
  const persisted = await recordGreenEvent({ ...parsed.data, userId })
  return NextResponse.json(
    { accepted: persisted, persisted, ...(!persisted ? { reason: "unavailable" } : {}) },
    { status: persisted ? 202 : 503 },
  )
}
