"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Play, Pause, ArrowRight, Send, Music } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StemDrop {
  id: string
  stems: { id: string; title: string; instrument: string; audioUrl: string }[]
  message: string
  senderName: string
  createdAt: string
  responseCount: number
}

const instrumentColors: Record<string, string> = {
  vocal: "bg-pink-500",
  vocals: "bg-pink-500",
  drums: "bg-amber-500",
  bass: "bg-emerald-500",
  synth: "bg-violet-500",
  guitar: "bg-red-500",
  other: "bg-slate-500",
}

export default function DropPage() {
  const params = useParams()
  const dropId = params.id as string
  const [drop, setDrop] = useState<StemDrop | null>(null)
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetch(`/api/drops?id=${encodeURIComponent(dropId)}`)
        if (!response.ok) return
        const data = (await response.json()) as { drop: StemDrop | null }
        if (!cancelled) setDrop(data.drop)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [dropId])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground animate-pulse">Loading stem drop...</p>
      </div>
    )
  }

  if (!drop) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <Send className="h-12 w-12 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Drop Not Found</h1>
        <p className="text-muted-foreground">This stem drop may have expired or doesn&apos;t exist.</p>
      </div>
    )
  }

  const stemIds = drop.stems.map((s) => s.id).join(",")

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-24 sm:px-6 md:py-16">
      {/* Header */}
      <div className="text-center mb-10 space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Send className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Stem Drop
        </h1>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">@{drop.senderName}</span> dropped some stems for you
        </p>
      </div>

      {/* Message */}
      {drop.message && (
        <div className="mb-8 rounded-xl border border-border/50 bg-card/50 p-5 text-center">
          <p className="text-lg text-foreground italic">&ldquo;{drop.message}&rdquo;</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Dropped {new Date(drop.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Stems */}
      <div className="space-y-3 mb-8">
        <h2 className="text-sm font-semibold text-foreground">The Stems</h2>
        {drop.stems.map((stem) => (
          <div
            key={stem.id}
            className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-3"
          >
            <button
              onClick={() => setPlayingId(playingId === stem.id ? null : stem.id)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors shrink-0"
            >
              {playingId === stem.id ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{stem.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{stem.instrument}</p>
            </div>
            <div className={`w-2 h-8 rounded-full ${instrumentColors[stem.instrument] ?? instrumentColors.other}`} />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <Link href={`/create?stems=${stemIds}&source=drop`}>
          <Button size="lg" className="w-full">
            <Music className="mr-2 h-5 w-5" />
            Accept Challenge
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <p className="text-xs text-muted-foreground text-center">
          These stems will be pre-loaded into the DAW for you to create with.
        </p>
      </div>

      {/* Responses */}
      {drop.responseCount > 0 && (
        <div className="mt-10 rounded-xl border border-border/50 bg-card/50 p-5">
          <h2 className="text-sm font-semibold text-foreground mb-2">
            {drop.responseCount} Response{drop.responseCount !== 1 ? "s" : ""}
          </h2>
          <p className="text-xs text-muted-foreground">
            Other creators have already accepted this challenge. Create yours and see how it compares!
          </p>
        </div>
      )}
    </div>
  )
}
