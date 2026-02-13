import { createClient } from "@/lib/supabase/client"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Toggle follow/unfollow for a target user.
 * Returns the new following state.
 */
export async function toggleFollow(
  targetUserId: string
): Promise<{ following: boolean }> {
  if (!isSupabaseConfigured()) {
    return { following: true }
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { following: false }
    }

    // Check if already following
    const { data: existing } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)
      .maybeSingle()

    if (existing) {
      // Unfollow
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
      return { following: false }
    } else {
      // Follow
      await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: targetUserId })
      return { following: true }
    }
  } catch {
    return { following: false }
  }
}

/**
 * Get follower count for a user.
 */
export async function getFollowerCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0
  }

  try {
    const supabase = createClient()
    const { count } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId)

    return count ?? 0
  } catch {
    return 0
  }
}

/**
 * Get following count for a user.
 */
export async function getFollowingCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0
  }

  try {
    const supabase = createClient()
    const { count } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId)

    return count ?? 0
  } catch {
    return 0
  }
}

/**
 * Check if the current user follows a target user.
 */
export async function isFollowing(targetUserId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { data } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)
      .maybeSingle()

    return !!data
  } catch {
    return false
  }
}
