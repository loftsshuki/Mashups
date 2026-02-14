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
      return NextResponse.json(
        { ...verification, error: "License not found." },
        { status: 404 },
      )
    }

    return NextResponse.json(verification)
  } catch {
    return NextResponse.json(
      { error: "Failed to verify license." },
      { status: 500 },
    )
  }
}
