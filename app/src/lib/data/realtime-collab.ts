// Realtime Collab 2.0 - Cursor presence and collaborative editing
// Session persistence backed by Supabase collaboration_sessions table

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export interface Collaborator {
  id: string
  userId: string
  displayName: string
  avatarUrl: string
  color: string
  cursor: {
    x: number
    y: number
    timestamp: number
    viewport?: {
      scrollX: number
      scrollY: number
      width: number
      height: number
    }
  }
  isActive: boolean
  lastSeen: string
  isFollowing?: boolean
}

export interface CollabOperation {
  id: string
  type: "add_track" | "delete_track" | "move_clip" | "trim_clip" | "volume_change" | "effect_add"
  userId: string
  timestamp: string
  payload: any
  acknowledged: boolean
}

export interface CollabSession {
  id: string
  mashupId: string
  hostId: string
  collaborators: Collaborator[]
  operations: CollabOperation[]
  isLocked: boolean
  followMode: {
    enabled: boolean
    leaderId: string | null
  }
  createdAt: string
  updatedAt: string
}

// Generate unique colors for collaborators
const COLLAB_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
]

let colorIndex = 0

export function getCollaboratorColor(): string {
  const color = COLLAB_COLORS[colorIndex % COLLAB_COLORS.length]
  colorIndex++
  return color
}

// Mock active sessions
const activeSessions: Map<string, CollabSession> = new Map()

export async function createCollabSession(
  mashupId: string,
  hostId: string
): Promise<CollabSession> {
  const session: CollabSession = {
    id: `session_${Date.now()}`,
    mashupId,
    hostId,
    collaborators: [],
    operations: [],
    isLocked: false,
    followMode: { enabled: false, leaderId: null },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  activeSessions.set(session.id, session)

  // Persist to Supabase so sessions survive deploys
  await persistCollabSession(session.id, mashupId, hostId)

  return session
}

export async function joinCollabSession(
  sessionId: string,
  user: { id: string; displayName: string; avatarUrl: string }
): Promise<CollabSession | null> {
  let session = activeSessions.get(sessionId)

  // If not in memory, try recovering from Supabase
  if (!session && isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const { data, error } = await supabase
        .from("collaboration_sessions")
        .select("id, title, status, started_at")
        .eq("id", sessionId)
        .eq("status", "active")
        .single()

      if (!error && data) {
        session = {
          id: data.id,
          mashupId: "",
          hostId: "",
          collaborators: [],
          operations: [],
          isLocked: false,
          followMode: { enabled: false, leaderId: null },
          createdAt: data.started_at || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        activeSessions.set(sessionId, session)
      }
    } catch {
      // Could not recover — session stays null
    }
  }

  if (!session) return null

  const existingIndex = session.collaborators.findIndex(c => c.userId === user.id)

  if (existingIndex >= 0) {
    // Reconnect
    session.collaborators[existingIndex].isActive = true
    session.collaborators[existingIndex].lastSeen = new Date().toISOString()
  } else {
    // New collaborator
    session.collaborators.push({
      id: `collab_${Date.now()}`,
      userId: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      color: getCollaboratorColor(),
      cursor: { x: 0, y: 0, timestamp: Date.now() },
      isActive: true,
      lastSeen: new Date().toISOString(),
    })
  }

  session.updatedAt = new Date().toISOString()

  // Persist participant to Supabase
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      await supabase.from("collaboration_participants").upsert(
        {
          session_id: sessionId,
          user_id: user.id,
          role: "editor",
          status: "active",
        },
        { onConflict: "session_id,user_id" },
      )
    } catch {
      // Non-critical — participant persistence failed
    }
  }

  return session
}

export async function updateCursor(
  sessionId: string,
  userId: string,
  position: { x: number; y: number }
): Promise<void> {
  const session = activeSessions.get(sessionId)
  if (!session) return

  const collaborator = session.collaborators.find(c => c.userId === userId)
  if (collaborator) {
    collaborator.cursor = { ...position, timestamp: Date.now() }
    collaborator.lastSeen = new Date().toISOString()
  }
}

