import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { mockChallenges } from "@/lib/data/challenges"

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
    if (!body.challengeId || !body.mashupId) {
      return NextResponse.json(
        { error: "challengeId and mashupId are required." },
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

    const challenge = mockChallenges.find((entry) => entry.id === body.challengeId)
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found." }, { status: 404 })
    }

    if (challenge.status === "closed") {
      return NextResponse.json({ error: "Challenge is closed." }, { status: 400 })
    }

    const entryId = `entry_${randomUUID().replace(/-/g, "").slice(0, 12)}`

    try {
      await supabase.from("recommendation_events").insert({
        user_id: user?.id ?? null,
        mashup_id: body.mashupId,
        event_type: "open",
        context: `challenge_entry:${entryId}|challenge:${body.challengeId}`,
      })
    } catch {
      // Non-blocking analytics write.
    }

    return NextResponse.json({
      ok: true,
      entryId,
      challenge: {
        id: challenge.id,
        title: challenge.title,
        prizeText: challenge.prizeText,
      },
    })
  } catch {
    return NextResponse.json({ error: "Invalid challenge entry payload." }, { status: 400 })
  }
}
