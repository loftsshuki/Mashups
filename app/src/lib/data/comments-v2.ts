import { createClient } from "@/lib/supabase/client"
import type { Comment, CommentReactionGroup, Profile } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const PROFILE_SELECT = "id, username, display_name, avatar_url"

/**
 * Get top-level comments (no parent) for a mashup with reply counts.
 */
export async function getCommentsV2(mashupId: string): Promise<Comment[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        user:profiles!user_id(${PROFILE_SELECT})
      `
      )
      .eq("mashup_id", mashupId)
      .is("parent_id", null)
      .order("created_at", { ascending: false })

    if (error || !data) return []

    // Fetch reply counts for all top-level comments
    const ids = data.map((c: any) => c.id)
    const replyCounts = await getReplyCountsBatch(ids)

    // Fetch reactions for all top-level comments
    const allReactions = await getReactionsBatch(ids)

    return data.map((row: any) => ({
      ...row,
      user: row.user ?? undefined,
      reply_count: replyCounts.get(row.id) ?? 0,
      reactions: allReactions.get(row.id) ?? [],
    }))
  } catch {
    return []
  }
}

/**
 * Get replies for a parent comment.
 */
export async function getCommentReplies(parentId: string): Promise<Comment[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        user:profiles!user_id(${PROFILE_SELECT})
      `
      )
      .eq("parent_id", parentId)
      .order("created_at", { ascending: true })

    if (error || !data) return []

    const ids = data.map((c: any) => c.id)
    const allReactions = await getReactionsBatch(ids)

    return data.map((row: any) => ({
      ...row,
      user: row.user ?? undefined,
      reactions: allReactions.get(row.id) ?? [],
    }))
  } catch {
    return []
  }
}

/**
 * Add a comment with optional parent and timestamp.
 */
export async function addCommentV2(
  mashupId: string,
  content: string,
  options?: { parentId?: string; timestampSec?: number }
): Promise<{ comment?: Comment; error?: string }> {
  if (!isSupabaseConfigured()) return { error: "Database not configured" }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        mashup_id: mashupId,
        user_id: user.id,
        content,
        parent_id: options?.parentId ?? null,
        timestamp_sec: options?.timestampSec ?? null,
      })
      .select(
        `
        *,
        user:profiles!user_id(${PROFILE_SELECT})
      `
      )
      .single()

    if (error || !data) {
      return { error: error?.message ?? "Failed to add comment" }
    }

    // Extract and insert @mentions
    const mentionMatches = content.match(/@(\w+)/g)
    if (mentionMatches) {
      const usernames = mentionMatches.map((m) => m.slice(1))
      const { data: mentionedUsers } = await supabase
        .from("profiles")
        .select("id, username")
        .in("username", usernames)

      if (mentionedUsers?.length) {
        await supabase.from("comment_mentions").insert(
          mentionedUsers.map((u: any) => ({
            comment_id: data.id,
            mentioned_user_id: u.id,
          }))
        )
      }
    }

    return {
      comment: {
        ...data,
        user: data.user ?? undefined,
        reply_count: 0,
        reactions: [],
      } as Comment,
    }
  } catch {
    return { error: "Failed to add comment" }
  }
}

/**
 * Get comments at specific timestamps for waveform markers.
 */
export async function getTimestampedComments(
  mashupId: string
): Promise<Comment[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        user:profiles!user_id(${PROFILE_SELECT})
      `
      )
      .eq("mashup_id", mashupId)
      .not("timestamp_sec", "is", null)
      .order("timestamp_sec", { ascending: true })

    if (error || !data) return []

    return data.map((row: any) => ({
      ...row,
      user: row.user ?? undefined,
    }))
  } catch {
    return []
  }
}

/**
 * Toggle an emoji reaction on a comment.
 */
export async function toggleCommentReaction(
  commentId: string,
  emoji: string
): Promise<{ reacted: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { reacted: false, error: "Database not configured" }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { reacted: false, error: "Not authenticated" }

    // Check existing
    const { data: existing } = await supabase
      .from("comment_reactions")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .eq("emoji", emoji)
      .maybeSingle()

    if (existing) {
      await supabase
        .from("comment_reactions")
        .delete()
        .eq("id", existing.id)
      return { reacted: false }
    } else {
      await supabase
        .from("comment_reactions")
        .insert({ comment_id: commentId, user_id: user.id, emoji })
      return { reacted: true }
    }
  } catch {
    return { reacted: false, error: "Failed to toggle reaction" }
  }
}

/**
 * Get grouped reactions for a single comment.
 */
export async function getCommentReactions(
  commentId: string
): Promise<CommentReactionGroup[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from("comment_reactions")
      .select("emoji, user_id")
      .eq("comment_id", commentId)

    if (error || !data) return []

    const groups = new Map<string, { count: number; userReacted: boolean }>()
    for (const row of data) {
      const existing = groups.get(row.emoji) ?? { count: 0, userReacted: false }
      existing.count++
      if (user && row.user_id === user.id) existing.userReacted = true
      groups.set(row.emoji, existing)
    }

    return Array.from(groups.entries()).map(([emoji, { count, userReacted }]) => ({
      emoji,
      count,
      user_reacted: userReacted,
    }))
  } catch {
    return []
  }
}

/**
 * Search users for @mention autocomplete.
 */
export async function searchUsers(
  query: string,
  limit = 5
): Promise<Profile[]> {
  if (!isSupabaseConfigured() || !query.trim()) return []

  try {
    const supabase = createClient()
    const pattern = `%${query}%`

    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .or(`username.ilike.${pattern},display_name.ilike.${pattern}`)
      .limit(limit)

    if (error || !data) return []
    return data as Profile[]
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getReplyCountsBatch(
  commentIds: string[]
): Promise<Map<string, number>> {
  const result = new Map<string, number>()
  if (!commentIds.length || !isSupabaseConfigured()) return result

  try {
    const supabase = createClient()
    const { data } = await supabase
      .from("comments")
      .select("parent_id")
      .in("parent_id", commentIds)

    if (data) {
      for (const row of data) {
        if (row.parent_id) {
          result.set(row.parent_id, (result.get(row.parent_id) ?? 0) + 1)
        }
      }
    }
  } catch {
    // ignore
  }
  return result
}

async function getReactionsBatch(
  commentIds: string[]
): Promise<Map<string, CommentReactionGroup[]>> {
  const result = new Map<string, CommentReactionGroup[]>()
  if (!commentIds.length || !isSupabaseConfigured()) return result

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data } = await supabase
      .from("comment_reactions")
      .select("comment_id, emoji, user_id")
      .in("comment_id", commentIds)

    if (!data) return result

    // Group by comment_id -> emoji -> { count, userReacted }
    const byComment = new Map<
      string,
      Map<string, { count: number; userReacted: boolean }>
    >()

    for (const row of data) {
      let emojiMap = byComment.get(row.comment_id)
      if (!emojiMap) {
        emojiMap = new Map()
        byComment.set(row.comment_id, emojiMap)
      }
      const existing = emojiMap.get(row.emoji) ?? {
        count: 0,
        userReacted: false,
      }
      existing.count++
      if (user && row.user_id === user.id) existing.userReacted = true
      emojiMap.set(row.emoji, existing)
    }

    for (const [commentId, emojiMap] of byComment) {
      result.set(
        commentId,
        Array.from(emojiMap.entries()).map(
          ([emoji, { count, userReacted }]) => ({
            emoji,
            count,
            user_reacted: userReacted,
          })
        )
      )
    }
  } catch {
    // ignore
  }
  return result
}
