import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { isAdminUser } from "@/lib/auth/admin"
import { createClient } from "@/lib/supabase/server"

const MAX_TERM_DAYS = 365

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

    if (body.licenseType !== "organic_shorts" && body.licenseType !== "paid_ads_shorts") {
      return NextResponse.json({ error: "Unknown licenseType" }, { status: 400 })
    }

    // Paid-ads licenses are a paid product: they must not be self-issued for free.
    // Only staff may issue them manually; customer issuance belongs in the
    // payment flow (checkout -> webhook).
    if (
      body.licenseType === "paid_ads_shorts" &&
      !isAdminUser({ email: user.email, id: user.id })
    ) {
      return NextResponse.json(
        { error: "Paid ad licenses must be purchased." },
        { status: 403 },
      )
    }

    const startsAt = new Date()
    // Clamp the term — previously any caller could request an arbitrary duration.
    const requestedTerm = Math.floor(Number(body.termDays ?? MAX_TERM_DAYS))
    const termDays = Number.isFinite(requestedTerm)
      ? Math.min(Math.max(requestedTerm, 1), MAX_TERM_DAYS)
      : MAX_TERM_DAYS
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
      certificateUrl: `${appUrl}/api/licenses/certificate/${code}`,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    })
  } catch {
    return NextResponse.json({ error: "Failed to issue license" }, { status: 500 })
  }
}
