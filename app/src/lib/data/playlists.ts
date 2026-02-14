import { createClient } from "@/lib/supabase/client"
import type {
  Playlist,
  PlaylistTrack,
  PlaylistCollaborator,
  Profile,
  Mashup,
} from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const mockProfiles: Record<string, Profile> = {
  "user-001": {
    id: "user-001",
    username: "beatmaker",
    display_name: "BeatMaker",
    avatar_url: null,
    bio: null,
    created_at: "2026-01-01T00:00:00Z",
  },
  "user-002": {
    id: "user-002",
    username: "djsoul",
    display_name: "DJ Soul",
    avatar_url: null,
    bio: null,
    created_at: "2026-01-01T00:00:00Z",
  },
}

const mockPlaylists: Playlist[] = [
  {
    id: "pl-001",
    title: "Chill Vibes Mix",
    description: "Relaxing mashups for winding down",
    cover_image_url: null,
    creator_id: "user-001",
    is_collaborative: true,
    is_public: true,
    track_count: 8,
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-02-10T18:30:00Z",
    creator: mockProfiles["user-001"],
  },
  {
    id: "pl-002",
    title: "Workout Bangers",
    description: "High energy mashups to keep you moving",
    cover_image_url: null,
    creator_id: "user-002",
    is_collaborative: false,
    is_public: true,
    track_count: 12,
    created_at: "2026-01-20T14:00:00Z",
    updated_at: "2026-02-08T09:15:00Z",
    creator: mockProfiles["user-002"],
  },
  {
    id: "pl-003",
    title: "Late Night Sessions",
    description: "Deep cuts and smooth transitions for the after hours",
    cover_image_url: null,
    creator_id: "user-001",
    is_collaborative: true,
    is_public: true,
    track_count: 5,
    created_at: "2026-02-01T22:00:00Z",
    updated_at: "2026-02-12T01:45:00Z",
    creator: mockProfiles["user-001"],
  },
]

const mockPlaylistTracks: PlaylistTrack[] = [
  {
    id: "pt-001",
    playlist_id: "pl-001",
    mashup_id: "mashup-001",
    added_by: "user-001",
    position: 0,
    added_at: "2026-01-15T10:05:00Z",
    mashup: {
      id: "mashup-001",
      title: "Sunset Blend",
      description: null,
      creator_id: "user-001",
      audio_url: "/audio/mock.mp3",
      cover_image_url: "https://placehold.co/300x300/f97316/white?text=SB",
      genre: "Lo-fi",
      bpm: 85,
      duration: 214,
      play_count: 1240,
      is_published: true,
      created_at: "2026-01-10T08:00:00Z",
      updated_at: "2026-01-10T08:00:00Z",
    },
    added_by_user: mockProfiles["user-001"],
  },
  {
    id: "pt-002",
    playlist_id: "pl-001",
    mashup_id: "mashup-002",
    added_by: "user-002",
    position: 1,
    added_at: "2026-01-16T12:00:00Z",
    mashup: {
      id: "mashup-002",
      title: "Midnight Frequencies",
      description: null,
      creator_id: "user-002",
      audio_url: "/audio/mock.mp3",
      cover_image_url: "https://placehold.co/300x300/8b5cf6/white?text=MF",
      genre: "Chillwave",
      bpm: 90,
      duration: 187,
      play_count: 890,
      is_published: true,
      created_at: "2026-01-12T15:00:00Z",
      updated_at: "2026-01-12T15:00:00Z",
    },
    added_by_user: mockProfiles["user-002"],
  },
  {
    id: "pt-003",
    playlist_id: "pl-001",
    mashup_id: "mashup-003",
    added_by: "user-001",
    position: 2,
    added_at: "2026-01-18T09:30:00Z",
    mashup: {
      id: "mashup-003",
      title: "Ocean Drive Remix",
      description: null,
      creator_id: "user-001",
      audio_url: "/audio/mock.mp3",
      cover_image_url: "https://placehold.co/300x300/06b6d4/white?text=OD",
      genre: "Synthwave",
      bpm: 110,
      duration: 246,
      play_count: 2150,
      is_published: true,
      created_at: "2026-01-08T20:00:00Z",
      updated_at: "2026-01-08T20:00:00Z",
    },
    added_by_user: mockProfiles["user-001"],
  },
  {
    id: "pt-004",
    playlist_id: "pl-001",
    mashup_id: "mashup-004",
    added_by: "user-002",
    position: 3,
    added_at: "2026-01-20T16:45:00Z",
    mashup: {
      id: "mashup-004",
      title: "Velvet Grooves",
      description: null,
      creator_id: "user-002",
      audio_url: "/audio/mock.mp3",
      cover_image_url: "https://placehold.co/300x300/ec4899/white?text=VG",
      genre: "Neo-Soul",
      bpm: 95,
      duration: 198,
      play_count: 670,
      is_published: true,
      created_at: "2026-01-14T11:00:00Z",
      updated_at: "2026-01-14T11:00:00Z",
    },
    added_by_user: mockProfiles["user-002"],
  },
]

