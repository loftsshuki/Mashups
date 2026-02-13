import { NextResponse } from "next/server"

import { assessRightsRisk, getRightsSafetyAssessment } from "@/lib/data/rights-safety"
import type { RightsMode, RightsStatus } from "@/lib/data/types"

interface RiskRouteBody {
  mashupId?: string
  declarationStatus?: RightsStatus
  declarationMode?: RightsMode
  fingerprintConfidence?: number
  hasActiveLicense?: boolean
  licenseEndsAt?: string | null
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RiskRouteBody
    const hasExplicitRiskInputs = Boolean(
      body.declarationStatus ||
        body.declarationMode ||
        typeof body.fingerprintConfidence === "number" ||
        typeof body.hasActiveLicense === "boolean" ||
        body.licenseEndsAt,
    )

    if (!body.mashupId && !hasExplicitRiskInputs) {
      return NextResponse.json(
        { error: "Provide mashupId or explicit risk inputs." },
        { status: 400 },
      )
    }

    const assessment =
      body.mashupId && !hasExplicitRiskInputs
        ? getRightsSafetyAssessment(body.mashupId)
        : assessRightsRisk({
            mashupId: body.mashupId ?? "adhoc-preview",
            declarationStatus: body.declarationStatus,
            declarationMode: body.declarationMode,
            fingerprintConfidence: body.fingerprintConfidence,
            hasActiveLicense: body.hasActiveLicense,
            licenseEndsAt: body.licenseEndsAt,
          })

    return NextResponse.json({ assessment })
  } catch {
    return NextResponse.json({ error: "Invalid risk route payload." }, { status: 400 })
  }
}

