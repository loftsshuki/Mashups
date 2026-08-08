import { randomBytes } from "node:crypto"
import { NextResponse } from "next/server"
import { z } from "zod"

import { isAdminUser } from "@/lib/auth/admin"
import { hashBetaCode } from "@/lib/green-room/service"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ email: z.email().nullable().optional(), cohort: z.string().trim().min(2).max(50).default("founding"), maxUses: z.number().int().min(1).max(100).default(1), expiresAt: z.iso.datetime().nullable().optional() })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser({ email: user?.email, id: user?.id })) return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  const parsed = schema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: "Invalid invite request." }, { status: 400 })
  const admin = createAdminClient()
  if (!admin || !user) return NextResponse.json({ error: "Storage unavailable." }, { status: 503 })
  const code = `MX-${randomBytes(12).toString("base64url")}`
  const { data, error } = await admin.from("green_beta_invites").insert({ code_hash: hashBetaCode(code), email: parsed.data.email ?? null, cohort: parsed.data.cohort, max_uses: parsed.data.maxUses, expires_at: parsed.data.expiresAt ?? null, created_by: user.id }).select("id").single()
  if (error || !data) return NextResponse.json({ error: "Unable to create invite." }, { status: 500 })
  return NextResponse.json({ id: data.id, code, warning: "This plaintext code is returned once and is not stored." }, { status: 201 })
}
