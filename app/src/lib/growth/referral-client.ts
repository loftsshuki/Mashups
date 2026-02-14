import { normalizeReferralCode } from "@/lib/growth/referral-invites"

const STORAGE_KEY = "mashups.referral_code"

export function readReferralCodeFromSearchParams(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): string | null {
  return normalizeReferralCode(searchParams.get("ref"))
}

export function persistReferralCode(code: string | null): void {
  if (typeof window === "undefined") return
  const normalized = normalizeReferralCode(code)
  if (!normalized) return
  window.localStorage.setItem(STORAGE_KEY, normalized)
}

export function getPersistedReferralCode(): string | null {
  if (typeof window === "undefined") return null
  return normalizeReferralCode(window.localStorage.getItem(STORAGE_KEY))
}

type ReadonlyURLSearchParams = {
  get(name: string): string | null
}
