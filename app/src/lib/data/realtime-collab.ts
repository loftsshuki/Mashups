// Realtime Collab 2.0 - Cursor presence and collaborative editing

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
  return session
}

export async function joinCollabSession(
  sessionId: string,
  user: { id: string; displayName: string; avatarUrl: string }
): Promise<CollabSession | null> {
  const session = activeSessions.get(sessionId)
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
