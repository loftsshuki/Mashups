import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isAdminUser } from "@/lib/auth/admin"

interface ClaimPatchBody {
  status: "open" | "under_review" | "resolved" | "rejected"
  resolution?: string
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = (await request.json()) as ClaimPatchBody
    if (!body.status) {
      return NextResponse.json({ error: "status is required" }, { status: 400 })
    }

    // Must be signed in. (Previously anyone could resolve/reject any claim.)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Authorize: only the owner of the mashup the claim targets, or an admin, may change it.
    const admin = createAdminClient() ?? supabase
    const { data: claim } = await admin
      .from("claims")
      .select("id, mashup_id")
      .eq("id", id)
      .maybeSingle()
    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 })
    }

    const { data: mashup } = await admin
      .from("mashups")
      .select("creator_id")
      .eq("id", (claim as { mashup_id: string }).mashup_id)
      .maybeSingle()

    const isOwner =
      !!mashup && (mashup as { creator_id: string }).creator_id === user.id
    const isAdmin = isAdminUser({ email: user.email, id: user.id })
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const patch: Record<string, unknown> = {
      status: body.status,
      resolution: body.resolution ?? null,
    }
    if (body.status === "resolved" || body.status === "rejected") {
      patch.resolved_at = new Date().toISOString()
    }

    // Write via the service-role client so the update isn't silently dropped by RLS.
    const { error } = await admin.from("claims").update(patch).eq("id", id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to update claim" }, { status: 500 })
  }
}
