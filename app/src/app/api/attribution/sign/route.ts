import { NextResponse } from "next/server"
import { signAttributionLink } from "@/lib/attribution/signing"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createClient } from "@/lib/supabase/server"

interface SignBody {
  campaignId: string
  creatorId: string
  destination: string
  source?: string
}

export async function POST(request: Request) {
  try {
    const rate = consumeRateLimit({
      key: resolveRateLimitKey(request, "attribution.sign"),
      limit: 60,
      windowMs: 60_000,
    })
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
      )
    }

    // Require authentication — this endpoint signs platform-domain redirect links,
    // so leaving it open is an open-redirect / phishing vector.
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = (await request.json()) as SignBody
    if (!body.campaignId || !body.creatorId || !body.destination) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const destinationWithSource = (() => {
      try {
        const url = new URL(body.destination)
        url.searchParams.set("utm_source", body.source ?? "mashups_signature")
        url.searchParams.set("utm_medium", "creator_campaign")
        url.searchParams.set("utm_campaign", body.campaignId)
        return url.toString()
      } catch {
        return body.destination
      }
    })()

    const token = signAttributionLink({
      campaignId: body.campaignId,
      creatorId: body.creatorId,
      destination: destinationWithSource,
      issuedAt: Date.now(),
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    return NextResponse.json({
      token,
      url: `${appUrl}/a/${token}`,
    })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
