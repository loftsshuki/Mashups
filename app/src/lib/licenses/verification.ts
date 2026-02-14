import { createHmac } from "node:crypto"

import { createClient } from "@/lib/supabase/server"

export type LicenseVerificationState = "valid" | "expired" | "revoked" | "not_found"

type LicenseStatus = "active" | "expired" | "revoked" | "unknown"

export interface LicenseVerificationPayload {
  code: string
  state: LicenseVerificationState
  status: LicenseStatus
  licenseType: string | null
  territory: string | null
  startsAt: string | null
  endsAt: string | null
  termDays: number | null
  issuedAt: string | null
  verifiedAt: string
}

export interface LicenseVerificationResult {
  payload: LicenseVerificationPayload
  signature: string
  signatureAlgorithm: "HMAC-SHA256"
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}

function toNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function toDateOrNull(value: string | null): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function normalizeLicenseStatus(value: unknown): LicenseStatus {
  if (value === "active" || value === "expired" || value === "revoked") {
    return value
  }
  return "unknown"
}

function resolveVerificationState(input: {
  status: LicenseStatus
  endsAt: string | null
  now: Date
}): LicenseVerificationState {
  if (input.status === "revoked") return "revoked"
  if (input.status === "expired") return "expired"

  const endsAt = toDateOrNull(input.endsAt)
  if (endsAt && endsAt.getTime() <= input.now.getTime()) {
    return "expired"
  }

  if (input.status === "active") return "valid"
  return "not_found"
}

function getVerificationSecret(): string {
  return (
    process.env.LICENSE_VERIFICATION_SECRET ??
    process.env.ATTRIBUTION_SIGNING_SECRET ??
    "dev-license-verification-secret"
  )
}

function signPayload(payload: LicenseVerificationPayload): string {
  return createHmac("sha256", getVerificationSecret())
    .update(JSON.stringify(payload))
    .digest("base64url")
}

function createSignedResult(payload: LicenseVerificationPayload): LicenseVerificationResult {
  return {
    payload,
    signature: signPayload(payload),
    signatureAlgorithm: "HMAC-SHA256",
  }
}

export function createNotFoundLicenseVerification(
  code: string,
  now = new Date(),
): LicenseVerificationResult {
  return createSignedResult({
    code,
    state: "not_found",
    status: "unknown",
    licenseType: null,
    territory: null,
    startsAt: null,
    endsAt: null,
    termDays: null,
    issuedAt: null,
    verifiedAt: now.toISOString(),
  })
}

function mapRowToVerificationPayload(
  code: string,
  row: Record<string, unknown>,
  now: Date,
): LicenseVerificationPayload {
  const status = normalizeLicenseStatus(row.status)
  const endsAt = toStringOrNull(row.ends_at)
  const state = resolveVerificationState({
    status,
    endsAt,
    now,
  })

  return {
    code: toStringOrNull(row.verification_code) ?? code,
    state,
    status,
    licenseType: toStringOrNull(row.license_type),
    territory: toStringOrNull(row.territory),
    startsAt: toStringOrNull(row.starts_at),
    endsAt,
    termDays: toNumberOrNull(row.term_days),
    issuedAt: toStringOrNull(row.created_at),
    verifiedAt: now.toISOString(),
  }
}

export async function getLicenseVerificationForCode(
  inputCode: string,
  now = new Date(),
): Promise<LicenseVerificationResult> {
  const code = inputCode.trim()
  if (!code) return createNotFoundLicenseVerification(code, now)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("creator_licenses")
    .select("*")
    .eq("verification_code", code)
    .limit(1)

  if (error) {
    throw new Error(error.message)
  }

  const row =
    Array.isArray(data) && data.length > 0
      ? (data[0] as Record<string, unknown>)
      : null
  if (!row) return createNotFoundLicenseVerification(code, now)

  return createSignedResult(mapRowToVerificationPayload(code, row, now))
}