export async function getPlaylists(options?: {
  creatorId?: string
  publicOnly?: boolean
}): Promise<Playlist[]> {
  if (!isSupabaseConfigured()) {
    let result = mockPlaylists
    if (options?.creatorId) {
      result = result.filter((p) => p.creator_id === options.creatorId)
    }
    if (options?.publicOnly) {
      result = result.filter((p) => p.is_public)
    }
    return result
  }

  try {
    const supabase = createClient()
    let query = supabase
      .from("playlists")
      .select("*, creator:profiles!creator_id(*)")
      .order("updated_at", { ascending: false })

    if (options?.creatorId) {
      query = query.eq("creator_id", options.creatorId)
    }
    if (options?.publicOnly) {
      query = query.eq("is_public", true)
    }

    const { data, error } = await query

    if (error || !data) return []
    return data as Playlist[]
  } catch {
    return []
  }
}

export async function getPlaylistById(
  id: string,
): Promise<Playlist | null> {
  if (!isSupabaseConfigured()) {
    const playlist = mockPlaylists.find((p) => p.id === id)
    if (!playlist) return null
    return { ...playlist, creator: mockProfiles[playlist.creator_id] }
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("playlists")
      .select("*, creator:profiles!creator_id(*)")
      .eq("id", id)
      .single()

    if (error || !data) return null
    return data as Playlist
  } catch {
    return null
  }
}

export async function createPlaylist(
  title: string,
  description?: string,
  isCollaborative?: boolean,
): Promise<{ playlist?: Playlist; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Database not configured" }
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: "You must be logged in to create a playlist" }

    const { data, error } = await supabase
      .from("playlists")
      .insert({
        title,
        description: description ?? null,
        is_collaborative: isCollaborative ?? false,
        is_public: true,
        creator_id: user.id,
        track_count: 0,
      })
      .select("*, creator:profiles!creator_id(*)")
      .single()

    if (error) return { error: error.message }
    return { playlist: data as Playlist }
  } catch {
    return { error: "Failed to create playlist" }
  }
}

export async function updatePlaylist(
  id: string,
  updates: Partial<
    Pick<
      Playlist,
      "title" | "description" | "is_collaborative" | "is_public" | "cover_image_url"
    >
  >,
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Database not configured" }
  }

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

export async function deletePlaylist(
  id: string,
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Database not configured" }
  }

  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("playlists")
      .delete()
      .eq("id", id)

    if (error) return { error: error.message }
    return {}
  } catch {
    return { error: "Failed to delete playlist" }
  }
}

export async function getPlaylistTracks(
  playlistId: string,
): Promise<PlaylistTrack[]> {
  if (!isSupabaseConfigured())
    return mockPlaylistTracks.filter((t) => t.playlist_id === playlistId)

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("playlist_tracks")
      .select(
        "*, mashup:mashups!mashup_id(*, creator:profiles!creator_id(*)), added_by_user:profiles!added_by(*)",
      )
      .eq("playlist_id", playlistId)
      .order("position", { ascending: true })

    if (error || !data) return []
    return data as PlaylistTrack[]
  } catch {
    return []
  }
}

export async function addTrackToPlaylist(
  playlistId: string,
  mashupId: string,
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Database not configured" }
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: "You must be logged in to add tracks" }

    // Get current max position
    const { data: existing } = await supabase
      .from("playlist_tracks")
      .select("position")
      .eq("playlist_id", playlistId)
      .order("position", { ascending: false })
      .limit(1)

    const nextPosition = existing?.length ? existing[0].position + 1 : 0

    const { error: insertError } = await supabase
      .from("playlist_tracks")
      .insert({
        playlist_id: playlistId,
        mashup_id: mashupId,
        added_by: user.id,
        position: nextPosition,
      })

    if (insertError) return { error: insertError.message }

    // Increment track_count on the playlist
    const { error: updateError } = await supabase.rpc(
      "increment_playlist_track_count",
      { playlist_id: playlistId },
    )

    if (updateError) {
      // Fallback: manual increment
      const { data: playlist } = await supabase
        .from("playlists")
        .select("track_count")
        .eq("id", playlistId)
        .single()

      if (playlist) {
        await supabase
          .from("playlists")
          .update({
            track_count: playlist.track_count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", playlistId)
      }
    }

    return {}
  } catch {
    return { error: "Failed to add track to playlist" }
  }
}

export async function removeTrackFromPlaylist(
  playlistId: string,
  mashupId: string,
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Database not configured" }
  }

  try {
    const supabase = createClient()

    const { error: deleteError } = await supabase
      .from("playlist_tracks")
      .delete()
      .eq("playlist_id", playlistId)
      .eq("mashup_id", mashupId)

    if (deleteError) return { error: deleteError.message }

    // Decrement track_count on the playlist
    const { error: updateError } = await supabase.rpc(
      "decrement_playlist_track_count",
      { playlist_id: playlistId },
    )

    if (updateError) {
      // Fallback: manual decrement
      const { data: playlist } = await supabase
        .from("playlists")
        .select("track_count")
        .eq("id", playlistId)
        .single()

      if (playlist) {
        await supabase
          .from("playlists")
          .update({
            track_count: Math.max(0, playlist.track_count - 1),
            updated_at: new Date().toISOString(),
          })
          .eq("id", playlistId)
      }
    }

    return {}
  } catch {
    return { error: "Failed to remove track from playlist" }
  }
}
