import {
  mockCollaborationSessions,
  type CollaborationSession,
} from "@/lib/data/collaboration"

export async function fetchStudioSessions(): Promise<CollaborationSession[]> {
  try {
    const response = await fetch("/api/studio/sessions", {
      method: "GET",
      cache: "no-store",
    })
    if (!response.ok) return mockCollaborationSessions

    const payload = (await response.json()) as { sessions?: CollaborationSession[] }
    if (!Array.isArray(payload.sessions) || payload.sessions.length === 0) {
      return mockCollaborationSessions
    }
    return payload.sessions
  } catch {
    return mockCollaborationSessions
  }
}

export async function createStudioSession(
  title: string,
): Promise<CollaborationSession | null> {
  try {
    const response = await fetch("/api/studio/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
    if (!response.ok) return null

    const payload = (await response.json()) as { session?: CollaborationSession }
    return payload.session ?? null
  } catch {
    return null
  }
}
