export interface ReferralSummaryInviteRow {
  code: string
}

export interface ReferralSummaryRevenueEventRow {
  referralCode: string | null
  revenueShareCents: number
  status: "pending" | "recorded" | "paid" | "failed" | string
}

export interface ReferralSummaryResult {
  invitedCreators: number
  activeInvitedCreators: number
  recurringRevenueCents: number
  monthlyProjectedCents: number
  inviteConversionRate: number
}

export function summarizeReferralRevenueRows(
  invites: ReferralSummaryInviteRow[],
  events: ReferralSummaryRevenueEventRow[],
): ReferralSummaryResult {
  const uniqueInviteCodes = new Set(
    invites
      .map((entry) => entry.code.trim())
      .filter(Boolean),
  )
  const activeCodes = new Set<string>()

  let recurringRevenueCents = 0
  for (const event of events) {
    const normalizedCode = event.referralCode?.trim()
    if (normalizedCode) activeCodes.add(normalizedCode)
    if (event.status === "recorded" || event.status === "paid") {
      recurringRevenueCents += Math.max(0, Math.round(event.revenueShareCents))
    }
  }

  const invitedCreators = uniqueInviteCodes.size
  const activeInvitedCreators = Array.from(activeCodes).filter((code) =>
    uniqueInviteCodes.has(code),
  ).length
  const inviteConversionRate =
    invitedCreators > 0 ? activeInvitedCreators / invitedCreators : 0

  return {
    invitedCreators,
    activeInvitedCreators,
    recurringRevenueCents,
    monthlyProjectedCents: Math.round(recurringRevenueCents * 1.38),
    inviteConversionRate,
  }
}
