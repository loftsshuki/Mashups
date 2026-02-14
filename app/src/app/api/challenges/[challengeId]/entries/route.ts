import { NextResponse } from "next/server"

import {
  enterChallengeFromBackend,
  getChallengeEntriesFromBackend,
} from "@/lib/data/challenge-engine"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createClient } from "@/lib/supabase/server"

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

interface EnterBody {
  mashupId?: string
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ challengeId: string }> },
) {
  try {
    const { challengeId } = await params
    const entries = await getChallengeEntriesFromBackend(challengeId)
    return NextResponse.json({ entries })
  } catch {
    return NextResponse.json({ error: "Failed to load challenge entries." }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ challengeId: string }> },
) {
  try {
    const body = (await request.json().catch(() => ({}))) as EnterBody
    const { challengeId } = await params

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (isSupabaseConfigured() && !user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }
    const rate = consumeRateLimit({
      key: resolveRateLimitKey(request, "challenges.entries", user?.id ?? null),
      limit: 20,
      windowMs: 60_000,
    })
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
      )
    }

    const result = await enterChallengeFromBackend({
      challengeId,
      mashupId: body.mashupId,
      userId: user?.id ?? "mock-user",
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

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
