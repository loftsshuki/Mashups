import { NextResponse } from "next/server"
import { verifyAttributionToken } from "@/lib/attribution/signing"
import {
  extractReferralCodeFromUrl,
  isReferralInviteRedeemable,
  stripReferralCodeFromUrl,
  summarizeReferralInviteRow,
} from "@/lib/growth/referral-invites"
import { createClient } from "@/lib/supabase/server"

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

function toRedirectUrl(destination: string): URL {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  try {
    return new URL(destination)
  } catch {
    return new URL(destination, base)
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  const payload = verifyAttributionToken(token)
  if (!payload) {
    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"))
  }

  let destination = payload.destination
  const referralCode = extractReferralCodeFromUrl(destination)
  let referralState: string | null = null

  try {
    const supabase = await createClient()
    if (referralCode && isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("referral_invites")
        .select("code,campaign_id,creator_tier,destination,max_uses,uses_count,rev_share_bps,expires_at,created_at")
        .eq("code", referralCode)
        .limit(1)

      if (!error) {
        const row =
          Array.isArray(data) && data.length > 0
            ? (data[0] as Record<string, unknown>)
            : null
        const invite = row ? summarizeReferralInviteRow(row) : null

        if (!invite || !isReferralInviteRedeemable(invite.state)) {
          referralState = invite?.state ?? "not_found"
          destination = stripReferralCodeFromUrl(destination)
        } else {
          referralState = invite.state
          await supabase
            .from("referral_invites")
            .update({ uses_count: invite.usesCount + 1 })
            .eq("code", invite.code)
        }
      }
    }

    await supabase.from("recommendation_events").insert({
      user_id: null,
      mashup_id: null,
      event_type: "open",
      context: `campaign:${payload.campaignId}|creator:${payload.creatorId}|ref:${referralCode ?? "none"}|state:${referralState ?? "n/a"}`,
    })
  } catch {
    // Non-blocking attribution logging
  }

  return NextResponse.redirect(toRedirectUrl(destination))
}
