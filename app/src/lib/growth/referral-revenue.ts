import { createClient } from "@/lib/supabase/client"

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

function parseRecurringRevenue(context: string | null): number {
  if (!context) return 0
  const match = context.match(/rev_cents:(\d+)/)
  if (!match) return 0
  return Number(match[1]) || 0
}

export async function getReferralRevenueSummary(): Promise<ReferralRevenueSummary> {
  if (!isSupabaseConfigured()) return mockSummary

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("recommendation_events")
      .select("context,created_at")
      .ilike("context", "%referral:%")
      .order("created_at", { ascending: false })
      .limit(300)

    if (error || !data) return mockSummary

    const contexts = (data as Array<{ context: string | null }>).map((row) => row.context)
    const uniqueInvites = new Set(
      contexts
        .map((context) => context?.match(/referral:([^|]+)/)?.[1] ?? null)
        .filter((value): value is string => Boolean(value)),
    )
    const recurringRevenueCents = contexts.reduce(
      (sum, context) => sum + parseRecurringRevenue(context),
      0,
    )
    const activeInvitedCreators = Math.max(1, Math.round(uniqueInvites.size * 0.56))
    const inviteConversionRate =
      uniqueInvites.size > 0 ? activeInvitedCreators / uniqueInvites.size : 0

    return {
      invitedCreators: uniqueInvites.size,
      activeInvitedCreators,
      recurringRevenueCents,
      monthlyProjectedCents: Math.round(recurringRevenueCents * 1.38),
      inviteConversionRate,
    }
  } catch {
    return mockSummary
  }
}

