import { createClient } from "@/lib/supabase/client"
import { summarizeReferralRevenueRows } from "@/lib/growth/referral-summary"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export interface ReferralRevenueSummary {
  invitedCreators: number
  activeInvitedCreators: number
  recurringRevenueCents: number
  monthlyProjectedCents: number
  inviteConversionRate: number
}

const mockSummary: ReferralRevenueSummary = {
  invitedCreators: 34,
  activeInvitedCreators: 19,
  recurringRevenueCents: 18_420,
  monthlyProjectedCents: 26_300,
  inviteConversionRate: 0.41,
}

export async function getReferralRevenueSummary(): Promise<ReferralRevenueSummary> {
  if (!isSupabaseConfigured()) return mockSummary

  try {
    const supabase = createClient()
    const [invitesResponse, eventsResponse] = await Promise.all([
      supabase
        .from("referral_invites")
        .select("code,created_at")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("referral_revenue_events")
        .select("referral_code,revenue_share_cents,status,created_at")
        .order("created_at", { ascending: false })
        .limit(1000),
    ])

    if (
      invitesResponse.error ||
      eventsResponse.error ||
      !invitesResponse.data ||
      !eventsResponse.data
    ) {
      return mockSummary
    }

    return summarizeReferralRevenueRows(
      (invitesResponse.data as Record<string, unknown>[])
        .map((row) => ({
          code: typeof row.code === "string" ? row.code : "",
        }))
        .filter((row) => Boolean(row.code)),
      (eventsResponse.data as Record<string, unknown>[]).map((row) => ({
        referralCode: typeof row.referral_code === "string" ? row.referral_code : null,
        revenueShareCents:
          typeof row.revenue_share_cents === "number" ? row.revenue_share_cents : 0,
        status: typeof row.status === "string" ? row.status : "pending",
      })),
    )
  } catch {
    return mockSummary
  }
}
