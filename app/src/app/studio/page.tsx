"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Dot, PauseCircle, Radio, Users } from "lucide-react"

import {
  NeonGrid,
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

    const channel = (
      supabase as unknown as {
        channel: (name: string) => {
          send: (payload: {
            type: "broadcast"
            event: "studio_state"
            payload: Record<string, unknown>
          }) => Promise<void>
          on: (
            event: "presence" | "broadcast",
            opts: { event: "sync" | "studio_state" },
            callback:
              | ((payload?: { payload?: Record<string, unknown> }) => void)
              | (() => void),
          ) => unknown
          subscribe: (cb: (status: string) => void) => {
            track: (payload: Record<string, unknown>) => Promise<void>
            send: (payload: {
              type: "broadcast"
              event: "studio_state"
              payload: Record<string, unknown>
            }) => Promise<void>
          }
          presenceState: () => Record<string, unknown[]>
        }
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

    const subscription = channel.subscribe(async (status) => {
      setConnected(status === "SUBSCRIBED")
      if (status === "SUBSCRIBED") {
        await subscription.track({ online_at: new Date().toISOString() })
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
    <NeonPage className="max-w-6xl">
      <NeonHero
        eyebrow="Realtime Studio"
        title="Collaborative session control and shared transport."
        description="Studio is now presented with the same visual section parity as the homepage and launchpad."
        actions={
          <Button className="rounded-full">New Session</Button>
        }
        aside={
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Dot className={`h-4 w-4 ${connected ? "text-green-500" : "text-amber-500"}`} />
            {connected ? "Realtime connected" : "Fallback mode"}
          </p>
        }
      />

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

      <section className="mt-6">
        <NeonSectionHeader title="Sessions" />
        <NeonGrid>
          {mockCollaborationSessions.map((entry) => (
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
                  {entry.id === mockCollaborationSessions[0].id
                    ? presenceCount
                    : entry.participants}
                </span>
                <Button variant="outline" size="sm" className="rounded-full">
                  {entry.status === "active" ? (
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
        </NeonGrid>
      </section>
    </NeonPage>
  )
}

