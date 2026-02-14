import { createClient } from "@/lib/supabase/client"
import type { CommentV2, Profile } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const REACTION_EMOJIS = ["👍", "🔥", "❤️", "🤯", "💯", "👏"] as const

// ── Mock data ──

const mockProfiles: Profile[] = [
  {
    id: "user-1",
    username: "beatsmith",
    display_name: "Beat Smith",
    avatar_url: null,
    bio: "Producer & mashup artist",
    created_at: "2025-06-01T00:00:00Z",
  },
  {
    id: "user-2",
    username: "djfusion",
    display_name: "DJ Fusion",
    avatar_url: null,
    bio: "Blending genres since 2019",
    created_at: "2025-04-15T00:00:00Z",
  },
  {
    id: "user-3",
    username: "melodymixer",
    display_name: "Melody Mixer",
    avatar_url: null,
    bio: "Vocal chops and chill vibes",
    created_at: "2025-07-20T00:00:00Z",
  },
  {
    id: "user-4",
    username: "synthwave99",
    display_name: "Synthwave 99",
    avatar_url: null,
    bio: null,
    created_at: "2025-09-10T00:00:00Z",
  },
]

const mockTopLevelComments: CommentV2[] = [
  {
    id: "comment-v2-1",
    mashup_id: "mashup-1",
    user_id: "user-1",
    content: "This transition at 0:45 is insane! How did you blend those two keys together?",
    created_at: "2026-02-13T18:30:00Z",
    parent_id: null,
    timestamp_sec: null,
    edited_at: null,
    user: mockProfiles[0],
    reactions: [
      { emoji: "🔥", count: 3, reacted: false },
      { emoji: "👍", count: 5, reacted: true },
    ],
    reply_count: 2,
  },
  {
    id: "comment-v2-2",
    mashup_id: "mashup-1",
    user_id: "user-2",
    content: "Honestly one of the cleanest mashups I've heard this month. @beatsmith you need to collab with this person!",
    created_at: "2026-02-13T15:10:00Z",
    parent_id: null,
    timestamp_sec: null,
    edited_at: null,
    user: mockProfiles[1],
    reactions: [
      { emoji: "❤️", count: 2, reacted: false },
      { emoji: "💯", count: 4, reacted: true },
    ],
    reply_count: 1,
  },
  {
    id: "comment-v2-3",
    mashup_id: "mashup-1",
    user_id: "user-3",
    content: "The vocal isolation on this is really well done. What tool are you using for stem separation?",
    created_at: "2026-02-12T22:00:00Z",
    parent_id: null,
    timestamp_sec: null,
    edited_at: null,
    user: mockProfiles[2],
    reactions: [
      { emoji: "🤯", count: 1, reacted: false },
    ],
    reply_count: 0,
  },
  {
    id: "comment-v2-4",
    mashup_id: "mashup-1",
    user_id: "user-4",
    content: "Added this to my playlist. Keep it up!",
    created_at: "2026-02-12T10:45:00Z",
    parent_id: null,
    timestamp_sec: null,
    edited_at: null,
    user: mockProfiles[3],
    reactions: [],
    reply_count: 0,
  },
]

const mockReplies: CommentV2[] = [
  {
    id: "reply-v2-1",
    mashup_id: "mashup-1",
    user_id: "user-2",
    content: "Right?! The key change is so smooth you barely notice it.",
    created_at: "2026-02-13T19:00:00Z",
    parent_id: "comment-v2-1",
    timestamp_sec: null,
    edited_at: null,
    user: mockProfiles[1],
    reactions: [],
    reply_count: 0,
  },
  {
    id: "reply-v2-2",
    mashup_id: "mashup-1",
    user_id: "user-3",
    content: "Agreed, I had to listen to that part three times.",
    created_at: "2026-02-13T20:15:00Z",
    parent_id: "comment-v2-1",
    timestamp_sec: null,
    edited_at: null,
    user: mockProfiles[2],
    reactions: [{ emoji: "👍", count: 1, reacted: false }],
    reply_count: 0,
  },
]

