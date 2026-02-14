"use client"

import { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from "react"
import {
  BookmarkPlus,
  Clock3,
  Copy,
  Dot,
  Eye,
  MessageSquarePlus,
  PauseCircle,
  Radio,
  Save,
  UserPlus,
  Users,
  Mic,
  MousePointer2,
  Music,
  Settings,
} from "lucide-react"

// Lazy load heavy components for performance
const CursorPresence = lazy(() => import("@/components/collab/cursor-presence").then(m => ({ default: m.CursorPresence })))
const VoiceChatPanel = lazy(() => import("@/components/voice/voice-chat-panel").then(m => ({ default: m.VoiceChatPanel })))
const SpectralWaveform = lazy(() => import("@/components/waveform/spectral-waveform").then(m => ({ default: m.SpectralWaveform })))
const MIDIControllerPanel = lazy(() => import("@/components/create/midi-controller-panel").then(m => ({ default: m.MIDIControllerPanel })))

import {
  NeonGrid,
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import {
  type CollaborationSession,
  getSessionCollabSummary,
  mockCollaborationSessions,
} from "@/lib/data/collaboration"
import {
  createSnapshotName,
  generateStudioEntityId,
  getOrCreateStudioAlias,
  loadStudioSessionState,
  saveStudioSessionState,
  type StudioMarker,
  type StudioNote,
  type StudioSnapshot,
} from "@/lib/data/studio-collab"
import {
  loadStudioStateFromDb,
  saveStudioMarkerToDb,
  saveStudioNoteToDb,
  saveStudioSnapshotToDb,
} from "@/lib/data/studio-persistence"
import {
  createStudioSession,
  fetchStudioSessions,
} from "@/lib/data/studio-sessions"
import { createClient } from "@/lib/supabase/client"

type StudioBroadcastEvent =
  | "studio_state"
  | "studio_marker"
  | "studio_note"
  | "studio_snapshot"

type RealtimePayload = { payload?: Record<string, unknown> }

type StudioRealtimeChannel = {
  send: (payload: {
    type: "broadcast"
    event: StudioBroadcastEvent
    payload: Record<string, unknown>
  }) => Promise<void>
  on: (
    event: "presence" | "broadcast",
    opts: { event: string },
    callback: (payload?: RealtimePayload) => void,
  ) => unknown
  subscribe: (callback: (status: string) => void) => {
    track: (payload: Record<string, unknown>) => Promise<void>
    send: (payload: {
      type: "broadcast"
      event: StudioBroadcastEvent
      payload: Record<string, unknown>
    }) => Promise<void>
  }
  presenceState: () => Record<string, unknown[]>
}

function isStudioMarker(value: unknown): value is StudioMarker {
  if (typeof value !== "object" || value === null) return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.id === "string" &&
    typeof entry.label === "string" &&
    typeof entry.atSec === "number" &&
    typeof entry.createdAt === "string"
  )
}

function isStudioNote(value: unknown): value is StudioNote {
  if (typeof value !== "object" || value === null) return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.id === "string" &&
    typeof entry.text === "string" &&
    typeof entry.atSec === "number" &&
    typeof entry.createdAt === "string" &&
    typeof entry.author === "string"
  )
}

function isStudioSnapshot(value: unknown): value is StudioSnapshot {
  if (typeof value !== "object" || value === null) return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.id === "string" &&
    typeof entry.name === "string" &&
    typeof entry.createdAt === "string" &&
    typeof entry.bpm === "number" &&
    typeof entry.playhead === "number" &&
    typeof entry.isPlaying === "boolean" &&
    typeof entry.markerCount === "number" &&
    typeof entry.noteCount === "number"
  )
}

function upsertMarker(prev: StudioMarker[], marker: StudioMarker): StudioMarker[] {
  if (prev.some((entry) => entry.id === marker.id)) return prev
  return [...prev, marker].sort((a, b) => a.atSec - b.atSec)
}

