import { createClient } from "@/lib/supabase/client"
import type { Comment } from "./types"

type CommentRow = Omit<Comment, "user"> & {
  user: Comment["user"] | null
}

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Get all comments for a mashup with user profiles joined.
 * Falls back to empty array if Supabase is not configured.
 */
export async function getComments(mashupId: string): Promise<Comment[]> {
  if (!isSupabaseConfigured()) {
    return []
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
      .order("created_at", { ascending: false })

    if (error || !data) {
      console.error("getComments error:", error)
      return []
    }

    const rows = data as CommentRow[]

    return rows.map((row) => ({
      ...row,
      user: row.user ?? undefined,
    }))
  } catch {
    return []
  }
}

/**
 * Add a comment to a mashup.
 * Returns the new comment or an error message.
 */
export async function addComment(
  mashupId: string,
  content: string
): Promise<{ comment?: Comment; error?: string }> {
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
      })
      .select(
        `
        *,
        user:profiles!user_id(id, username, display_name, avatar_url)
      `
      )
      .single()

    if (error || !data) {
      console.error("addComment error:", error)
      return { error: error?.message ?? "Failed to add comment" }
    }

    return {
      comment: {
        ...data,
        user: data.user ?? undefined,
      } as Comment,
    }
  } catch {
    return { error: "Failed to add comment" }
  }
}

/**
 * Delete a comment (own comments only — RLS enforced).
 */
export async function deleteComment(
  commentId: string
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Database not configured" }
  }

  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)

    if (error) {
      console.error("deleteComment error:", error)
      return { error: error.message }
    }

    return {}
  } catch {
    return { error: "Failed to delete comment" }
  }
}
