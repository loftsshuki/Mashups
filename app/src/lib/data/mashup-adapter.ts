import type { MockMashup } from "@/lib/mock-data"

function stringOr(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function normalizeCount(value: unknown): number {
  if (typeof value === "number") return value
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0]
    if (typeof first === "object" && first !== null) {
      const row = first as Record<string, unknown>
      return numberOr(row.count, 0)
    }
  }
  return 0
}

function normalizeCreator(value: unknown, mashupId: string) {
  if (typeof value === "object" && value !== null) {
    const row = value as Record<string, unknown>
    const username = stringOr(row.username, stringOr(row.id, `creator-${mashupId}`))
    return {
      username,
      displayName: stringOr(row.display_name, username),
      avatarUrl: stringOr(
        row.avatar_url,
        `https://placehold.co/100x100/7c3aed/white?text=${username.slice(0, 2).toUpperCase()}`,
      ),
    }
  }

  return {
    username: `creator-${mashupId}`,
    displayName: "Unknown Creator",
    avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=MC",
  }
}

function normalizeSourceTracks(value: unknown): MockMashup["sourceTracks"] {
  if (!Array.isArray(value)) return []

  return value
    .map((entry) => {
      if (typeof entry !== "object" || entry === null) return null
      const row = entry as Record<string, unknown>
      return {
        title: stringOr(row.title, "Untitled Source"),
        artist: stringOr(row.artist, "Unknown Artist"),
      }
    })
    .filter((entry): entry is MockMashup["sourceTracks"][number] => Boolean(entry))
}

export function mapRowToMockMashup(row: Record<string, unknown>): MockMashup {
  const id = stringOr(row.id, "mashup")
  const createdAt = stringOr(row.created_at, new Date().toISOString())
  const sourceTracks = normalizeSourceTracks(row.source_tracks)

  return {
    id,
    title: stringOr(row.title, "Untitled Mashup"),
    description: stringOr(row.description, "No description yet."),
    creator: normalizeCreator(row.creator, id),
    coverUrl: stringOr(
      row.cover_image_url,
      "https://placehold.co/400x400/7c3aed/white?text=Mashup",
    ),
    audioUrl: stringOr(row.audio_url, ""),
    genre: stringOr(row.genre, "Unknown"),
    bpm: numberOr(row.bpm, 120),
    duration: numberOr(row.duration, 180),
    playCount: numberOr(row.play_count, 0),
    likeCount: normalizeCount(row.like_count),
    commentCount: normalizeCount(row.comment_count),
    createdAt,
    sourceTracks:
      sourceTracks.length > 0
        ? sourceTracks
        : [{ title: "Unknown Source", artist: "Unknown Artist" }],
  }
}
