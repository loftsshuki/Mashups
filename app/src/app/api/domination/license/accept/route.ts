import { NextResponse } from "next/server"
import { z } from "zod"

import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ agreementId: z.string().min(2).max(120), attested: z.literal(true) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "License attestation is required." }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, status: "accepted", verificationCode: "MGL-MV-2026-001", demo: true })
  if (!z.uuid().safeParse(parsed.data.agreementId).success) return NextResponse.json({ error: "Invalid agreement." }, { status: 400 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "License storage is unavailable." }, { status: 503 })
  const { data, error } = await admin.rpc("accept_growth_license", { p_agreement_id: parsed.data.agreementId, p_user_id: user.id })
  if (error) return NextResponse.json({ error: "Unable to accept license." }, { status: 500 })
  if (data !== "accepted" && data !== "already_accepted") return NextResponse.json({ error: `License ${data}.` }, { status: data === "forbidden" ? 403 : 409 })
  const { data: agreement } = await admin.from("growth_license_agreements").select("verification_code").eq("id", parsed.data.agreementId).maybeSingle()
  return NextResponse.json({ ok: true, status: data, verificationCode: agreement?.verification_code ?? null })
}
