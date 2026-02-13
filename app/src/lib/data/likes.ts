import { createClient } from "@/lib/supabase/client"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Toggle a like on/off for the current user.
 * Returns the new liked state and updated count.
 */
export async function toggleLike(
  mashupId: string
): Promise<{ liked: boolean; count: number }> {
  if (!isSupabaseConfigured()) {
    return { liked: true, count: 0 }
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { liked: false, count: 0 }
    }

    // Check if already liked
    const { data: existing } = await supabase
      .from("likes")
      .select("*")
      .eq("user_id", user.id)
      .eq("mashup_id", mashupId)
      .maybeSingle()

    if (existing) {
      // Unlike
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("mashup_id", mashupId)
    } else {
      // Like
      await supabase
        .from("likes")
        .insert({ user_id: user.id, mashup_id: mashupId })
    }

    // Get updated count
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("mashup_id", mashupId)

    return { liked: !existing, count: count ?? 0 }
  } catch {
    return { liked: true, count: 0 }
  }
}

/**
 * Get total likes for a mashup.
 */
export async function getLikeCount(mashupId: string): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0
  }

  try {
    const supabase = createClient()
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("mashup_id", mashupId)

    return count ?? 0
  } catch {
    return 0
  }
}

/**
 * Check if the current user has liked a mashup.
 */
export async function hasUserLiked(mashupId: string): Promise<boolean> {
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
      .from("likes")
      .select("*")
      .eq("user_id", user.id)
      .eq("mashup_id", mashupId)
      .maybeSingle()

    return !!data
  } catch {
    return false
  }
}
