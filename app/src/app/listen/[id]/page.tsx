"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProcessPlayer } from "@/components/player/process-player"

interface MashupData {
  id: string
  title: string
  audioUrl: string
  duration: number
  genre: string
  creatorName: string
  creatorAvatar: string | null
  sourceTracks: { title: string; artist: string; position: number }[]
  detailHref: string
}

const STEM_COLORS = ["#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#06b6d4", "#ef4444"]

export default function ListenPage() {
  const params = useParams()
  const mashupId = params.id as string
  const [mashup, setMashup] = useState<MashupData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadGreenPublication() {
      const response = await fetch(
        `/api/green/publications/${encodeURIComponent(mashupId)}`,
        { cache: "no-store" },
      )
      if (!response.ok) return null
      const body = await response.json() as {
        publication?: {
          id: string
          title: string
          durationSeconds: number
          creator: {
            username: string
            displayName: string | null
            avatarUrl: string | null
          }
          leftSource: { trackTitle: string; artistName: string }
          rightSource: { trackTitle: string; artistName: string }
        }
      }
      if (!body.publication) return null

      return {
        id: body.publication.id,
        title: body.publication.title,
        audioUrl: `/api/green/publications/${encodeURIComponent(body.publication.id)}/audio`,
        duration: body.publication.durationSeconds,
        genre: "Mashup",
        creatorName:
          body.publication.creator.displayName ??
          body.publication.creator.username,
        creatorAvatar: body.publication.creator.avatarUrl,
        sourceTracks: [
          {
            title: body.publication.leftSource.trackTitle,
            artist: body.publication.leftSource.artistName,
            position: 0,
          },
          {
            title: body.publication.rightSource.trackTitle,
            artist: body.publication.rightSource.artistName,
            position: 1,
          },
        ],
        detailHref: "/create",
      } satisfies MashupData
    }

    async function loadLegacyMashup() {
      const response = await fetch(
        `/api/mashups/${encodeURIComponent(mashupId)}/summary`,
      )
      if (!response.ok) return null
      const data = (await response.json()) as {
        mashup?: {
          id: string
          title: string
          audioUrl: string
          duration: number
          genre: string
          creator: { displayName: string; avatarUrl: string | null }
          sourceTracks?: { title: string; artist: string; position: number }[]
        }
      }
      if (!data.mashup) return null

      return {
        id: data.mashup.id,
        title: data.mashup.title,
        audioUrl: data.mashup.audioUrl,
        duration: data.mashup.duration,
        genre: data.mashup.genre,
        creatorName: data.mashup.creator.displayName,
        creatorAvatar: data.mashup.creator.avatarUrl,
        sourceTracks: data.mashup.sourceTracks ?? [],
        detailHref: `/mashup/${data.mashup.id}`,
      } satisfies MashupData
    }

    async function load() {
      try {
        const resolved =
          (await loadGreenPublication()) ??
          (await loadLegacyMashup())
        if (!cancelled && resolved) setMashup(resolved)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [mashupId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="animate-pulse text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!mashup) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Headphones className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Track Not Found</h1>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </Button>
      </div>
    )
  }

  const processTracks = mashup.sourceTracks.map((track, i) => ({
    title: track.title,
    artist: track.artist,
    entryTime:
      (mashup.duration / (mashup.sourceTracks.length + 1)) * (i + 1) * 0.3,
    color: STEM_COLORS[i % STEM_COLORS.length],
  }))

  return (
    <div className="min-h-screen">
      <div className="absolute left-4 top-20 z-10">
        <Button variant="ghost" size="sm" asChild>
          <Link href={mashup.detailHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <ProcessPlayer
        title={mashup.title}
        creatorName={mashup.creatorName}
        creatorAvatar={mashup.creatorAvatar ?? undefined}
        audioUrl={mashup.audioUrl}
        duration={mashup.duration}
        tracks={processTracks}
        mashupId={mashupId}
        className="min-h-screen"
      />
    </div>
  )
}
