export type ReferralInviteState = "active" | "expiring_soon" | "exhausted" | "expired"
export type ReferralInviteTier = "large" | "medium" | "emerging"

const EXPIRING_SOON_WINDOW_MS = 48 * 60 * 60 * 1000
const FALLBACK_ORIGIN = "http://localhost:3000"

export interface ReferralInviteSummary {
  code: string
  campaignId: string
  creatorTier: ReferralInviteTier
  destination: string
  maxUses: number
  usesCount: number
  usesRemaining: number
  revSharePercent: number
  expiresAt: string | null
  createdAt: string
  state: ReferralInviteState
}

function toNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function normalizeCreatorTier(value: unknown): ReferralInviteTier {
  if (value === "large" || value === "medium" || value === "emerging") {
    return value
  }
  return "emerging"
}

function buildUrl(input: string): URL | null {
  try {
    return new URL(input)
  } catch {
    try {
      return new URL(input, FALLBACK_ORIGIN)
    } catch {
      return null
    }
  }
}

export function normalizeReferralCode(value: string | null | undefined): string | null {
  if (!value) return null
  const normalized = value.trim()
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(normalized)) {
    return null
  }
  return normalized
}

export function resolveReferralInviteState(input: {
  usesCount: number
  maxUses: number
  expiresAt: string | null
  now?: Date
}): ReferralInviteState {
  const now = input.now ?? new Date()
  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null
  const isExpired =
    expiresAt && !Number.isNaN(expiresAt.getTime())
      ? expiresAt.getTime() <= now.getTime()
      : false

  if (isExpired) return "expired"
  if (input.maxUses > 0 && input.usesCount >= input.maxUses) return "exhausted"
  if (
    expiresAt &&
    !Number.isNaN(expiresAt.getTime()) &&
    expiresAt.getTime() - now.getTime() <= EXPIRING_SOON_WINDOW_MS
  ) {
    return "expiring_soon"
  }
  return "active"
}

export function isReferralInviteRedeemable(state: ReferralInviteState): boolean {
  return state === "active" || state === "expiring_soon"
}

export function summarizeReferralInviteRow(
  row: Record<string, unknown>,
  now = new Date(),
): ReferralInviteSummary | null {
  const code = normalizeReferralCode(toString(row.code))
  if (!code) return null

  const maxUses = Math.max(1, Math.round(toNumber(row.max_uses, 10)))
  const usesCount = Math.max(0, Math.round(toNumber(row.uses_count, 0)))
  const expiresAt = toString(row.expires_at) || null
  const state = resolveReferralInviteState({ usesCount, maxUses, expiresAt, now })

  return {
    code,
    campaignId: toString(row.campaign_id, "unknown-campaign"),
    creatorTier: normalizeCreatorTier(row.creator_tier),
    destination: toString(row.destination, "/signup"),
    maxUses,
    usesCount,
    usesRemaining: Math.max(0, maxUses - usesCount),
    revSharePercent: Math.max(0, toNumber(row.rev_share_bps, 1200) / 100),
    expiresAt,
    createdAt: toString(row.created_at, now.toISOString()),
    state,
  }
}

export function extractReferralCodeFromUrl(value: string): string | null {
  const url = buildUrl(value)
  if (!url) return null
  return normalizeReferralCode(url.searchParams.get("ref"))
}

export function stripReferralCodeFromUrl(value: string): string {
  const url = buildUrl(value)
  if (!url) return value

  url.searchParams.delete("ref")

  const isAbsoluteInput = /^https?:\/\//i.test(value)
  if (isAbsoluteInput) return url.toString()

  const query = url.search ? url.search : ""
  const hash = url.hash ? url.hash : ""
  return `${url.pathname}${query}${hash}`
}
