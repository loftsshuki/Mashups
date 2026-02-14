import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

import { signAttributionLink } from "@/lib/attribution/signing"
import { writeAuditEvent } from "@/lib/data/audit-log"
import { clampReferralRevShareBps } from "@/lib/growth/referral-accounting"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
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

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReferralBody
    if (!body.campaignId || !body.creatorTier || !body.destination) {
      return NextResponse.json(
        { error: "campaignId, creatorTier, and destination are required." },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (isSupabaseConfigured() && !user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }
    const rate = consumeRateLimit({
      key: resolveRateLimitKey(request, "referrals", user?.id ?? null),
      limit: 20,
      windowMs: 60_000,
    })
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
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
    const maxUses = Math.max(
      1,
      Math.min(500, body.maxUses ?? defaultMaxUses[body.creatorTier]),
    )
    const revShareBps = clampReferralRevShareBps(body.revShareBps)
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

    try {
      const { error } = await supabase.from("referral_invites").insert({
        code,
        campaign_id: body.campaignId,
        creator_tier: body.creatorTier,
        destination,
        max_uses: maxUses,
        rev_share_bps: revShareBps,
        expires_at: expiresAt,
        user_id: user?.id ?? null,
      })
      if (error && isSupabaseConfigured()) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } catch {
      if (isSupabaseConfigured()) {
        return NextResponse.json(
          { error: "Unable to save referral invite." },
          { status: 500 },
        )
      }
    }

    await writeAuditEvent({
      actorId: user?.id ?? null,
      action: "referral.invite.create",
      resourceType: "referral_invite",
      resourceId: code,
      status: "success",
      metadata: {
        campaignId: body.campaignId,
        creatorTier: body.creatorTier,
        maxUses,
        revShareBps,
      },
    })

    return NextResponse.json({
      code,
      inviteUrl,
      expiresAt,
      maxUses,
      tier: body.creatorTier,
      revSharePercent: revShareBps / 100,
    })
  } catch {
    await writeAuditEvent({
      actorId: null,
      action: "referral.invite.create",
      resourceType: "referral_invite",
      status: "error",
    })
    return NextResponse.json({ error: "Invalid referral payload." }, { status: 400 })
  }
}
