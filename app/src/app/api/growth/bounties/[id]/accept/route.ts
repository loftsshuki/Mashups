import { NextResponse } from "next/server"
import { z } from "zod"

import { isDemoRequest } from "@/lib/demo/runtime"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, status: "accepted", offerId: id, demo: true })
  if (!z.uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid bounty offer." }, { status: 400 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Sign in to accept this bounty." }, { status: 401 })
  const rate = await consumeRateLimit({ key: resolveRateLimitKey(request, "growth.bounty.accept", user.id), limit: 12, windowMs: 60_000 })
  if (!rate.allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Bounty storage is unavailable." }, { status: 503 })
  const { data, error } = await admin.rpc("accept_dynamic_bounty", { p_offer_id: id, p_creator_id: user.id })
  if (error) return NextResponse.json({ error: "Unable to accept bounty." }, { status: 500 })
  if (data === "unavailable") return NextResponse.json({ error: "This bounty is no longer available." }, { status: 409 })
  return NextResponse.json({ ok: true, status: data, offerId: id })
}
