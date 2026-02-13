"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Users, Radio, PauseCircle, Dot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { mockCollaborationSessions } from "@/lib/data/collaboration"
import { createClient } from "@/lib/supabase/client"

export default function StudioPage() {
  const [presenceCount, setPresenceCount] = useState(1)
  const [connected, setConnected] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [playhead, setPlayhead] = useState(0)
  const channelRef = useRef<{
    send: (payload: {
      type: "broadcast"
      event: "studio_state"
      payload: Record<string, unknown>
    }) => Promise<void>
  } | null>(null)

  const session = useMemo(() => mockCollaborationSessions[0], [])

  useEffect(() => {
    const supabase = createClient()
    if (!("channel" in supabase)) return

    const channel = (supabase as unknown as {
      channel: (name: string) => {
        send: (payload: {
          type: "broadcast"
          event: "studio_state"
          payload: Record<string, unknown>
        }) => Promise<void>
        on: (
          event: "presence" | "broadcast",
          opts: { event: "sync" | "studio_state" },
          callback: ((payload?: { payload?: Record<string, unknown> }) => void) | (() => void),
        ) => unknown
        subscribe: (
          cb: (status: string) => void,
        ) => {
          track: (payload: Record<string, unknown>) => Promise<void>
          send: (payload: { type: "broadcast"; event: "studio_state"; payload: Record<string, unknown> }) => Promise<void>
        }
        presenceState: () => Record<string, unknown[]>
      }
      removeChannel: (channel: unknown) => void
    }).channel(`studio:${session.id}`)
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

    const subscription = channel.subscribe(async (status) => {
      setConnected(status === "SUBSCRIBED")
      if (status === "SUBSCRIBED") {
        await subscription.track({ online_at: new Date().toISOString() })
      }
    })

    return () => {
      channelRef.current = null
      ;(supabase as unknown as { removeChannel: (channel: unknown) => void }).removeChannel(channel)
    }
  }, [session.id])

  useEffect(() => {
    if (!channelRef.current) return
    void channelRef.current.send({
      type: "broadcast",
      event: "studio_state",
      payload: { isPlaying, bpm, playhead },
    })
  }, [isPlaying, bpm, playhead])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Collab Studio</h1>
          <p className="mt-1 text-muted-foreground">
            Real-time collaboration session control and presence.
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Dot className={`h-4 w-4 ${connected ? "text-green-500" : "text-amber-500"}`} />
            {connected ? "Realtime connected" : "Fallback mode"}
          </p>
        </div>
        <Button>New Session</Button>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <p className="text-sm font-medium text-foreground">Shared Transport</p>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">State</p>
              <Button
                className="mt-2"
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
        </div>

        {mockCollaborationSessions.map((session) => (
          <div
            key={session.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/50 bg-card p-4"
          >
            <div>
              <p className="text-base font-semibold text-foreground">{session.title}</p>
              <p className="text-xs text-muted-foreground">
                Started {new Date(session.startedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={session.status === "active" ? "default" : "secondary"}>
                {session.status}
              </Badge>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {session.id === mockCollaborationSessions[0].id ? presenceCount : session.participants}
              </span>
              <Button variant="outline" size="sm">
                {session.status === "active" ? (
                  <>
                    <PauseCircle className="h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Radio className="h-4 w-4" />
                    Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
