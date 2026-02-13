import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface LicenseIssueBody {
  mashupId?: string
  licenseType: "organic_shorts" | "paid_ads_shorts"
  territory?: string
  termDays?: number
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LicenseIssueBody
    if (!body.licenseType) {
      return NextResponse.json({ error: "licenseType is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const startsAt = new Date()
    const termDays = body.termDays ?? 365
    const endsAt = new Date(startsAt.getTime() + termDays * 24 * 60 * 60 * 1000)
    const code = `lic_${randomUUID().replace(/-/g, "").slice(0, 18)}`

    const { error } = await supabase.from("creator_licenses").insert({
      user_id: user.id,
      mashup_id: body.mashupId ?? null,
      license_type: body.licenseType,
      territory: body.territory ?? "US",
      term_days: termDays,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "active",
      verification_code: code,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    return NextResponse.json({
      verificationCode: code,
      verificationUrl: `${appUrl}/licenses/${code}`,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    })
  } catch {
    return NextResponse.json({ error: "Failed to issue license" }, { status: 500 })
  }
}
