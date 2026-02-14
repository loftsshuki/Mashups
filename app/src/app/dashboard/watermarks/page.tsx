"use client"

import { useEffect, useState } from "react"
import {
  Fingerprint,
  Shield,
  ExternalLink,
  Radio,
  Clock,
} from "lucide-react"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Badge } from "@/components/ui/badge"
import {
  NeonPage,
  NeonHero,
  NeonGrid,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import { createClient } from "@/lib/supabase/client"
import {
  getFingerprintsForUser,
  getAllCustodyEvents,
  getCustodyLog,
  CUSTODY_EVENT_LABELS,
} from "@/lib/data/watermark-custody"
import type {
  AudioFingerprintRecord,
  WatermarkCustodyEvent,
} from "@/lib/data/types"

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function WatermarkContent() {
  const [fingerprints, setFingerprints] = useState<AudioFingerprintRecord[]>([])
  const [events, setEvents] = useState<WatermarkCustodyEvent[]>([])
  const [selectedFp, setSelectedFp] = useState<string | null>(null)
  const [fpEvents, setFpEvents] = useState<WatermarkCustodyEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        const userId = user?.id ?? "mock-user"

        const [fpData, eventData] = await Promise.all([
          getFingerprintsForUser(userId),
          getAllCustodyEvents(userId),
        ])
        setFingerprints(fpData)
        setEvents(eventData)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  useEffect(() => {
    if (!selectedFp) {
      setFpEvents([])
      return
    }
    getCustodyLog(selectedFp).then(setFpEvents)
  }, [selectedFp])

  const detectionCount = events.filter(
    (e) => e.event_type === "detected",
  ).length
  const exportCount = events.filter(
    (e) => e.event_type === "exported",
  ).length
  const verifiedCount = events.filter(
    (e) => e.event_type === "verified",
  ).length

  if (loading) {
    return (
      <NeonPage className="max-w-5xl">Loading watermark dashboard...</NeonPage>
    )
  }

  return (
    <NeonPage className="max-w-5xl">
      <NeonHero
        eyebrow="Attribution Watermarks"
        title="Track your audio across the internet."
        description="Audio fingerprints, invisible watermarks, and chain-of-custody tracking for every mashup you publish."
      />

      {/* Stats */}
      <NeonGrid className="sm:grid-cols-4">
        <div className="neon-panel rounded-2xl p-4 text-center">
          <Fingerprint className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {fingerprints.length}
          </p>
          <p className="text-xs text-muted-foreground">Fingerprints</p>
        </div>
        <div className="neon-panel rounded-2xl p-4 text-center">
          <Radio className="mx-auto h-5 w-5 text-blue-500" />
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {exportCount}
          </p>
          <p className="text-xs text-muted-foreground">Exports</p>
        </div>
        <div className="neon-panel rounded-2xl p-4 text-center">
          <Shield className="mx-auto h-5 w-5 text-orange-500" />
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {detectionCount}
          </p>
          <p className="text-xs text-muted-foreground">Detections</p>
        </div>
        <div className="neon-panel rounded-2xl p-4 text-center">
          <Shield className="mx-auto h-5 w-5 text-purple-500" />
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {verifiedCount}
          </p>
          <p className="text-xs text-muted-foreground">Verified</p>
        </div>
      </NeonGrid>

      {/* Fingerprinted Mashups */}
      <NeonSectionHeader
        title="Fingerprinted Mashups"
        description="Select a mashup to view its chain-of-custody"
      />

      <div className="space-y-2">
        {fingerprints.length > 0 ? (
          fingerprints.map((fp) => {
            const fpEventCount = events.filter(
              (e) => e.fingerprint_id === fp.id,
            ).length
            return (
              <button
                key={fp.id}
                onClick={() =>
                  setSelectedFp(selectedFp === fp.id ? null : fp.id)
                }
                className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                  selectedFp === fp.id
                    ? "border-primary bg-primary/5"
                    : "border-border/70 bg-background/50 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Mashup: {fp.mashup_id}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Hash: {fp.fingerprint_hash.slice(0, 24)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-[10px]">
                      {fpEventCount} events
                    </Badge>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {timeAgo(fp.created_at)}
                    </p>
                  </div>
                </div>
              </button>
            )
          })
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No fingerprinted mashups yet. Publish a mashup with watermark
            enabled to start tracking.
          </p>
        )}
      </div>

      {/* Chain of Custody Timeline */}
      {selectedFp && (
        <>
          <NeonSectionHeader
            title="Chain of Custody"
            description="Every event in this mashup's lifecycle"
          />

          <div className="relative space-y-0 pl-6">
            {/* Timeline line */}
            <div className="absolute bottom-0 left-[11px] top-0 w-px bg-border/50" />

            {fpEvents.map((event, i) => {
              const eventDef = CUSTODY_EVENT_LABELS[event.event_type]
              return (
                <div key={event.id} className="relative pb-4">
                  {/* Dot */}
                  <div
                    className="absolute -left-6 top-1 h-[10px] w-[10px] rounded-full border-2 border-background"
                    style={{ backgroundColor: eventDef?.color ?? "#888" }}
                  />

                  <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          style={{
                            borderColor: `${eventDef?.color ?? "#888"}40`,
                            color: eventDef?.color ?? "#888",
                          }}
                        >
                          {eventDef?.label ?? event.event_type}
                        </Badge>
                        {event.platform && (
                          <span className="text-xs text-muted-foreground">
                            on {event.platform}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(event.occurred_at).toLocaleString()}
                      </div>
                    </div>

                    {event.detected_url && (
                      <a
                        href={event.detected_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {event.detected_url}
                      </a>
                    )}

                    {event.confidence !== null && event.confidence < 1 && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Confidence: {(event.confidence * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* All Recent Events */}
      <NeonSectionHeader
        title="Recent Activity"
        description="All watermark events across your mashups"
      />

      <div className="space-y-2">
        {events.slice(0, 20).map((event) => {
          const eventDef = CUSTODY_EVENT_LABELS[event.event_type]
          return (
            <div
              key={event.id}
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/50 px-3 py-2"
            >
              <div
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: eventDef?.color ?? "#888" }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {eventDef?.label ?? event.event_type}
                  </span>
                  {event.platform && (
                    <Badge variant="outline" className="text-[10px]">
                      {event.platform}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {timeAgo(event.occurred_at)}
                </p>
              </div>
              {event.confidence !== null && event.confidence < 1 && (
                <span className="text-xs text-muted-foreground">
                  {(event.confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>
          )
        })}
      </div>
    </NeonPage>
  )
}

export default function WatermarksPage() {
  return (
    <AuthGuard>
      <WatermarkContent />
    </AuthGuard>
  )
}
