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
