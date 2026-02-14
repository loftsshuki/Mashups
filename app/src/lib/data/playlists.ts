import { createClient } from "@/lib/supabase/client"
import type { Playlist, PlaylistTrack, PlaylistComment } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const PROFILE_SELECT = "id, username, display_name, avatar_url"

/**
 * Get public playlists, optionally filtered by creator.
 */
export async function getPlaylists(options?: {
  creatorId?: string
  limit?: number
}): Promise<Playlist[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    let query = supabase
      .from("playlists")
      .select(`*, creator:profiles!creator_id(${PROFILE_SELECT})`)
      .eq("is_public", true)
      .order("created_at", { ascending: false })

    if (options?.creatorId) {
      query = query.eq("creator_id", options.creatorId)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error || !data) return []

    return data.map((row: any) => ({
      ...row,
      creator: row.creator ?? undefined,
    }))
  } catch {
    return []
  }
}

/**
 * Get a single playlist by ID with creator profile.
 */
export async function getPlaylistById(
  id: string
): Promise<Playlist | null> {
  if (!isSupabaseConfigured()) return null

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("playlists")
      .select(`*, creator:profiles!creator_id(${PROFILE_SELECT})`)
      .eq("id", id)
      .single()

    if (error || !data) return null

    return {
      ...data,
      creator: data.creator ?? undefined,
    } as Playlist
  } catch {
    return null
  }
}

/**
 * Create a new playlist.
 */
export async function createPlaylist(
  title: string,
  description?: string
): Promise<{ playlist?: Playlist; error?: string }> {
  if (!isSupabaseConfigured()) return { error: "Database not configured" }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    const { data, error } = await supabase
      .from("playlists")
      .insert({
        title,
        description: description ?? null,
        creator_id: user.id,
      })
      .select(`*, creator:profiles!creator_id(${PROFILE_SELECT})`)
      .single()

    if (error || !data) {
      return { error: error?.message ?? "Failed to create playlist" }
    }

    return {
      playlist: { ...data, creator: data.creator ?? undefined } as Playlist,
    }
  } catch {
    return { error: "Failed to create playlist" }
  }
}

/**
 * Update a playlist (owner only, RLS enforced).
 */
export async function updatePlaylist(
  id: string,
  updates: Partial<
    Pick<
      Playlist,
      "title" | "description" | "cover_image_url" | "is_collaborative" | "is_public"
    >
  >
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) return { error: "Database not configured" }

  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("playlists")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) return { error: error.message }
    return {}
  } catch {
    return { error: "Failed to update playlist" }
  }
}

/**
 * Delete a playlist (owner only, RLS enforced).
 */
export async function deletePlaylist(id: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) return { error: "Database not configured" }

  try {
    const supabase = createClient()
    const { error } = await supabase.from("playlists").delete().eq("id", id)

    if (error) return { error: error.message }
    return {}
  } catch {
    return { error: "Failed to delete playlist" }
  }
}

/**
 * Get tracks in a playlist with mashup and added_by profile joined.
 */
export async function getPlaylistTracks(
  playlistId: string
): Promise<PlaylistTrack[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("playlist_tracks")
      .select(
        `
        *,
        mashup:mashups!mashup_id(
          id, title, audio_url, cover_image_url, genre, bpm, duration, play_count,
          creator:profiles!creator_id(${PROFILE_SELECT})
        ),
        added_by_user:profiles!added_by(${PROFILE_SELECT})
      `
      )
      .eq("playlist_id", playlistId)
      .order("position", { ascending: true })

    if (error || !data) return []

    return data.map((row: any) => ({
      ...row,
      mashup: row.mashup ?? undefined,
      added_by_user: row.added_by_user ?? undefined,
    }))
  } catch {
    return []
  }
}

/**
 * Add a track to a playlist. Inserts at the end and increments track_count.
 */
