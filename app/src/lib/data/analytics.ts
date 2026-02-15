import type { MockMashup } from "@/lib/mock-data"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export interface CreatorAnalyticsSnapshot {
  totalPlays: number
  totalLikes: number
  totalComments: number
  avgCompletionRate: number
  skipRate: number
  saveRate: number
}

export function buildCreatorAnalytics(mashups: MockMashup[]): CreatorAnalyticsSnapshot {
  const totalPlays = mashups.reduce((sum: number, m) => sum + m.playCount, 0)
  const totalLikes = mashups.reduce((sum: number, m) => sum + m.likeCount, 0)
  const totalComments = mashups.reduce((sum: number, m) => sum + m.commentCount, 0)
  const likeRate = totalPlays > 0 ? totalLikes / totalPlays : 0
  const commentRate = totalPlays > 0 ? totalComments / totalPlays : 0

  return {
    totalPlays,
    totalLikes,
    totalComments,
    avgCompletionRate: Math.min(0.92, 0.52 + likeRate * 4.2),
    skipRate: Math.max(0.06, 0.34 - likeRate * 2.7),
    saveRate: Math.min(0.48, 0.08 + (likeRate + commentRate) * 2.2),
  }
}

// ---------------------------------------------------------------------------
// Supabase-backed analytics
// ---------------------------------------------------------------------------

export async function getCreatorAnalyticsFromDb(
  userId: string,
): Promise<CreatorAnalyticsSnapshot | null> {
  if (!isSupabaseConfigured()) return null

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    // Get mashup stats for this creator
    const { data: mashups, error } = await supabase
      .from("mashups")
      .select("id, play_count, like_count, comment_count")
      .eq("creator_id", userId)

    if (error || !mashups || mashups.length === 0) return null

    const rows = mashups as Record<string, unknown>[]
    const totalPlays = rows.reduce((sum: number, m) => sum + ((m.play_count as number) ?? 0), 0)
    const totalLikes = rows.reduce((sum: number, m) => sum + ((m.like_count as number) ?? 0), 0)
    const totalComments = rows.reduce((sum: number, m) => sum + ((m.comment_count as number) ?? 0), 0)
    const likeRate = totalPlays > 0 ? totalLikes / totalPlays : 0
    const commentRate = totalPlays > 0 ? totalComments / totalPlays : 0

    return {
      totalPlays,
      totalLikes,
      totalComments,
      avgCompletionRate: Math.min(0.92, 0.52 + likeRate * 4.2),
      skipRate: Math.max(0.06, 0.34 - likeRate * 2.7),
      saveRate: Math.min(0.48, 0.08 + (likeRate + commentRate) * 2.2),
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Time-series analytics (backed by analytics_events table)
// ---------------------------------------------------------------------------

export interface TimeSeriesPoint {
  date: string
  plays: number
  likes: number
  shares: number
  comments: number
}

export async function getCreatorAnalyticsTimeSeries(
  userId: string,
  period: "day" | "week" | "month" = "day",
  range: number = 30,
): Promise<TimeSeriesPoint[]> {
  if (!isSupabaseConfigured()) {
    return generateMockTimeSeries(period, range)
  }

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const since = new Date()
    since.setDate(since.getDate() - range)

    // Get creator's mashup IDs first
    const { data: mashups } = await supabase
      .from("mashups")
      .select("id")
      .eq("creator_id", userId)

    if (!mashups?.length) return generateMockTimeSeries(period, range)

    const mashupIds = mashups.map((m: { id: string }) => m.id)

    const { data: events, error } = await supabase
      .from("analytics_events")
      .select("event_type, created_at")
      .in("mashup_id", mashupIds)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true })

    if (error || !events?.length) return generateMockTimeSeries(period, range)

    // Group by period
    const buckets = new Map<string, TimeSeriesPoint>()

    for (const evt of events as { event_type: string; created_at: string }[]) {
      const d = new Date(evt.created_at)
      let key: string
      if (period === "month") {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
      } else if (period === "week") {
        const day = d.getDay()
        const diff = d.getDate() - day + (day === 0 ? -6 : 1)
        const monday = new Date(d)
        monday.setDate(diff)
        key = monday.toISOString().slice(0, 10)
      } else {
        key = d.toISOString().slice(0, 10)
      }

      if (!buckets.has(key)) {
        buckets.set(key, { date: key, plays: 0, likes: 0, shares: 0, comments: 0 })
      }
      const point = buckets.get(key)!
      switch (evt.event_type) {
        case "play": point.plays++; break
        case "like": point.likes++; break
        case "share": point.shares++; break
        case "comment": point.comments++; break
      }
    }

    return Array.from(buckets.values()).sort((a, b) => a.date.localeCompare(b.date))
  } catch {
    return generateMockTimeSeries(period, range)
  }
}

/**
 * Log an analytics event for client-side tracking.
 */
export async function logAnalyticsEvent(
  userId: string,
  mashupId: string,
  eventType: "play" | "like" | "share" | "comment" | "save" | "skip" | "download" | "embed",
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { error } = await supabase.from("analytics_events").insert({
      user_id: userId,
      mashup_id: mashupId,
      event_type: eventType,
    })

    return !error
  } catch {
    return false
  }
}

// Generate synthetic time-series data for mock fallback
function generateMockTimeSeries(period: "day" | "week" | "month", range: number): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = []
  const now = new Date()

  const stepDays = period === "month" ? 30 : period === "week" ? 7 : 1
  const steps = Math.ceil(range / stepDays)

  for (let i = steps - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * stepDays)
    points.push({
      date: d.toISOString().slice(0, 10),
      plays: Math.floor(Math.random() * 200) + 50,
      likes: Math.floor(Math.random() * 40) + 5,
      shares: Math.floor(Math.random() * 15) + 1,
      comments: Math.floor(Math.random() * 20) + 2,
    })
  }

  return points
}
