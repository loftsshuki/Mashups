import { NextResponse } from "next/server"

import {
  buildCreatorAnalytics,
  type CreatorAnalyticsSnapshot,
} from "@/lib/data/analytics"
import { mapRowToMockMashup } from "@/lib/data/mashup-adapter"
import { mockMashups } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/server"

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

function mergeEventSignals(
  base: CreatorAnalyticsSnapshot,
  events: Record<string, number>,
): CreatorAnalyticsSnapshot {
  const plays = events.play ?? 0
  const skips = events.skip ?? 0
  const likes = events.like ?? 0
  const shares = events.share ?? 0

  if (plays <= 0) return base

  const skipRate = Math.max(0.02, Math.min(0.9, skips / plays))
  const saveRate = Math.max(0.02, Math.min(0.8, (likes + shares) / plays))
  const avgCompletionRate = Math.max(0.1, Math.min(0.98, 1 - skipRate * 0.72))

  return {
    ...base,
    skipRate: Number(skipRate.toFixed(3)),
    saveRate: Number(saveRate.toFixed(3)),
    avgCompletionRate: Number(avgCompletionRate.toFixed(3)),
  }
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ stats: buildCreatorAnalytics(mockMashups) })
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }

    const { data: mashupRows, error } = await supabase
      .from("mashups")
      .select(
        `
        *,
        creator:profiles!creator_id(*),
        source_tracks(*),
        like_count:likes(count),
        comment_count:comments(count)
      `,
      )
      .eq("creator_id", user.id)
      .eq("is_published", true)

    if (error || !mashupRows) {
      return NextResponse.json({ error: "Failed to load analytics." }, { status: 400 })
    }

    const mapped = (mashupRows as Record<string, unknown>[]).map((row) =>
      mapRowToMockMashup(row),
    )
    const base = buildCreatorAnalytics(mapped)

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: eventRows } = await supabase
      .from("recommendation_events")
      .select("event_type")
      .eq("user_id", user.id)
      .gte("created_at", thirtyDaysAgo)
      .limit(8000)

    const eventCounts: Record<string, number> = {}
    for (const row of (eventRows as Record<string, unknown>[] | null) ?? []) {
      const eventType = typeof row.event_type === "string" ? row.event_type : null
      if (!eventType) continue
      eventCounts[eventType] = (eventCounts[eventType] ?? 0) + 1
    }

    const stats = mergeEventSignals(base, eventCounts)
    return NextResponse.json({ stats })
  } catch {
    return NextResponse.json({ error: "Failed to load analytics." }, { status: 500 })
  }
}