function upsertNote(prev: StudioNote[], note: StudioNote): StudioNote[] {
  if (prev.some((entry) => entry.id === note.id)) return prev
  return [...prev, note].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

function upsertSnapshot(prev: StudioSnapshot[], snapshot: StudioSnapshot): StudioSnapshot[] {
  if (prev.some((entry) => entry.id === snapshot.id)) return prev
  return [...prev, snapshot].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

const defaultSession: CollaborationSession =
  mockCollaborationSessions[0] ?? {
    id: "sess-default",
    title: "Studio Session",
    status: "active",
    participants: 1,
    startedAt: new Date().toISOString(),
  }

export default function StudioPage() {
  const [sessions, setSessions] = useState<CollaborationSession[]>(mockCollaborationSessions)
  const [activeSessionId, setActiveSessionId] = useState(() => defaultSession.id)
  const session = useMemo(
    () =>
      sessions.find((entry) => entry.id === activeSessionId) ??
      sessions[0] ??
      defaultSession,
    [activeSessionId, sessions],
  )
  const [presenceCount, setPresenceCount] = useState(1)
  const [connected, setConnected] = useState(false)
  const [creatingSession, setCreatingSession] = useState(false)

  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [playhead, setPlayhead] = useState(0)

  const [markerLabel, setMarkerLabel] = useState("")
  const [noteText, setNoteText] = useState("")
  const [markers, setMarkers] = useState<StudioMarker[]>(
    () => loadStudioSessionState(activeSessionId).markers,
  )
  const [notes, setNotes] = useState<StudioNote[]>(
    () => loadStudioSessionState(activeSessionId).notes,
  )
  const [snapshots, setSnapshots] = useState<StudioSnapshot[]>(
    () => loadStudioSessionState(activeSessionId).snapshots,
  )
  const [producerAlias] = useState(() => getOrCreateStudioAlias())
  const [audienceMode, setAudienceMode] = useState(false)
  const [audienceViewers, setAudienceViewers] = useState(0)
  const [audienceFollowers, setAudienceFollowers] = useState(0)
  const [copiedAudienceLink, setCopiedAudienceLink] = useState(false)

  // Phase 3: New collaboration features
  const [showVoicePanel, setShowVoicePanel] = useState(false)
  const [showMIDISettings, setShowMIDISettings] = useState(false)

  const channelRef = useRef<StudioRealtimeChannel | null>(null)
  const fallbackSessionMeta = useMemo(
    () =>
      Object.fromEntries(
        sessions.map((entry) => [
          entry.id,
          getSessionCollabSummary(entry.id),
        ]),
      ),
    [sessions],
  )

  const sendStudioBroadcast = useCallback(
    (event: StudioBroadcastEvent, payload: Record<string, unknown>) => {
      if (!channelRef.current) return
      void channelRef.current.send({
        type: "broadcast",
        event,
        payload,
      })
    },
    [],
  )

  useEffect(() => {
    let cancelled = false
    void fetchStudioSessions().then((nextSessions) => {
      if (cancelled || nextSessions.length === 0) return
      setSessions(nextSessions)
      setActiveSessionId((prev) =>
        nextSessions.some((entry) => entry.id === prev)
          ? prev
          : (nextSessions[0]?.id ?? prev),
      )
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const state = loadStudioSessionState(session.id)
    setMarkers(state.markers)
    setNotes(state.notes)
    setSnapshots(state.snapshots)
  }, [session.id])

  useEffect(() => {
    saveStudioSessionState(session.id, { markers, notes, snapshots })
  }, [session.id, markers, notes, snapshots])

  useEffect(() => {
    let cancelled = false
    void loadStudioStateFromDb(session.id).then((state) => {
      if (cancelled || !state) return
      if (state.markers.length > 0) setMarkers(state.markers)
      if (state.notes.length > 0) setNotes(state.notes)
      if (state.snapshots.length > 0) setSnapshots(state.snapshots)
    })

    return () => {
      cancelled = true
    }
  }, [session.id])

  useEffect(() => {
    const supabase = createClient()
    if (!("channel" in supabase)) return

    const channel = (
      supabase as unknown as {
        channel: (name: string) => StudioRealtimeChannel
        removeChannel: (channel: unknown) => void
      }
    ).channel(`studio:${session.id}`)
    channelRef.current = channel

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState()
      setPresenceCount(Object.keys(state).length)
    })

    channel.on("broadcast", { event: "studio_state" }, (payload) => {
      const state = payload?.payload ?? {}
      if (typeof state.isPlaying === "boolean") setIsPlaying(state.isPlaying)
      if (typeof state.bpm === "number") setBpm(state.bpm)
      if (typeof state.playhead === "number") setPlayhead(state.playhead)
    })

    channel.on("broadcast", { event: "studio_marker" }, (payload) => {
      const marker = payload?.payload?.marker
      if (isStudioMarker(marker)) {
        setMarkers((prev) => upsertMarker(prev, marker))
      }
    })

    channel.on("broadcast", { event: "studio_note" }, (payload) => {
      const note = payload?.payload?.note
      if (isStudioNote(note)) {
        setNotes((prev) => upsertNote(prev, note))
      }
    })

    channel.on("broadcast", { event: "studio_snapshot" }, (payload) => {
      const snapshot = payload?.payload?.snapshot
      if (isStudioSnapshot(snapshot)) {
        setSnapshots((prev) => upsertSnapshot(prev, snapshot))
      }
    })

    const subscription = channel.subscribe(async (status) => {
      setConnected(status === "SUBSCRIBED")
      if (status === "SUBSCRIBED") {
        await subscription.track({
          online_at: new Date().toISOString(),
          alias: producerAlias,
        })
      }
    })

    return () => {
      channelRef.current = null
      ;(
        supabase as unknown as {
          removeChannel: (channel: unknown) => void
        }
      ).removeChannel(channel)
    }
  }, [producerAlias, session.id])

  useEffect(() => {
    sendStudioBroadcast("studio_state", { isPlaying, bpm, playhead })
  }, [isPlaying, bpm, playhead, sendStudioBroadcast])

  useEffect(() => {
    if (!audienceMode) return
    const timer = setInterval(() => {
      setAudienceViewers((prev) => Math.min(500, prev + Math.max(1, Math.round(presenceCount * 0.5))))
      setAudienceFollowers((prev) => Math.min(150, prev + Math.max(0, Math.round(presenceCount * 0.2))))
    }, 6000)
    return () => clearInterval(timer)
  }, [audienceMode, presenceCount])

  const addMarker = useCallback(() => {
    const marker: StudioMarker = {
      id: generateStudioEntityId("marker"),
      label: markerLabel.trim() || `Cue ${markers.length + 1}`,
      atSec: Number(playhead.toFixed(1)),
      createdAt: new Date().toISOString(),
    }

    setMarkers((prev) => upsertMarker(prev, marker))
    setMarkerLabel("")
    sendStudioBroadcast("studio_marker", { marker })
    void saveStudioMarkerToDb(session.id, marker, producerAlias)
  }, [markerLabel, markers.length, playhead, producerAlias, sendStudioBroadcast, session.id])

  const addNote = useCallback(() => {
    const trimmed = noteText.trim()
    if (!trimmed) return

    const note: StudioNote = {
      id: generateStudioEntityId("note"),
      text: trimmed,
      atSec: Number(playhead.toFixed(1)),
      createdAt: new Date().toISOString(),
      author: producerAlias,
    }

    setNotes((prev) => upsertNote(prev, note))
    setNoteText("")
    sendStudioBroadcast("studio_note", { note })
    void saveStudioNoteToDb(session.id, note)
  }, [noteText, playhead, producerAlias, sendStudioBroadcast, session.id])

  const saveSnapshot = useCallback(() => {
    const snapshot: StudioSnapshot = {
      id: generateStudioEntityId("snap"),
      name: createSnapshotName(snapshots.length),
      createdAt: new Date().toISOString(),
      bpm,
      playhead: Number(playhead.toFixed(1)),
      isPlaying,
      markerCount: markers.length,
      noteCount: notes.length,
    }

    setSnapshots((prev) => upsertSnapshot(prev, snapshot))
    sendStudioBroadcast("studio_snapshot", { snapshot })
    void saveStudioSnapshotToDb(session.id, snapshot, producerAlias)
  }, [
    bpm,
    isPlaying,
    markers.length,
    notes.length,
    playhead,
    producerAlias,
    sendStudioBroadcast,
    session.id,
    snapshots.length,
  ])

  async function handleCreateSession() {
    setCreatingSession(true)
    try {
      const nextSession = await createStudioSession(
        `Session ${new Date().toLocaleDateString()}`,
      )
      if (!nextSession) return
      setSessions((prev) => [nextSession, ...prev])
      setActiveSessionId(nextSession.id)
    } finally {
      setCreatingSession(false)
    }
  }

  async function copyAudienceInvite() {
    if (typeof window === "undefined") return
    const invite = `${window.location.origin}/studio?session=${session.id}&mode=audience`
    await navigator.clipboard.writeText(invite)
    setCopiedAudienceLink(true)
    setTimeout(() => setCopiedAudienceLink(false), 1800)
  }

  return (
    <NeonPage className="max-w-6xl">
      <NeonHero
        eyebrow="Realtime Studio"
        title="Collaborative session control, timeline notes, and version snapshots."
        description="Studio now supports shared markers, notes, and snapshot checkpoints for faster collab iteration."
        actions={
          <Button
            className="rounded-full"
            onClick={handleCreateSession}
            disabled={creatingSession}
          >
            {creatingSession ? "Creating..." : "New Session"}
          </Button>
        }
        aside={
          <div className="space-y-2">
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Dot className={`h-4 w-4 ${connected ? "text-green-500" : "text-amber-500"}`} />
              {connected ? "Realtime connected" : "Fallback mode"}
            </p>
            <p className="text-xs text-muted-foreground">Alias: {producerAlias}</p>
            
            {/* Phase 3: Collaboration toolbar */}
            <div className="flex flex-wrap gap-1 pt-2">
              <Button
                size="sm"
                variant={showVoicePanel ? "default" : "outline"}
                className="h-7 gap-1 text-xs rounded-full"
                onClick={() => setShowVoicePanel(!showVoicePanel)}
              >
                <Mic className="h-3 w-3" />
                Voice
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-xs rounded-full"
                onClick={() => setShowMIDISettings(!showMIDISettings)}
              >
                <Settings className="h-3 w-3" />
                MIDI
              </Button>
            </div>
          </div>
        }
      />

      {/* Phase 3: Real-time Cursor Presence */}
      <Suspense fallback={<div className="h-12 bg-muted rounded-xl animate-pulse" />}>
        <CursorPresence
          sessionId={session.id}
          userId={producerAlias}
          displayName={producerAlias}
          className="mb-4"
        />
      </Suspense>

      {/* Phase 3: Voice Chat Panel */}
      {showVoicePanel && (
        <Suspense fallback={<div className="h-32 bg-muted rounded-xl animate-pulse" />}>
          <section className="neon-panel rounded-2xl p-4 mb-6">
            <NeonSectionHeader
              title="Voice Chat"
              description="Real-time voice communication with collaborators via Daily.co."
            />
            <VoiceChatPanel
              roomName={`mashups-studio-${session.id}`}
              userId={producerAlias}
              displayName={producerAlias}
              onLeave={() => setShowVoicePanel(false)}
            />
          </section>
        </Suspense>
      )}

      {/* Phase 3: MIDI Controller Panel */}
      {showMIDISettings && (
        <Suspense fallback={<div className="h-32 bg-muted rounded-xl animate-pulse" />}>
          <section className="neon-panel rounded-2xl p-4 mb-6">
            <MIDIControllerPanel
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onStop={() => setIsPlaying(false)}
              onSeek={(pos) => setPlayhead(pos)}
            />
          </section>
        </Suspense>
      )}

      {/* Phase 3: Spectral Waveform */}
      <section className="neon-panel rounded-2xl p-4 mb-6">
        <NeonSectionHeader
          title="Spectral Analysis"
          description="Frequency visualization of your mix."
        />
        <Suspense fallback={<div className="h-48 bg-muted rounded-xl animate-pulse" />}>
          <SpectralWaveform
            width={800}
            height={200}
            colorScheme="aurora"
            className="w-full"
          />
        </Suspense>
      </section>

      <section className="neon-panel rounded-2xl p-4">
        <NeonSectionHeader
          title="Shared Transport"
          description="Broadcast and mirror playback state across collaborators."
        />
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">State</p>
            <Button
              className="mt-2 rounded-full"
              size="sm"
              variant={isPlaying ? "secondary" : "default"}
              onClick={() => setIsPlaying((prev) => !prev)}
            >
              {isPlaying ? "Pause Session" : "Play Session"}
            </Button>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">BPM: {bpm}</p>
            <Slider
              className="mt-3"
              value={[bpm]}
              min={60}
              max={180}
              step={1}
              onValueChange={(value) => setBpm(value[0] ?? bpm)}
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Playhead: {playhead.toFixed(1)}s</p>
            <Slider
              className="mt-3"
              value={[playhead]}
              min={0}
              max={180}
              step={0.1}
              onValueChange={(value) => setPlayhead(value[0] ?? playhead)}
            />
          </div>
        </div>
      </section>

      <NeonGrid className="mt-6 lg:grid-cols-2">
        <section className="neon-panel rounded-2xl p-4">
          <NeonSectionHeader
            title="Timeline Markers"
            description="Drop cues at exact timestamps for arrangement or drop transitions."
          />
          <div className="flex gap-2">
            <Input
              placeholder="Marker label (optional)"
              value={markerLabel}
              onChange={(event) => setMarkerLabel(event.target.value)}
            />
            <Button className="rounded-full" variant="outline" onClick={addMarker}>
              <BookmarkPlus className="h-4 w-4" />
              Add
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {markers.length > 0 ? (
              markers.map((marker) => (
                <div
                  key={marker.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{marker.label}</p>
                    <p className="text-xs text-muted-foreground">
                      at {marker.atSec.toFixed(1)}s | {new Date(marker.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setPlayhead(marker.atSec)}
                  >
                    Jump
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No markers yet.</p>
            )}
          </div>
        </section>

        <section className="neon-panel rounded-2xl p-4">
          <NeonSectionHeader
            title="Session Notes"
            description="Post collaborator notes with playhead context."
          />
          <Textarea
            placeholder="Write a note tied to the current playhead..."
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <Button className="rounded-full" variant="outline" onClick={addNote}>
              <MessageSquarePlus className="h-4 w-4" />
              Add Note
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {notes.length > 0 ? (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl border border-border/70 bg-background/50 px-3 py-2"
                >
                  <p className="text-sm text-foreground">{note.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {note.author} | {note.atSec.toFixed(1)}s | {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No notes posted yet.</p>
            )}
          </div>
        </section>
      </NeonGrid>

      <section className="neon-panel mt-6 rounded-2xl p-4">
        <NeonSectionHeader
          title="Version Snapshots"
          description="Save session states to restore arrangement checkpoints."
          action={
            <Button className="rounded-full" variant="outline" size="sm" onClick={saveSnapshot}>
              <Save className="h-4 w-4" />
              Save Snapshot
            </Button>
          }
        />
        <div className="space-y-2">
          {snapshots.length > 0 ? (
            snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{snapshot.name}</p>
                  <p className="text-xs text-muted-foreground">
                    <Clock3 className="mr-1 inline h-3 w-3" />
                    {new Date(snapshot.createdAt).toLocaleString()} | {snapshot.bpm} BPM |{" "}
                    {snapshot.playhead.toFixed(1)}s
                  </p>
                  <p className="text-xs text-muted-foreground">
                    markers {snapshot.markerCount} | notes {snapshot.noteCount}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      setPlayhead(snapshot.playhead)
                      setBpm(snapshot.bpm)
                      setIsPlaying(snapshot.isPlaying)
                    }}
                  >
                    Restore
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No snapshots saved yet.</p>
          )}
        </div>
      </section>

      <section className="neon-panel mt-6 rounded-2xl p-4">
        <NeonSectionHeader
          title="Live Audience Room"
          description="Open session playback to viewers and convert live audience into followers."
          action={
            <Button
              size="sm"
              className="rounded-full"
              variant={audienceMode ? "secondary" : "default"}
              onClick={() => setAudienceMode((prev) => !prev)}
            >
              {audienceMode ? "Audience Live" : "Go Live"}
            </Button>
          }
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Viewers</p>
            <p className="mt-1 inline-flex items-center gap-1 text-lg font-semibold text-foreground">
              <Eye className="h-4 w-4 text-primary" />
              {audienceViewers}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Follower Conversions</p>
            <p className="mt-1 inline-flex items-center gap-1 text-lg font-semibold text-foreground">
              <UserPlus className="h-4 w-4 text-primary" />
              {audienceFollowers}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {audienceViewers > 0
                ? `${((audienceFollowers / audienceViewers) * 100).toFixed(1)}%`
                : "0.0%"}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="rounded-full" onClick={copyAudienceInvite}>
            <Copy className="h-4 w-4" />
            {copiedAudienceLink ? "Copied" : "Copy Audience Invite"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Audience mode simulates live-room conversion tracking while session transport is active.
          </p>
        </div>
      </section>

      <section className="mt-6">
        <NeonSectionHeader title="Sessions" />
        <NeonGrid>
          {sessions.map((entry) => (
            <div
              key={entry.id}
              className="neon-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
            >
              <div>
                <p className="text-base font-semibold text-foreground">{entry.title}</p>
                <p className="text-xs text-muted-foreground">
                  Started {new Date(entry.startedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={entry.status === "active" ? "default" : "secondary"}>
                  {entry.status}
                </Badge>
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {entry.id === session.id ? presenceCount : entry.participants}
                </span>
                <span className="text-xs text-muted-foreground">
                  {entry.id === session.id
                    ? `${markers.length} markers | ${notes.length} notes | ${snapshots.length} versions`
                    : `${fallbackSessionMeta[entry.id]?.markerCount ?? 0} markers | ${
                        fallbackSessionMeta[entry.id]?.noteCount ?? 0
                      } notes | ${fallbackSessionMeta[entry.id]?.snapshotCount ?? 0} versions`}
                </span>
                <Button variant="outline" size="sm" className="rounded-full">
                  {entry.status === "active" ? (
                    <>
                      <PauseCircle className="h-4 w-4" />
                      {entry.id === session.id ? "Live" : "Pause"}
                    </>
                  ) : (
                    <>
                      <Radio className="h-4 w-4" />
                      {entry.id === session.id ? "Resume" : "Open"}
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setActiveSessionId(entry.id)}
                >
                  Open
                </Button>
              </div>
            </div>
          ))}
        </NeonGrid>
      </section>
    </NeonPage>
  )
}
