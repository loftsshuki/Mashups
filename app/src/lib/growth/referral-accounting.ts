export const DEFAULT_REFERRAL_REV_SHARE_BPS = 1200
const MIN_REFERRAL_REV_SHARE_BPS = 300
const MAX_REFERRAL_REV_SHARE_BPS = 3000

export function clampReferralRevShareBps(value?: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_REFERRAL_REV_SHARE_BPS
  }
  return Math.min(
    MAX_REFERRAL_REV_SHARE_BPS,
    Math.max(MIN_REFERRAL_REV_SHARE_BPS, Math.round(value)),
  )
}

export function computeReferralRevenueShareCents(
  amountCents: number,
  revShareBps: number,
): number {
  const normalizedAmount = Math.max(0, Math.round(amountCents))
  const normalizedBps = clampReferralRevShareBps(revShareBps)
  return Math.round((normalizedAmount * normalizedBps) / 10_000)
}

export function shouldCountReferralConversion(eventType?: string): boolean {
  if (!eventType) return false
  return (
    eventType === "checkout.session.completed" ||
    eventType === "invoice.paid" ||
    eventType === "payment_intent.succeeded"
  )
}