const mockTimestampedComments: CommentV2[] = [
  {
    id: "ts-comment-1",
    mashup_id: "mashup-1",
    user_id: "user-1",
    content: "Love the intro drop here",
    created_at: "2026-02-13T12:00:00Z",
    parent_id: null,
    timestamp_sec: 15,
    edited_at: null,
    user: mockProfiles[0],
    reactions: [{ emoji: "🔥", count: 2, reacted: false }],
    reply_count: 0,
  },
  {
    id: "ts-comment-2",
    mashup_id: "mashup-1",
    user_id: "user-2",
    content: "This is where it gets funky",
    created_at: "2026-02-13T13:00:00Z",
    parent_id: null,
    timestamp_sec: 45,
    edited_at: null,
    user: mockProfiles[1],
    reactions: [],
    reply_count: 0,
  },
  {
    id: "ts-comment-3",
    mashup_id: "mashup-1",
    user_id: "user-4",
    content: "The breakdown here is everything",
    created_at: "2026-02-13T14:00:00Z",
    parent_id: null,
    timestamp_sec: 120,
    edited_at: null,
    user: mockProfiles[3],
    reactions: [
      { emoji: "🤯", count: 3, reacted: true },
      { emoji: "👏", count: 1, reacted: false },
    ],
    reply_count: 0,
  },
]

// ── Data functions ──

/**
 * Get top-level comments for a mashup with reply counts and reactions.
 * Returns comments ordered by created_at DESC.
 */
export async function getCommentsV2(mashupId: string): Promise<CommentV2[]> {
  if (!isSupabaseConfigured()) {
    return mockTopLevelComments
  }

  try {
    const supabase = createClient()

    // Fetch top-level comments (no parent)
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        user:profiles!user_id(id, username, display_name, avatar_url)
      `
      )
      .eq("mashup_id", mashupId)
      .is("parent_id", null)
      .order("created_at", { ascending: false })

    if (error || !data) {
      console.error("getCommentsV2 error:", error)
      return []
    }

    // Enrich each comment with reply_count and reactions
    const comments: CommentV2[] = await Promise.all(
      data.map(async (row: Record<string, unknown>) => {
        // Get reply count
        const { count: replyCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("parent_id", row.id as string)

        // Get reactions summary
        const reactions = await getReactionSummary(row.id as string)

        return {
          ...row,
          user: (row as { user?: unknown }).user ?? undefined,
          reply_count: replyCount ?? 0,
          reactions,
        } as CommentV2
      })
    )

    return comments
  } catch {
    return []
  }
}

/**
 * Get replies (child comments) for a given parent comment.
 * Returns replies ordered by created_at ASC.
 */
export async function getCommentReplies(
  parentId: string
): Promise<CommentV2[]> {
  if (!isSupabaseConfigured()) {
    return mockReplies
  }

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        user:profiles!user_id(id, username, display_name, avatar_url)
      `
      )
      .eq("parent_id", parentId)
      .order("created_at", { ascending: true })

    if (error || !data) {
      console.error("getCommentReplies error:", error)
      return []
    }

    // Enrich each reply with reactions
    const replies: CommentV2[] = await Promise.all(
      data.map(async (row: Record<string, unknown>) => {
        const reactions = await getReactionSummary(row.id as string)

        return {
          ...row,
          user: (row as { user?: unknown }).user ?? undefined,
          reactions,
          reply_count: 0,
        } as CommentV2
      })
    )

    return replies
  } catch {
    return []
  }
}

/**
 * Add a new comment (optionally as a reply or with a timestamp).
 * Returns the new comment or an error message.
 */
