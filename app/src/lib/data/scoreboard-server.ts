import { buildCreatorScoreboard, type CreatorScoreboardRow } from "@/lib/growth/scoreboard"
import { mockCreators, mockMashups } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/server"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function getWeekStart(now = new Date()): string {
  const monday = new Date(now)
  const day = monday.getDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(monday.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().slice(0, 10)
}

export async function getCreatorScoreboardRowsFromServer(
  now = new Date(),
): Promise<CreatorScoreboardRow[]> {
  const fallback = buildCreatorScoreboard(mockCreators, mockMashups)
  if (!isSupabaseConfigured()) return fallback

  try {
    const weekStart = getWeekStart(now)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("creator_weekly_scores")
      .select("*")
      .eq("week_start", weekStart)
      .order("score", { ascending: false })

    if (error || !data || data.length === 0) {
      const seedRows = fallback.map((row) => ({
        week_start: weekStart,
        creator_username: row.username,
        display_name: row.displayName,
        avatar_url: row.avatarUrl,
        weekly_growth_rate: row.weeklyGrowthRate,
        momentum_lift: row.momentumLift,
        weekly_posts: row.weeklyPosts,
        weekly_plays: row.weeklyPlays,
        score: row.score,
      }))
      await supabase.from("creator_weekly_scores").upsert(seedRows, {
        onConflict: "week_start,creator_username",
      })
      return fallback
    }

    return (data as Record<string, unknown>[]).map((row, index) => ({
      rank: index + 1,
      username: typeof row.creator_username === "string" ? row.creator_username : "unknown",
      displayName: typeof row.display_name === "string" ? row.display_name : "Unknown",
      avatarUrl: typeof row.avatar_url === "string" ? row.avatar_url : "",
      weeklyGrowthRate:
        typeof row.weekly_growth_rate === "number" ? row.weekly_growth_rate : 0,
      momentumLift: typeof row.momentum_lift === "number" ? row.momentum_lift : 0,
      weeklyPosts: typeof row.weekly_posts === "number" ? row.weekly_posts : 0,
      weeklyPlays: typeof row.weekly_plays === "number" ? row.weekly_plays : 0,
      score: typeof row.score === "number" ? row.score : 0,
    }))
  } catch {
    return fallback
  }
}
