import type { EarningsLedgerEntry } from "@/lib/data/types"

export const DEFAULT_PAYOUT_THRESHOLD_CENTS = 5_000
export const MIN_PAYOUT_THRESHOLD_CENTS = 1_000
export const MAX_PAYOUT_THRESHOLD_CENTS = 500_000

export interface PayoutEligibility {
  thresholdCents: number
  availableCents: number
  pendingCents: number
  shortfallCents: number
  eligible: boolean
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function sanitizeThresholdDollars(raw: string): number {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return DEFAULT_PAYOUT_THRESHOLD_CENTS
  return clamp(
    Math.round(parsed * 100),
    MIN_PAYOUT_THRESHOLD_CENTS,
    MAX_PAYOUT_THRESHOLD_CENTS,
  )
}

export function getPayoutEligibility(
  entries: EarningsLedgerEntry[],
  thresholdCents = DEFAULT_PAYOUT_THRESHOLD_CENTS,
): PayoutEligibility {
  const normalizedThreshold = clamp(
    Math.round(thresholdCents),
    MIN_PAYOUT_THRESHOLD_CENTS,
    MAX_PAYOUT_THRESHOLD_CENTS,
  )

  let availableCents = 0
  let pendingCents = 0
  for (const entry of entries) {
    if (entry.status === "available") {
      availableCents += entry.amount_cents
    } else if (entry.status === "pending") {
      pendingCents += entry.amount_cents
    }
  }

  return {
    thresholdCents: normalizedThreshold,
    availableCents,
    pendingCents,
    shortfallCents: Math.max(0, normalizedThreshold - availableCents),
    eligible: availableCents >= normalizedThreshold,
  }
}

