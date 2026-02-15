"use client"

import { useEffect, useState } from "react"
import { Sparkles, Play, Music } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimilarStem {
  id: string
  title: string
  instrument: string
  bpm: number
  key: string
  similarity: number
  usageCount: number
  creatorName: string
}

interface SimilarStemsProps {
  stemId?: string
  instrument?: string
  className?: string
}

const instrumentColors: Record<string, string> = {
  bass: "border-emerald-500/30",
  drums: "border-amber-500/30",
  vocal: "border-pink-500/30",
  synth: "border-violet-500/30",
  guitar: "border-red-500/30",
  other: "border-slate-500/30",
}

export function SimilarStems({ stemId, instrument, className }: SimilarStemsProps) {
  const [stems, setStems] = useState<SimilarStem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams()
        if (stemId) params.set("stemId", stemId)
        if (instrument) params.set("instrument", instrument)
        const response = await fetch(`/api/stems/similar?${params}`)
        if (response.ok) {
          const data = (await response.json()) as { stems: SimilarStem[] }
          setStems(data.stems)
        }
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [stemId, instrument])

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-muted/30 animate-pulse" />
        ))}
      </div>
    )
  }

  if (stems.length === 0) return null

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <h4 className="text-xs font-semibold text-foreground">Stems Like This</h4>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {stems.map((stem) => (
          <div
            key={stem.id}
            className={cn(
              "shrink-0 rounded-lg border bg-card/50 p-2.5 w-36 space-y-1.5 hover:bg-card/80 transition-colors cursor-pointer",
              instrumentColors[stem.instrument] ?? instrumentColors.other
            )}
          >
            <div className="flex items-center gap-1.5">
              <Play className="h-3 w-3 text-muted-foreground" />
              <p className="text-[11px] font-medium text-foreground truncate">{stem.title}</p>
            </div>
            <p className="text-[9px] text-muted-foreground">{stem.creatorName}</p>
            <div className="flex items-center justify-between text-[9px] text-muted-foreground">
              <span>{stem.bpm} BPM · {stem.key}</span>
              <span className="flex items-center gap-0.5">
                <Music className="h-2 w-2" />
                {stem.usageCount}
              </span>
            </div>
            <div className="text-[8px] text-primary">{Math.round(stem.similarity * 100)}% match</div>
          </div>
        ))}
      </div>
    </div>
  )
}
