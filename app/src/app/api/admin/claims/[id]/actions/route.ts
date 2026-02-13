import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isAdminEmail } from "@/lib/auth/admin"

interface ClaimActionBody {
  status: "open" | "under_review" | "resolved" | "rejected"
  resolution?: string
  enforcementAction?: "block" | "mute" | "geo_restrict" | "restore"
  strikeUserId?: string
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    return NextResponse.json(
      { error: "Admin client unavailable. Configure SUPABASE_SERVICE_ROLE_KEY." },
      { status: 500 },
    )
  }

  try {
    const { id } = await params
    const body = (await request.json()) as ClaimActionBody

    const patch: Record<string, unknown> = {
      status: body.status,
      resolution: body.resolution ?? null,
    }
    if (body.status === "resolved" || body.status === "rejected") {
      patch.resolved_at = new Date().toISOString()
    }

    const { error: updateError } = await adminClient
      .from("claims")
      .update(patch)
      .eq("id", id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    if (body.enforcementAction) {
      const { error: actionError } = await adminClient
        .from("enforcement_actions")
        .insert({
          claim_id: id,
          actor_id: user?.id ?? null,
          action: body.enforcementAction,
          reason: body.resolution ?? "Admin moderation action",
        })

      if (actionError) {
        return NextResponse.json({ error: actionError.message }, { status: 400 })
      }
    }

    if (body.strikeUserId) {
      const { data: strikeRows } = await adminClient
        .from("repeat_infringer_events")
        .select("strike_count")
        .eq("user_id", body.strikeUserId)
        .order("created_at", { ascending: false })
        .limit(1)

      const nextStrike = (strikeRows?.[0]?.strike_count ?? 0) + 1
      await adminClient.from("repeat_infringer_events").insert({
        user_id: body.strikeUserId,
        claim_id: id,
        strike_count: nextStrike,
        action_taken: body.enforcementAction ?? "warning",
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
