export interface StudioMarker {
  id: string
  label: string
  atSec: number
  createdAt: string
}

export interface StudioNote {
  id: string
  text: string
  atSec: number
  createdAt: string
  author: string
}

export interface StudioSnapshot {
  id: string
  name: string
  createdAt: string
  bpm: number
  playhead: number
  isPlaying: boolean
  markerCount: number
  noteCount: number
}

export interface StudioSessionState {
  markers: StudioMarker[]
  notes: StudioNote[]
  snapshots: StudioSnapshot[]
}

const STORAGE_KEY_PREFIX = "mashups_studio_session_state"
const USER_ALIAS_KEY = "mashups_studio_alias"

function getStorageKey(sessionId: string): string {
  return `${STORAGE_KEY_PREFIX}:${sessionId}`
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function parseMarkers(value: unknown): StudioMarker[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((entry): entry is Record<string, unknown> => isObject(entry))
    .map((entry) => ({
      id: typeof entry.id === "string" ? entry.id : "",
      label: typeof entry.label === "string" ? entry.label : "Cue",
      atSec: typeof entry.atSec === "number" ? entry.atSec : 0,
      createdAt:
        typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
    }))
    .filter((entry) => Boolean(entry.id))
}

function parseNotes(value: unknown): StudioNote[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((entry): entry is Record<string, unknown> => isObject(entry))
    .map((entry) => ({
      id: typeof entry.id === "string" ? entry.id : "",
      text: typeof entry.text === "string" ? entry.text : "",
      atSec: typeof entry.atSec === "number" ? entry.atSec : 0,
      createdAt:
        typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
      author: typeof entry.author === "string" ? entry.author : "Producer",
    }))
    .filter((entry) => Boolean(entry.id) && Boolean(entry.text))
}

function parseSnapshots(value: unknown): StudioSnapshot[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((entry): entry is Record<string, unknown> => isObject(entry))
    .map((entry) => ({
      id: typeof entry.id === "string" ? entry.id : "",
      name: typeof entry.name === "string" ? entry.name : "Snapshot",
      createdAt:
        typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
      bpm: typeof entry.bpm === "number" ? entry.bpm : 120,
      playhead: typeof entry.playhead === "number" ? entry.playhead : 0,
      isPlaying: Boolean(entry.isPlaying),
      markerCount: typeof entry.markerCount === "number" ? entry.markerCount : 0,
      noteCount: typeof entry.noteCount === "number" ? entry.noteCount : 0,
    }))
    .filter((entry) => Boolean(entry.id))
}

export function loadStudioSessionState(sessionId: string): StudioSessionState {
  if (typeof window === "undefined") return { markers: [], notes: [], snapshots: [] }

  try {
    const raw = window.localStorage.getItem(getStorageKey(sessionId))
    if (!raw) return { markers: [], notes: [], snapshots: [] }
    const parsed = JSON.parse(raw) as Record<string, unknown>

    return {
      markers: parseMarkers(parsed.markers).sort((a, b) => a.atSec - b.atSec),
      notes: parseNotes(parsed.notes).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      snapshots: parseSnapshots(parsed.snapshots).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    }
  } catch {
    return { markers: [], notes: [], snapshots: [] }
  }
}

export function saveStudioSessionState(
  sessionId: string,
  nextState: StudioSessionState,
): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(getStorageKey(sessionId), JSON.stringify(nextState))
  } catch {
    // Ignore storage write failures.
  }
}

export function getOrCreateStudioAlias(): string {
  if (typeof window === "undefined") return "Producer"

  try {
    const existing = window.localStorage.getItem(USER_ALIAS_KEY)
    if (existing) return existing
    const alias = `Producer-${Math.floor(Math.random() * 900 + 100)}`
    window.localStorage.setItem(USER_ALIAS_KEY, alias)
    return alias
  } catch {
    return "Producer"
  }
}

export function generateStudioEntityId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function createSnapshotName(existingCount: number): string {
  return `Version ${existingCount + 1}`
}

