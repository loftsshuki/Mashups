import { createClient } from "@/lib/supabase/client"
import type {
  StudioMarker,
  StudioNote,
  StudioSessionState,
  StudioSnapshot,
} from "@/lib/data/studio-collab"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let cachedUserId: string | null | undefined

async function getUserId() {
  if (cachedUserId !== undefined) return cachedUserId
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    cachedUserId = user?.id ?? null
    return cachedUserId
  } catch {
    cachedUserId = null
    return null
  }
}

export async function loadStudioStateFromDb(
  sessionKey: string,
): Promise<StudioSessionState | null> {
  if (!isSupabaseConfigured()) return null

  try {
    const supabase = createClient()
    const [markersResponse, notesResponse, snapshotsResponse] = await Promise.all([
      supabase
        .from("studio_markers")
        .select("*")
        .eq("session_key", sessionKey)
        .order("created_at", { ascending: true }),
      supabase
        .from("studio_notes")
        .select("*")
        .eq("session_key", sessionKey)
        .order("created_at", { ascending: false }),
      supabase
        .from("studio_snapshots")
        .select("*")
        .eq("session_key", sessionKey)
        .order("created_at", { ascending: false }),
    ])

    if (markersResponse.error || notesResponse.error || snapshotsResponse.error) {
      return null
    }

    const markers: StudioMarker[] = ((markersResponse.data as Record<string, unknown>[] | null) ?? [])
      .map((row) => ({
        id:
          typeof row.external_id === "string"
            ? row.external_id
            : typeof row.id === "string"
              ? row.id
              : "",
        label: typeof row.label === "string" ? row.label : "Cue",
        atSec: typeof row.at_sec === "number" ? row.at_sec : 0,
        createdAt:
          typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
      }))
      .filter((row) => Boolean(row.id))

    const notes: StudioNote[] = ((notesResponse.data as Record<string, unknown>[] | null) ?? [])
      .map((row) => ({
        id:
          typeof row.external_id === "string"
            ? row.external_id
            : typeof row.id === "string"
              ? row.id
              : "",
        text: typeof row.note_text === "string" ? row.note_text : "",
        atSec: typeof row.at_sec === "number" ? row.at_sec : 0,
        createdAt:
          typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
        author: typeof row.author_alias === "string" ? row.author_alias : "Producer",
      }))
      .filter((row) => Boolean(row.id) && Boolean(row.text))

    const snapshots: StudioSnapshot[] = ((snapshotsResponse.data as Record<string, unknown>[] | null) ?? [])
      .map((row) => ({
        id:
          typeof row.external_id === "string"
            ? row.external_id
            : typeof row.id === "string"
              ? row.id
              : "",
        name: typeof row.name === "string" ? row.name : "Snapshot",
        createdAt:
          typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
        bpm: typeof row.bpm === "number" ? row.bpm : 120,
        playhead: typeof row.playhead === "number" ? row.playhead : 0,
        isPlaying: Boolean(row.is_playing),
        markerCount: typeof row.marker_count === "number" ? row.marker_count : 0,
        noteCount: typeof row.note_count === "number" ? row.note_count : 0,
      }))
      .filter((row) => Boolean(row.id))

    return { markers, notes, snapshots }
  } catch {
    return null
  }
}

export async function saveStudioMarkerToDb(
  sessionKey: string,
  marker: StudioMarker,
  authorAlias: string,
): Promise<void> {
  if (!isSupabaseConfigured()) return
  try {
    const supabase = createClient()
    const userId = await getUserId()
    await supabase.from("studio_markers").insert({
      external_id: marker.id,
      session_key: sessionKey,
      user_id: userId,
      author_alias: authorAlias,
      label: marker.label,
      at_sec: marker.atSec,
      created_at: marker.createdAt,
    })
  } catch {
    // Non-blocking persistence.
  }
}

export async function saveStudioNoteToDb(
  sessionKey: string,
  note: StudioNote,
): Promise<void> {
  if (!isSupabaseConfigured()) return
  try {
    const supabase = createClient()
    const userId = await getUserId()
    await supabase.from("studio_notes").insert({
      external_id: note.id,
      session_key: sessionKey,
      user_id: userId,
      author_alias: note.author,
      note_text: note.text,
      at_sec: note.atSec,
      created_at: note.createdAt,
    })
  } catch {
    // Non-blocking persistence.
  }
}

export async function saveStudioSnapshotToDb(
  sessionKey: string,
  snapshot: StudioSnapshot,
  authorAlias: string,
): Promise<void> {
  if (!isSupabaseConfigured()) return
  try {
    const supabase = createClient()
    const userId = await getUserId()
    await supabase.from("studio_snapshots").insert({
      external_id: snapshot.id,
      session_key: sessionKey,
      user_id: userId,
      author_alias: authorAlias,
      name: snapshot.name,
      bpm: snapshot.bpm,
      playhead: snapshot.playhead,
      is_playing: snapshot.isPlaying,
      marker_count: snapshot.markerCount,
      note_count: snapshot.noteCount,
      created_at: snapshot.createdAt,
    })
  } catch {
    // Non-blocking persistence.
  }
}