export async function addTrackToPlaylist(
  playlistId: string,
  mashupId: string
): Promise<{ track?: PlaylistTrack; error?: string }> {
  if (!isSupabaseConfigured()) return { error: "Database not configured" }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    // Get current max position
    const { data: existing } = await supabase
      .from("playlist_tracks")
      .select("position")
      .eq("playlist_id", playlistId)
      .order("position", { ascending: false })
      .limit(1)

    const nextPosition = existing?.length ? existing[0].position + 1 : 0

    const { data, error } = await supabase
      .from("playlist_tracks")
      .insert({
        playlist_id: playlistId,
        mashup_id: mashupId,
        added_by: user.id,
        position: nextPosition,
      })
      .select("*")
      .single()

    if (error) {
      if (error.code === "23505") {
        return { error: "Track already in playlist" }
      }
      return { error: error.message }
    }

    // Increment track_count
    await supabase.rpc("increment_playlist_track_count", {
      playlist_id_param: playlistId,
    }).then(() => {}, () => {
      // Fallback: manual increment if RPC doesn't exist
      supabase
        .from("playlists")
        .update({ track_count: nextPosition + 1 })
        .eq("id", playlistId)
    })

    return { track: data as PlaylistTrack }
  } catch {
    return { error: "Failed to add track" }
  }
}

/**
 * Remove a track from a playlist and decrement track_count.
 */
export async function removeTrackFromPlaylist(
  playlistId: string,
  mashupId: string
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) return { error: "Database not configured" }

  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("playlist_tracks")
      .delete()
      .eq("playlist_id", playlistId)
      .eq("mashup_id", mashupId)

    if (error) return { error: error.message }

    // Recalculate track_count
    const { count } = await supabase
      .from("playlist_tracks")
      .select("*", { count: "exact", head: true })
      .eq("playlist_id", playlistId)

    await supabase
      .from("playlists")
      .update({ track_count: count ?? 0, updated_at: new Date().toISOString() })
      .eq("id", playlistId)

    return {}
  } catch {
    return { error: "Failed to remove track" }
  }
}

/**
 * Get comments on a playlist.
 */
export async function getPlaylistComments(
  playlistId: string
): Promise<PlaylistComment[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("playlist_comments")
      .select(`*, user:profiles!user_id(${PROFILE_SELECT})`)
      .eq("playlist_id", playlistId)
      .order("created_at", { ascending: false })

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
 * Add a comment to a playlist.
 */
export async function addPlaylistComment(
  playlistId: string,
  content: string
): Promise<{ comment?: PlaylistComment; error?: string }> {
  if (!isSupabaseConfigured()) return { error: "Database not configured" }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    const { data, error } = await supabase
      .from("playlist_comments")
      .insert({
        playlist_id: playlistId,
        user_id: user.id,
        content,
      })
      .select(`*, user:profiles!user_id(${PROFILE_SELECT})`)
      .single()

    if (error || !data) {
      return { error: error?.message ?? "Failed to add comment" }
    }

    return {
      comment: { ...data, user: data.user ?? undefined } as PlaylistComment,
    }
  } catch {
    return { error: "Failed to add comment" }
  }
}

/**
 * Delete a playlist comment (own comments only, RLS enforced).
 */
export async function deletePlaylistComment(
  commentId: string
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) return { error: "Database not configured" }

  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("playlist_comments")
      .delete()
      .eq("id", commentId)

    if (error) return { error: error.message }
    return {}
  } catch {
    return { error: "Failed to delete comment" }
  }
}

/**
 * Get user's own playlists (for "Add to playlist" dialog).
 */
export async function getMyPlaylists(): Promise<Playlist[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
      .from("playlists")
      .select(`*, creator:profiles!creator_id(${PROFILE_SELECT})`)
      .eq("creator_id", user.id)
      .order("updated_at", { ascending: false })

    if (error || !data) return []

    return data.map((row: any) => ({
      ...row,
      creator: row.creator ?? undefined,
    }))
  } catch {
    return []
  }
}
