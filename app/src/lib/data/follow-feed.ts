import { createClient } from "@/lib/supabase/client"
import type { Mashup } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const MASHUP_SELECT = `
  *,
  creator:profiles!creator_id(id, username, display_name, avatar_url),
  source_tracks(*),
  like_count:likes(count),
  comment_count:comments(count)
`

/**
 * Get mashups from creators the current user follows, paginated.
 */
export async function getFollowingFeed(options: {
  page: number
  limit: number
  genre?: string
}): Promise<{ mashups: Mashup[]; hasMore: boolean }> {
  if (!isSupabaseConfigured()) return { mashups: [], hasMore: false }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { mashups: [], hasMore: false }

    // Get IDs of users the current user follows
    const { data: followData } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)

    const followingIds = followData?.map((f: { following_id: string }) => f.following_id) ?? []
    if (!followingIds.length) return { mashups: [], hasMore: false }

    let query = supabase
      .from("mashups")
      .select(MASHUP_SELECT, { count: "exact" })
      .in("creator_id", followingIds)
      .eq("is_published", true)
      .order("created_at", { ascending: false })

    if (options.genre && options.genre !== "All") {
      query = query.ilike("genre", `%${options.genre}%`)
    }

    const from = options.page * options.limit
    const to = from + options.limit - 1
    query = query.range(from, to)

    const { data, count, error } = await query

    if (error || !data) return { mashups: [], hasMore: false }

    const mashups = data.map(normalizeMashupRow)
    const total = count ?? 0
    return { mashups, hasMore: to + 1 < total }
  } catch {
    return { mashups: [], hasMore: false }
  }
}

/**
 * Get algorithmic "For You" feed, paginated.
 * Combines trending (play_count) with recency weighting.
 */
export async function getForYouFeed(options: {
  page: number
  limit: number
  genre?: string
}): Promise<{ mashups: Mashup[]; hasMore: boolean }> {
  if (!isSupabaseConfigured()) return { mashups: [], hasMore: false }

  try {
    const supabase = createClient()

    let query = supabase
      .from("mashups")
      .select(MASHUP_SELECT, { count: "exact" })
      .eq("is_published", true)
      .order("play_count", { ascending: false })

    if (options.genre && options.genre !== "All") {
      query = query.ilike("genre", `%${options.genre}%`)
    }

    const from = options.page * options.limit
    const to = from + options.limit - 1
    query = query.range(from, to)

    const { data, count, error } = await query

    if (error || !data) return { mashups: [], hasMore: false }

    const mashups = data.map(normalizeMashupRow)
    const total = count ?? 0
    return { mashups, hasMore: to + 1 < total }
  } catch {
    return { mashups: [], hasMore: false }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeMashupRow(row: any): Mashup {
  return {
    ...row,
    creator: row.creator ?? undefined,
    source_tracks: row.source_tracks ?? [],
    like_count:
      typeof row.like_count === "number"
        ? row.like_count
        : Array.isArray(row.like_count)
          ? row.like_count[0]?.count ?? 0
          : 0,
    comment_count:
      typeof row.comment_count === "number"
        ? row.comment_count
        : Array.isArray(row.comment_count)
          ? row.comment_count[0]?.count ?? 0
          : 0,
  }
}
