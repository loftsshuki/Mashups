import { NextResponse } from "next/server"
import { z } from "zod"

import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const obligationSchema = z.object({ action: z.string().trim().min(2).max(160), requiredCount: z.number().int().min(1).max(100), dueAt: z.iso.datetime() })
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("issue"), launchSlug: z.string().trim().min(2).max(100), artistName: z.string().trim().min(2).max(120), organizationId: z.uuid().nullable().optional(), obligations: z.array(obligationSchema).min(1).max(20) }),
  z.object({ action: z.literal("accept"), contractId: z.uuid(), attested: z.literal(true) }),
])

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid artist-participation contract." }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, contractId: "artist-contract-demo", status: parsed.data.action === "accept" ? "accepted" : "offered", demo: true })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Contract storage is unavailable." }, { status: 503 })

  if (parsed.data.action === "accept") {
    const { data: contract } = await admin.from("artist_participation_contracts").select("id,organization_id,status").eq("id", parsed.data.contractId).maybeSingle()
    if (!contract) return NextResponse.json({ error: "Contract not found." }, { status: 404 })
    if (contract.status === "accepted" || contract.status === "completed") return NextResponse.json({ ok: true, contractId: contract.id, status: contract.status })
    if (!contract.organization_id) return NextResponse.json({ error: "This contract has no accepting rightsholder." }, { status: 409 })
    const [{ data: organization }, { data: membership }] = await Promise.all([
      admin.from("rightsholder_organizations").select("owner_id").eq("id", contract.organization_id).maybeSingle(),
      admin.from("rightsholder_members").select("role").eq("organization_id", contract.organization_id).eq("user_id", user.id).maybeSingle(),
    ])
    const authorized = organization?.owner_id === user.id || membership?.role === "owner" || membership?.role === "admin" || membership?.role === "rights"
    if (!authorized) return NextResponse.json({ error: "You cannot accept for this rightsholder." }, { status: 403 })
    const { error } = await admin.from("artist_participation_contracts").update({ status: "accepted", accepted_by: user.id, accepted_at: new Date().toISOString() }).eq("id", contract.id)
    if (error) return NextResponse.json({ error: "Unable to accept artist contract." }, { status: 500 })
    return NextResponse.json({ ok: true, contractId: contract.id, status: "accepted" })
  }

  const { data: launch } = await admin.from("viral_launches").select("id").eq("slug", parsed.data.launchSlug).eq("owner_id", user.id).maybeSingle()
  if (!launch) return NextResponse.json({ error: "Launch not found." }, { status: 404 })
  const { data: contract, error } = await admin.from("artist_participation_contracts").upsert({ launch_id: launch.id, artist_name: parsed.data.artistName, organization_id: parsed.data.organizationId ?? null, status: "offered", terms_snapshot: { obligations: parsed.data.obligations, noUploadAndVanish: true }, offered_by: user.id }, { onConflict: "launch_id" }).select("id").single()
  if (error || !contract) return NextResponse.json({ error: "Unable to issue artist contract." }, { status: 500 })
  const { count } = await admin.from("artist_participation_obligations").select("id", { count: "exact", head: true }).eq("contract_id", contract.id)
  if (!count) {
    const { error: obligationError } = await admin.from("artist_participation_obligations").insert(parsed.data.obligations.map((obligation) => ({ contract_id: contract.id, action: obligation.action, required_count: obligation.requiredCount, due_at: obligation.dueAt, status: "pending" })))
    if (obligationError) return NextResponse.json({ error: "Contract created, but obligations could not be attached." }, { status: 500 })
  }
  return NextResponse.json({ ok: true, contractId: contract.id, status: "offered" }, { status: 201 })
}
