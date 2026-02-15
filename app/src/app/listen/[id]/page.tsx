"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Headphones, ArrowLeft } from "lucide-react"
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
}

const STEM_COLORS = ["#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#06b6d4", "#ef4444"]

export default function ListenPage() {
  const params = useParams()
  const mashupId = params.id as string
  const [mashup, setMashup] = useState<MashupData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetch(`/api/mashups/${encodeURIComponent(mashupId)}/summary`)
        if (!response.ok) return
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

        if (cancelled || !data.mashup) return

        setMashup({
          id: data.mashup.id,
          title: data.mashup.title,
          audioUrl: data.mashup.audioUrl,
          duration: data.mashup.duration,
          genre: data.mashup.genre,
          creatorName: data.mashup.creator.displayName,
          creatorAvatar: data.mashup.creator.avatarUrl,
          sourceTracks: data.mashup.sourceTracks ?? [],
        })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [mashupId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    )
  }

  if (!mashup) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
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

  // Build process tracks with staggered entry times
  const processTracks = mashup.sourceTracks.map((track, i) => ({
    title: track.title,
    artist: track.artist,
    entryTime: (mashup.duration / (mashup.sourceTracks.length + 1)) * (i + 1) * 0.3,
    color: STEM_COLORS[i % STEM_COLORS.length],
  }))

  return (
    <div className="min-h-screen">
      {/* Back button */}
      <div className="absolute top-20 left-4 z-10">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/mashup/${mashupId}`}>
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
