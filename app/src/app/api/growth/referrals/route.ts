import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

import { signAttributionLink } from "@/lib/attribution/signing"
import { createClient } from "@/lib/supabase/server"

type CreatorTier = "large" | "medium" | "emerging"

interface ReferralBody {
  campaignId?: string
  creatorTier?: CreatorTier
  destination?: string
  maxUses?: number
  revShareBps?: number
}

const defaultMaxUses: Record<CreatorTier, number> = {
  large: 50,
  medium: 25,
  emerging: 10,
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReferralBody
    if (!body.campaignId || !body.creatorTier || !body.destination) {
      return NextResponse.json(
        { error: "campaignId, creatorTier, and destination are required." },
        { status: 400 },
      )
    }

    const code = `${body.creatorTier.slice(0, 3)}_${randomUUID().replace(/-/g, "").slice(0, 10)}`
    const destination = (() => {
      try {
        const url = new URL(body.destination)
        url.searchParams.set("ref", code)
        url.searchParams.set("tier", body.creatorTier)
        url.searchParams.set("utm_source", "mashups_referral")
        url.searchParams.set("utm_medium", "creator_invite")
        url.searchParams.set("utm_campaign", body.campaignId)
        return url.toString()
      } catch {
        return body.destination
      }
    })()

    const token = signAttributionLink({
      campaignId: body.campaignId,
      creatorId: `cohort_${body.creatorTier}_${code}`,
      destination,
      issuedAt: Date.now(),
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const inviteUrl = `${appUrl}/a/${token}`
    const maxUses = body.maxUses ?? defaultMaxUses[body.creatorTier]
    const revShareBps = Math.min(3000, Math.max(300, body.revShareBps ?? 1200))
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

    try {
      const supabase = await createClient()
      await supabase.from("recommendation_events").insert({
        user_id: null,
        mashup_id: null,
        event_type: "share",
        context: `referral:${code}|tier:${body.creatorTier}|campaign:${body.campaignId}|max_uses:${maxUses}|rev_share_bps:${revShareBps}|rev_cents:${Math.round(maxUses * 240)}`,
      })
    } catch {
      // Non-blocking analytics insert.
    }

    return NextResponse.json({
      code,
      inviteUrl,
      expiresAt,
      maxUses,
      tier: body.creatorTier,
      revSharePercent: revShareBps / 100,
    })
  } catch {
    return NextResponse.json({ error: "Invalid referral payload." }, { status: 400 })
  }
}