export async function sendOperation(
  sessionId: string,
  operation: Omit<CollabOperation, "id" | "timestamp" | "acknowledged">
): Promise<CollabOperation> {
  const session = activeSessions.get(sessionId)
  if (!session) throw new Error("Session not found")

  const op: CollabOperation = {
    ...operation,
    id: `op_${Date.now()}`,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  }

  session.operations.push(op)
  session.updatedAt = new Date().toISOString()

  return op
}

export async function toggleFollowMode(
  sessionId: string,
  leaderId: string | null
): Promise<void> {
  const session = activeSessions.get(sessionId)
  if (!session) return

  session.followMode = {
    enabled: !!leaderId,
    leaderId,
  }
}

export async function leaveCollabSession(
  sessionId: string,
  userId: string
): Promise<void> {
  const session = activeSessions.get(sessionId)
  if (!session) return

  const collaborator = session.collaborators.find(c => c.userId === userId)
  if (collaborator) {
    collaborator.isActive = false
    collaborator.lastSeen = new Date().toISOString()
  }

  // Update participant status in Supabase
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      await supabase
        .from("collaboration_participants")
        .update({ status: "left" })
        .eq("session_id", sessionId)
        .eq("user_id", userId)
    } catch {
      // Non-critical
    }
  }
}

export async function getSessionUpdates(
  sessionId: string,
  since: string
): Promise<{
  collaborators: Collaborator[]
  operations: CollabOperation[]
}> {
  const session = activeSessions.get(sessionId)
  if (!session) {
    return { collaborators: [], operations: [] }
  }

  return {
    collaborators: session.collaborators.filter(c => c.isActive),
    operations: session.operations.filter(o => o.timestamp > since),
  }
}

// Mock current user
export const mockCurrentUser = {
  id: "user_current",
  displayName: "You",
  avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=You",
}

// Mock collaborators
export const mockCollaborators: Collaborator[] = [
  {
    id: "collab_1",
    userId: "user_001",
    displayName: "DJ Neon",
    avatarUrl: "https://placehold.co/100x100/ef4444/white?text=DN",
    color: "#ef4444",
    cursor: { x: 150, y: 200, timestamp: Date.now() },
    isActive: true,
    lastSeen: new Date().toISOString(),
  },
  {
    id: "collab_2",
    userId: "user_002",
    displayName: "BeatMaster",
    avatarUrl: "https://placehold.co/100x100/3b82f6/white?text=BM",
    color: "#3b82f6",
    cursor: { x: 400, y: 300, timestamp: Date.now() },
    isActive: true,
    lastSeen: new Date().toISOString(),
  },
]

// ---------------------------------------------------------------------------
// Supabase-backed session persistence
// ---------------------------------------------------------------------------

export async function persistCollabSession(
  sessionId: string,
  mashupId: string,
  hostId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { error } = await supabase.from("collaboration_sessions").upsert(
      {
        id: sessionId,
        title: `Collab ${sessionId.slice(0, 8)}`,
        status: "active",
      },
      { onConflict: "id" },
    )

    if (error) return false

    // Add host as participant
    await supabase.from("collaboration_participants").upsert(
      {
        session_id: sessionId,
        user_id: hostId,
        role: "owner",
      },
      { onConflict: "session_id,user_id" },
    )

    return true
  } catch {
    return false
  }
}

export async function getActiveCollabSessions(
  userId: string,
): Promise<Array<{ id: string; title: string; participantCount: number; createdAt: string }>> {
  if (!isSupabaseConfigured()) return []

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data, error } = await supabase
      .from("collaboration_participants")
      .select("session_id, collaboration_sessions(id, title, status, started_at)")
      .eq("user_id", userId)

    if (error || !data) return []

    return (data as Record<string, unknown>[])
      .map((row) => {
        const session = row.collaboration_sessions as Record<string, unknown> | null
        if (!session || session.status !== "active") return null
        return {
          id: session.id as string,
          title: (session.title ?? "") as string,
          participantCount: 0,
          createdAt: (session.started_at ?? "") as string,
        }
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)
  } catch {
    return []
  }
}
