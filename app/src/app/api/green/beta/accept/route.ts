import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"

import { GREEN_BETA_COOKIE, signBetaAccess } from "@/lib/green-room/beta"
import { hashBetaCode } from "@/lib/green-room/service"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"

const schema = z.object({ code: z.string().trim().min(8).max(80) })

export async function POST(request: Request) {
  const rate = await consumeRateLimit({ key: resolveRateLimitKey(request, "green.beta"), limit: 10, windowMs: 60_000 })
  if (!rate.allowed) return NextResponse.json({ error: "Too many attempts." }, { status: 429 })
  const secret = process.env.GREEN_ROOM_BETA_SECRET
  const admin = createAdminClient()
  if (!secret || !admin) return NextResponse.json({ error: "Beta access is not configured." }, { status: 503 })
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid invite code." }, { status: 400 })
  const { data: invite } = await admin.from("green_beta_invites").select("id,use_count,max_uses,expires_at").eq("code_hash", hashBetaCode(parsed.data.code)).maybeSingle()
  if (!invite || invite.use_count >= invite.max_uses || (invite.expires_at && Date.parse(invite.expires_at) <= Date.now())) return NextResponse.json({ error: "This invite is invalid or expired." }, { status: 403 })
  const { data: claimed, error } = await admin.from("green_beta_invites").update({ use_count: invite.use_count + 1 }).eq("id", invite.id).eq("use_count", invite.use_count).select("id").maybeSingle()
  if (error || !claimed) return NextResponse.json({ error: "This invite was claimed by another session." }, { status: 409 })
  const store = await cookies()
  store.set(GREEN_BETA_COOKIE, signBetaAccess(invite.id, secret), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 90 })
  return NextResponse.json({ ok: true, next: "/create" })
}
