import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    const supabase = await createClient()
    const patch: Record<string, unknown> = {
      status: body.status,
      resolution: body.resolution ?? null,
    }
    if (body.status === "resolved" || body.status === "rejected") {
      patch.resolved_at = new Date().toISOString()
    }

    const { error } = await supabase.from("claims").update(patch).eq("id", id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to update claim" }, { status: 500 })
  }
}
