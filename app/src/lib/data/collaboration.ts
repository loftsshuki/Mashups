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