export async function addCommentV2(
  mashupId: string,
  content: string,
  options?: { parentId?: string; timestampSec?: number }
): Promise<{ comment?: CommentV2; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Database not configured" }
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Not authenticated" }
    }

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
        user:profiles!user_id(id, username, display_name, avatar_url)
      `
      )
      .single()

    if (error || !data) {
      console.error("addCommentV2 error:", error)
      return { error: error?.message ?? "Failed to add comment" }
    }

    return {
      comment: {
        ...data,
        user: data.user ?? undefined,
        reactions: [],
        reply_count: 0,
      } as CommentV2,
    }
  } catch {
    return { error: "Failed to add comment" }
  }
}

/**
 * Get comments that have a timestamp attached, ordered by timestamp_sec ASC.
 * Useful for displaying comments synced to audio playback position.
 */
export async function getTimestampedComments(
  mashupId: string
): Promise<CommentV2[]> {
  if (!isSupabaseConfigured()) {
    return mockTimestampedComments
  }

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        user:profiles!user_id(id, username, display_name, avatar_url)
      `
      )
      .eq("mashup_id", mashupId)
      .not("timestamp_sec", "is", null)
      .order("timestamp_sec", { ascending: true })

    if (error || !data) {
      console.error("getTimestampedComments error:", error)
      return []
    }

    const comments: CommentV2[] = await Promise.all(
      data.map(async (row: Record<string, unknown>) => {
        const reactions = await getReactionSummary(row.id as string)

        return {
          ...row,
          user: (row as { user?: unknown }).user ?? undefined,
          reactions,
          reply_count: 0,
        } as CommentV2
      })
    )

    return comments
  } catch {
    return []
  }
}

/**
 * Toggle a reaction emoji on a comment for the current user.
 * If the user already reacted with this emoji, remove it; otherwise add it.
 */
export async function toggleCommentReaction(
  commentId: string,
  emoji: string
): Promise<{ reacted: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { reacted: true }
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { reacted: false, error: "Not authenticated" }
    }

    // Check if reaction already exists
    const { data: existing } = await supabase
      .from("comment_reactions")
      .select("*")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .eq("emoji", emoji)
      .maybeSingle()

    if (existing) {
      // Remove reaction
      await supabase
        .from("comment_reactions")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .eq("emoji", emoji)

      return { reacted: false }
    } else {
      // Add reaction
      const { error } = await supabase
        .from("comment_reactions")
        .insert({
          comment_id: commentId,
          user_id: user.id,
          emoji,
        })

      if (error) {
        console.error("toggleCommentReaction insert error:", error)
        return { reacted: false, error: error.message }
      }

      return { reacted: true }
    }
  } catch {
    return { reacted: false, error: "Failed to toggle reaction" }
  }
}

/**
 * Get a summary of reactions for a comment grouped by emoji.
 * Includes count per emoji and whether the current user has reacted.
 */
export async function getReactionSummary(
  commentId: string
): Promise<Array<{ emoji: string; count: number; reacted: boolean }>> {
  if (!isSupabaseConfigured()) {
    return [
      { emoji: "🔥", count: 3, reacted: false },
      { emoji: "👍", count: 5, reacted: true },
      { emoji: "❤️", count: 2, reacted: false },
    ]
  }

  try {
    const supabase = createClient()

    // Get current user (may be null for unauthenticated)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get all reactions for this comment
    const { data: reactions, error } = await supabase
      .from("comment_reactions")
      .select("emoji, user_id")
      .eq("comment_id", commentId)

    if (error || !reactions) {
      console.error("getReactionSummary error:", error)
      return []
    }

    // Group by emoji
    const grouped = new Map<string, { count: number; reacted: boolean }>()

    for (const reaction of reactions) {
      const entry = grouped.get(reaction.emoji) ?? { count: 0, reacted: false }
      entry.count += 1
      if (user && reaction.user_id === user.id) {
        entry.reacted = true
      }
      grouped.set(reaction.emoji, entry)
    }

    return Array.from(grouped.entries()).map(([emoji, { count, reacted }]) => ({
      emoji,
      count,
      reacted,
    }))
  } catch {
    return []
  }
}

/**
 * Search user profiles for @mention autocomplete.
 * Matches against username and display_name using ILIKE.
 */
export async function searchUsers(
  query: string,
  limit: number = 5
): Promise<Profile[]> {
  if (!isSupabaseConfigured()) {
    return mockProfiles.slice(0, 3)
  }

  try {
    const supabase = createClient()
    const pattern = `%${query}%`

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, created_at")
      .or(`username.ilike.${pattern},display_name.ilike.${pattern}`)
      .limit(limit)

    if (error || !data) {
      console.error("searchUsers error:", error)
      return []
    }

    return data as Profile[]
  } catch {
    return []
  }
}
