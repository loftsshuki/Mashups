import { createHash } from "node:crypto"
import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params
    const supabase = await createClient()

    const { data } = await supabase
      .from("creator_licenses")
      .select("*")
      .eq("verification_code", code)
      .single()

    if (!data) {
      return NextResponse.json({ error: "License not found." }, { status: 404 })
    }

    const payload = {
      code,
      status: data.status,
      licenseType: data.license_type,
      territory: data.territory,
      startsAt: data.starts_at,
      endsAt: data.ends_at,
      issuedAt: data.created_at,
    }

    const digest = createHash("sha256").update(JSON.stringify(payload)).digest("hex")

    return NextResponse.json({
      certificateId: `cert_${code}`,
      digest,
      payload,
      generatedAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: "Failed to generate certificate." }, { status: 500 })
  }
}

