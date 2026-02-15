export interface CollaborationSession {
  id: string
  title: string
  status: "active" | "paused" | "ended"
  participants: number
  startedAt: string
}

export interface CollaborationMarker {
  id: string
  sessionId: string
  label: string
  atSec: number
  createdAt: string
}

export interface CollaborationNote {
  id: string
  sessionId: string
  author: string
  text: string
  atSec: number
  createdAt: string
}

export interface CollaborationSnapshot {
  id: string
  sessionId: string
  name: string
  bpm: number
  playhead: number
  markerCount: number
  noteCount: number
  createdAt: string
}

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ---------------------------------------------------------------------------
// Mock data (fallback)
// ---------------------------------------------------------------------------

export const mockCollaborationSessions: CollaborationSession[] = [
  {
    id: "sess-001",
    title: "Nightwave Project",
    status: "active",
    participants: 3,
    startedAt: "2026-02-13T16:20:00Z",
  },
  {
    id: "sess-002",
    title: "Downtempo Cut v2",
    status: "paused",
    participants: 2,
    startedAt: "2026-02-12T10:00:00Z",
  },
]

export const mockCollaborationMarkers: CollaborationMarker[] = [
  {
    id: "marker-001",
    sessionId: "sess-001",
    label: "Hook Drop",
    atSec: 24.2,
    createdAt: "2026-02-13T16:29:00Z",
  },
  {
    id: "marker-002",
    sessionId: "sess-001",
    label: "Vocal Chop Entry",
    atSec: 46.8,
    createdAt: "2026-02-13T16:33:00Z",
  },
]

export const mockCollaborationNotes: CollaborationNote[] = [
  {
    id: "note-001",
    sessionId: "sess-001",
    author: "Producer-452",
    text: "Tighten sidechain before drop.",
    atSec: 24.2,
    createdAt: "2026-02-13T16:34:00Z",
  },
]

export const mockCollaborationSnapshots: CollaborationSnapshot[] = [
  {
    id: "snapshot-001",
    sessionId: "sess-001",
    name: "Version 1",
    bpm: 120,
    playhead: 42.3,
    markerCount: 2,
    noteCount: 1,
    createdAt: "2026-02-13T16:38:00Z",
  },
]

// ---------------------------------------------------------------------------
// Supabase-backed operations
// ---------------------------------------------------------------------------

export async function getCollaborationSessions(options?: {
  status?: CollaborationSession["status"]
  limit?: number
}): Promise<CollaborationSession[]> {
  if (!isSupabaseConfigured()) {
    let filtered = [...mockCollaborationSessions]
    if (options?.status) filtered = filtered.filter((s) => s.status === options.status)
    if (options?.limit) filtered = filtered.slice(0, options.limit)
    return filtered
  }

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    let query = supabase
      .from("collaboration_sessions")
      .select("id, title, status, started_at, participant_count:collaboration_participants(count)")

    if (options?.status) query = query.eq("status", options.status)
    query = query.order("started_at", { ascending: false })
    if (options?.limit) query = query.limit(options.limit)

    const { data, error } = await query
    if (error || !data) return mockCollaborationSessions

    return data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      title: row.title as string,
      status: row.status as CollaborationSession["status"],
      participants: Array.isArray(row.participant_count) && row.participant_count[0]
        ? (row.participant_count[0] as { count: number }).count
        : 0,
      startedAt: row.started_at as string,
    }))
  } catch {
    return mockCollaborationSessions
  }
}

export async function getCollaborationSessionById(
  id: string,
): Promise<CollaborationSession | null> {
  if (!isSupabaseConfigured()) {
    return mockCollaborationSessions.find((s) => s.id === id) ?? null
  }

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data, error } = await supabase
      .from("collaboration_sessions")
      .select("id, title, status, started_at, participant_count:collaboration_participants(count)")
      .eq("id", id)
      .single()

    if (error || !data) return mockCollaborationSessions.find((s) => s.id === id) ?? null

    const row = data as Record<string, unknown>
    return {
      id: row.id as string,
      title: row.title as string,
      status: row.status as CollaborationSession["status"],
      participants: Array.isArray(row.participant_count) && row.participant_count[0]
        ? (row.participant_count[0] as { count: number }).count
        : 0,
      startedAt: row.started_at as string,
    }
  } catch {
    return mockCollaborationSessions.find((s) => s.id === id) ?? null
  }
}

export async function createCollaborationSession(
  title: string,
  userId: string,
): Promise<CollaborationSession | null> {
  if (!isSupabaseConfigured()) return null

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data: session, error: sessionError } = await supabase
      .from("collaboration_sessions")
      .insert({ title, status: "active" })
      .select("id, title, status, started_at")
      .single()

    if (sessionError || !session) return null

    await supabase.from("collaboration_participants").insert({
      session_id: session.id,
      user_id: userId,
      role: "owner",
    })

    return {
      id: session.id,
      title: session.title,
      status: session.status,
      participants: 1,
      startedAt: session.started_at,
    }
  } catch {
    return null
  }
}

export async function joinCollaborationSession(
  sessionId: string,
  userId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { error } = await supabase.from("collaboration_participants").insert({
      session_id: sessionId,
      user_id: userId,
      role: "collaborator",
    })

    return !error
  } catch {
    return false
  }
}

export function getSessionCollabSummary(sessionId: string) {
  const markerCount = mockCollaborationMarkers.filter(
    (marker) => marker.sessionId === sessionId,
  ).length
  const noteCount = mockCollaborationNotes.filter(
    (note) => note.sessionId === sessionId,
  ).length
  const snapshotCount = mockCollaborationSnapshots.filter(
    (snapshot) => snapshot.sessionId === sessionId,
  ).length

  return { markerCount, noteCount, snapshotCount }
}
