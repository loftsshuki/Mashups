import { NextResponse } from "next/server"

import { enterChallengeFromBackend } from "@/lib/data/challenge-engine"
import { writeAuditEvent } from "@/lib/data/audit-log"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createClient } from "@/lib/supabase/server"

interface EnterChallengeBody {
  challengeId?: string
  mashupId?: string
}

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EnterChallengeBody
    if (!body.challengeId) {
      return NextResponse.json({ error: "challengeId is required." }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (isSupabaseConfigured() && !user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }
    const rate = consumeRateLimit({
      key: resolveRateLimitKey(request, "challenges.enter", user?.id ?? null),
      limit: 15,
      windowMs: 60_000,
    })
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
      )
    }

    const result = await enterChallengeFromBackend({
      challengeId: body.challengeId,
      mashupId: body.mashupId,
      userId: user?.id ?? "mock-user",
    })

    if (!result.ok) {
      await writeAuditEvent({
        actorId: user?.id ?? null,
        action: "challenge.entry.submit",
        resourceType: "challenge",
        resourceId: body.challengeId,
        status: "error",
        metadata: { error: result.error },
      })
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    await writeAuditEvent({
      actorId: user?.id ?? null,
      action: "challenge.entry.submit",
      resourceType: "challenge",
      resourceId: body.challengeId,
      status: "success",
      metadata: { entryId: result.entryId, mashupId: result.mashupId },
    })

    return NextResponse.json({
      ok: true,
      entryId: result.entryId,
      challenge: {
        id: result.challenge.id,
        title: result.challenge.title,
        prizeText: result.challenge.prizeText,
      },
      mashupId: result.mashupId,
    })
  } catch {
    return NextResponse.json({ error: "Invalid challenge entry payload." }, { status: 400 })
  }
}
