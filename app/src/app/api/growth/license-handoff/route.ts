import { NextResponse } from "next/server"
import { z } from "zod"

import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ launchId: z.string().min(2), genomeId: z.string().min(2), creatorId: z.string().min(2), spendCapCents: z.number().int().min(1000).max(100_000_000), targetMarkets: z.array(z.string().min(2).max(10)).min(1).max(30), organicProof: z.object({ lift: z.number().positive(), qualifiedViews: z.number().int().nonnegative(), saveRate: z.number().min(0).max(1) }) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid paid-media handoff." }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, handoffId: "media-demo-new", consentStatus: "pending", licenseStatus: "pending", demo: true }, { status: 201 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  if (![parsed.data.launchId, parsed.data.genomeId, parsed.data.creatorId].every((value) => z.uuid().safeParse(value).success)) return NextResponse.json({ error: "Invalid resource identifier." }, { status: 400 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "License storage is unavailable." }, { status: 503 })
  const { data: launch } = await admin.from("viral_launches").select("id").eq("id", parsed.data.launchId).eq("owner_id", user.id).maybeSingle()
  if (!launch) return NextResponse.json({ error: "Launch not found." }, { status: 404 })
  const { data, error } = await admin.from("paid_media_handoffs").insert({ launch_id: launch.id, genome_id: parsed.data.genomeId, creator_id: parsed.data.creatorId, requested_by: user.id, organic_proof: parsed.data.organicProof, spend_cap_cents: parsed.data.spendCapCents, target_markets: parsed.data.targetMarkets, terms: { creatorConsentRequired: true, rightsRecheckRequired: true } }).select("id").single()
  if (error || !data) return NextResponse.json({ error: "Unable to create handoff." }, { status: 500 })
  return NextResponse.json({ ok: true, handoffId: data.id, consentStatus: "pending", licenseStatus: "pending" }, { status: 201 })
}
