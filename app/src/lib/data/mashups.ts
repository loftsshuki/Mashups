import { mockMashups, getMockMashup, type MockMashup } from "@/lib/mock-data"
import type { Mashup } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/** Convert a MockMashup into the canonical Mashup shape */
function mockToMashup(m: MockMashup): Mashup {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    creator_id: m.creator.username,
    audio_url: m.audioUrl,
    cover_image_url: m.coverUrl,
    genre: m.genre,
    bpm: m.bpm,
    duration: m.duration,
    play_count: m.playCount,
    is_published: true,
    created_at: m.createdAt,
    updated_at: m.createdAt,
    creator: {
      id: m.creator.username,
      username: m.creator.username,
      display_name: m.creator.displayName,
      avatar_url: m.creator.avatarUrl,
      bio: null,
      created_at: m.createdAt,
    },
    source_tracks: m.sourceTracks.map((t, i) => ({
      id: `${m.id}-track-${i}`,
      mashup_id: m.id,
      title: t.title,
      artist: t.artist,
      position: i,
    })),
    like_count: m.likeCount,
    comment_count: m.commentCount,
  }
}

/**
 * Fetch all published mashups.
 * Falls back to mock data when Supabase is not configured or the query fails.
 */
export async function getMashups(): Promise<Mashup[]> {
  if (!isSupabaseConfigured()) {
    return mockMashups.map(mockToMashup)
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("mashups")
      .select(
        `
        *,
        creator:profiles!creator_id(*),
        source_tracks(*),
        like_count:likes(count),
        comment_count:comments(count)
      `
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false })

    if (error || !data) {
      console.error("Supabase getMashups error, falling back to mock:", error)
      return mockMashups.map(mockToMashup)
    }

    return data.map((row: any) => ({
      ...row,
      creator: row.creator ?? undefined,
      source_tracks: row.source_tracks ?? undefined,
      like_count: row.like_count?.[0]?.count ?? 0,
      comment_count: row.comment_count?.[0]?.count ?? 0,
    }))
  } catch {
    return mockMashups.map(mockToMashup)
  }
}

/**
 * Fetch a single mashup by its ID.
 */
export async function getMashupById(id: string): Promise<Mashup | null> {
  if (!isSupabaseConfigured()) {
    const mock = getMockMashup(id)
    return mock ? mockToMashup(mock) : null
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("mashups")
      .select(
        `
        *,
        creator:profiles!creator_id(*),
        source_tracks(*),
        like_count:likes(count),
        comment_count:comments(count)
      `
      )
      .eq("id", id)
      .single()

    if (error || !data) {
      console.error("Supabase getMashupById error, falling back to mock:", error)
      const mock = getMockMashup(id)
      return mock ? mockToMashup(mock) : null
    }

    return {
      ...data,
      creator: data.creator ?? undefined,
      source_tracks: data.source_tracks ?? undefined,
      like_count: data.like_count?.[0]?.count ?? 0,
      comment_count: data.comment_count?.[0]?.count ?? 0,
    }
  } catch {
    const mock = getMockMashup(id)
    return mock ? mockToMashup(mock) : null
  }
}

/**
 * Fetch trending mashups sorted by play_count descending.
 */
export async function getTrendingMashups(limit = 6): Promise<Mashup[]> {
  if (!isSupabaseConfigured()) {
    return [...mockMashups]
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit)
      .map(mockToMashup)
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("mashups")
      .select(
        `
        *,
        creator:profiles!creator_id(*),
        source_tracks(*),
        like_count:likes(count),
        comment_count:comments(count)
      `
      )
      .eq("is_published", true)
      .order("play_count", { ascending: false })
      .limit(limit)

    if (error || !data) {
      console.error("Supabase getTrendingMashups error, falling back to mock:", error)
      return [...mockMashups]
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, limit)
        .map(mockToMashup)
    }

    return data.map((row: any) => ({
      ...row,
      creator: row.creator ?? undefined,
      source_tracks: row.source_tracks ?? undefined,
      like_count: row.like_count?.[0]?.count ?? 0,
      comment_count: row.comment_count?.[0]?.count ?? 0,
    }))
  } catch {
    return [...mockMashups]
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit)
      .map(mockToMashup)
  }
}

/**
 * Fetch mashups by a specific creator.
 */
export async function getMashupsByCreator(creatorId: string): Promise<Mashup[]> {
  if (!isSupabaseConfigured()) {
    return mockMashups
      .filter((m) => m.creator.username === creatorId)
      .map(mockToMashup)
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("mashups")
      .select(
        `
        *,
        creator:profiles!creator_id(*),
        source_tracks(*),
        like_count:likes(count),
        comment_count:comments(count)
      `
      )
      .eq("creator_id", creatorId)
      .eq("is_published", true)
      .order("created_at", { ascending: false })

    if (error || !data) {
      console.error("Supabase getMashupsByCreator error, falling back to mock:", error)
      return mockMashups
        .filter((m) => m.creator.username === creatorId)
        .map(mockToMashup)
    }

    return data.map((row: any) => ({
      ...row,
      creator: row.creator ?? undefined,
      source_tracks: row.source_tracks ?? undefined,
      like_count: row.like_count?.[0]?.count ?? 0,
      comment_count: row.comment_count?.[0]?.count ?? 0,
    }))
  } catch {
    return mockMashups
      .filter((m) => m.creator.username === creatorId)
      .map(mockToMashup)
  }
}
