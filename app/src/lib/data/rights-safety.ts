import type { RightsMode, RightsStatus } from "@/lib/data/types"

export type RightsRiskRoute = "allow" | "review" | "block"

export interface RightsRiskInput {
  mashupId: string
  declarationStatus?: RightsStatus
  declarationMode?: RightsMode
  fingerprintConfidence?: number
  hasActiveLicense?: boolean
  licenseEndsAt?: string | null
  now?: string
}

export interface RightsSafetyAssessment {
  mashupId: string
  declarationStatus: RightsStatus
  declarationMode: RightsMode
  fingerprintConfidence: number
  hasActiveLicense: boolean
  licenseEndsAt: string | null
  score: number
  route: RightsRiskRoute
  reasons: string[]
}

const mockRiskProfiles: Record<string, Omit<RightsRiskInput, "mashupId">> = {
  "mash-001": {
    declarationStatus: "verified",
    declarationMode: "owned",
    fingerprintConfidence: 0.96,
    hasActiveLicense: true,
  },
  "mash-002": {
    declarationStatus: "verified",
    declarationMode: "precleared",
    fingerprintConfidence: 0.9,
    hasActiveLicense: true,
  },
  "mash-003": {
    declarationStatus: "pending",
    declarationMode: "licensed",
    fingerprintConfidence: 0.71,
    hasActiveLicense: true,
    licenseEndsAt: "2026-12-31T23:59:59Z",
  },
  "mash-004": {
    declarationStatus: "pending",
    declarationMode: "licensed",
    fingerprintConfidence: 0.62,
    hasActiveLicense: false,
    licenseEndsAt: "2026-01-31T23:59:59Z",
  },
  "mash-005": {
    declarationStatus: "verified",
    declarationMode: "owned",
    fingerprintConfidence: 0.84,
    hasActiveLicense: true,
  },
  "mash-006": {
    declarationStatus: "pending",
    declarationMode: "precleared",
    fingerprintConfidence: 0.58,
    hasActiveLicense: true,
  },
  "mash-007": {
    declarationStatus: "verified",
    declarationMode: "licensed",
    fingerprintConfidence: 0.81,
    hasActiveLicense: true,
    licenseEndsAt: "2026-08-01T23:59:59Z",
  },
  "mash-008": {
    declarationStatus: "rejected",
    declarationMode: "licensed",
    fingerprintConfidence: 0.44,
    hasActiveLicense: false,
  },
}

const statusWeight: Record<RightsStatus, number> = {
  verified: 54,
  pending: 26,
  rejected: 0,
}

const modeWeight: Record<RightsMode, number> = {
  owned: 20,
  precleared: 15,
  licensed: 10,
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function deterministicFallback(id: string): Omit<RightsRiskInput, "mashupId"> {
  const seed = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const remainder = seed % 3
  const declarationStatus: RightsStatus =
    remainder === 0 ? "verified" : remainder === 1 ? "pending" : "pending"
  const declarationMode: RightsMode =
    seed % 2 === 0 ? "precleared" : seed % 5 === 0 ? "owned" : "licensed"
  const fingerprintConfidence = clamp(0.55 + ((seed % 30) / 100), 0.4, 0.92)
  const hasActiveLicense = declarationMode !== "licensed" || seed % 4 !== 0

  return {
    declarationStatus,
    declarationMode,
    fingerprintConfidence,
    hasActiveLicense,
  }
}

export function assessRightsRisk(input: RightsRiskInput): RightsSafetyAssessment {
  const fallback = deterministicFallback(input.mashupId)
  const declarationStatus = input.declarationStatus ?? fallback.declarationStatus ?? "pending"
  const declarationMode = input.declarationMode ?? fallback.declarationMode ?? "precleared"
  const fingerprintConfidence = clamp(
    input.fingerprintConfidence ?? fallback.fingerprintConfidence ?? 0.65,
    0,
    1,
  )
  const now = input.now ? new Date(input.now) : new Date()
  const licenseEndsAt = input.licenseEndsAt ?? null
  const hasActiveLicense =
    input.hasActiveLicense ??
    (licenseEndsAt
      ? new Date(licenseEndsAt).getTime() > now.getTime()
      : declarationMode !== "licensed")

  let score =
    statusWeight[declarationStatus] +
    modeWeight[declarationMode] +
    Math.round(fingerprintConfidence * 18)

  if (hasActiveLicense) score += 12
  if (declarationMode === "licensed" && !hasActiveLicense) score -= 24
  if (declarationStatus === "rejected") score = Math.min(score, 24)

  score = clamp(score, 0, 100)

  let route: RightsRiskRoute = "review"
  if (declarationStatus === "rejected" || score < 42) {
    route = "block"
  } else if (score >= 76) {
    route = "allow"
  }

  const reasons: string[] = []
  reasons.push(
    declarationStatus === "verified"
      ? "Rights declaration is verified."
      : declarationStatus === "pending"
        ? "Rights declaration is pending review."
        : "Rights declaration is rejected.",
  )
  reasons.push(`Fingerprint confidence ${(fingerprintConfidence * 100).toFixed(0)}%.`)
  if (declarationMode === "licensed") {
    reasons.push(hasActiveLicense ? "Active license window detected." : "No active license window.")
  } else if (declarationMode === "owned") {
    reasons.push("Creator claims full ownership.")
  } else {
    reasons.push("Usage is precleared by rights workflow.")
  }

  return {
    mashupId: input.mashupId,
    declarationStatus,
    declarationMode,
    fingerprintConfidence,
    hasActiveLicense,
    licenseEndsAt,
    score,
    route,
    reasons,
  }
}

export function getRightsSafetyAssessment(mashupId: string): RightsSafetyAssessment {
  const profile = mockRiskProfiles[mashupId] ?? deterministicFallback(mashupId)
  return assessRightsRisk({ mashupId, ...profile })
}

export function isRightsSafe(assessment: RightsSafetyAssessment): boolean {
  return assessment.route === "allow"
}

