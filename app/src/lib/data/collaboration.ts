export interface CollaborationSession {
  id: string
  title: string
  status: "active" | "paused" | "ended"
  participants: number
  startedAt: string
}

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
