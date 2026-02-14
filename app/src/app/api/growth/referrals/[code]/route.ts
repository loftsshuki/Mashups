import { NextResponse } from "next/server"

import { summarizeReferralInviteRow } from "@/lib/growth/referral-invites"
import { createClient } from "@/lib/supabase/server"

interface ReferralUpdateBody {
  action?: "revoke"
}

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params
    const body = (await request.json()) as ReferralUpdateBody
    if (body.action !== "revoke") {
      return NextResponse.json({ error: "Unsupported referral action." }, { status: 400 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        invite: null,
        revokedAt: new Date().toISOString(),
      })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }

    const revokedAt = new Date().toISOString()
    const { data, error } = await supabase
      .from("referral_invites")
      .update({ expires_at: revokedAt })
      .eq("code", code.trim())
      .eq("user_id", user.id)
      .select(
        "code,campaign_id,creator_tier,destination,max_uses,uses_count,rev_share_bps,expires_at,created_at",
      )
      .limit(1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const row =
      Array.isArray(data) && data.length > 0
        ? (data[0] as Record<string, unknown>)
        : null
    if (!row) {
      return NextResponse.json({ error: "Referral invite not found." }, { status: 404 })
    }

    const invite = summarizeReferralInviteRow(row)
    if (!invite) {
      return NextResponse.json({ error: "Referral invite parse failure." }, { status: 500 })
    }
    return NextResponse.json({ invite, revokedAt })
  } catch {
    return NextResponse.json({ error: "Failed to update referral invite." }, { status: 500 })
  }
}
