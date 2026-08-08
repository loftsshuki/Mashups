import { NextResponse } from "next/server"
import { z } from "zod"

import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ provider: z.enum(["linkfire", "featurefm", "distributor", "ad_platform"]), organizationId: z.uuid().nullable().optional(), capabilities: z.array(z.string().trim().min(2).max(80)).max(30), settings: z.record(z.string(), z.unknown()).default({}), credentialReference: z.string().trim().min(3).max(500).optional() })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid partner integration." }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, integrationId: "integration-demo", status: "connected", demo: true })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Partner integration storage is unavailable." }, { status: 503 })
  if (parsed.data.organizationId) {
    const [{ data: organization }, { data: membership }] = await Promise.all([
      admin.from("rightsholder_organizations").select("owner_id").eq("id", parsed.data.organizationId).maybeSingle(),
      admin.from("rightsholder_members").select("role").eq("organization_id", parsed.data.organizationId).eq("user_id", user.id).maybeSingle(),
    ])
    const authorized = organization?.owner_id === user.id || membership?.role === "owner" || membership?.role === "admin" || membership?.role === "rights"
    if (!authorized) return NextResponse.json({ error: "You cannot configure integrations for this rightsholder." }, { status: 403 })
  }
  const { data, error } = await admin.from("partner_integrations").upsert({ owner_id: user.id, organization_id: parsed.data.organizationId ?? null, provider: parsed.data.provider, status: "connected", encrypted_credentials: parsed.data.credentialReference ?? null, capabilities: parsed.data.capabilities, settings: parsed.data.settings, updated_at: new Date().toISOString() }, { onConflict: "owner_id,provider" }).select("id,status").single()
  if (error || !data) return NextResponse.json({ error: "Unable to configure partner integration." }, { status: 500 })
  return NextResponse.json({ ok: true, integrationId: data.id, status: data.status })
}
