import { createHash } from "node:crypto"
import { NextResponse } from "next/server"

import { getLicenseVerificationForCode } from "@/lib/licenses/verification"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params
    const verification = await getLicenseVerificationForCode(code)
    if (verification.payload.state === "not_found") {
      return NextResponse.json({ error: "License not found." }, { status: 404 })
    }

    const payload = {
      ...verification.payload,
      certificateVersion: "v2",
    }

    const digest = createHash("sha256").update(JSON.stringify(payload)).digest("hex")
    const generatedAt = new Date().toISOString()

    return NextResponse.json({
      certificateId: `cert_${verification.payload.code}`,
      digest,
      payload,
      signature: verification.signature,
      signatureAlgorithm: verification.signatureAlgorithm,
      generatedAt,
    })
  } catch {
    return NextResponse.json({ error: "Failed to generate certificate." }, { status: 500 })
  }
}

