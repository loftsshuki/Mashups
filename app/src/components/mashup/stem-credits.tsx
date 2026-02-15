"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Music2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Stem } from "@/lib/data/types"

interface StemCreditsProps {
  mashupId: string
  className?: string
}

interface StemCredit {
  stemTitle: string
  instrument: string
  creatorUsername: string
  creatorDisplayName: string
  creatorAvatar: string
}

// Instrument labels
const INSTRUMENT_LABELS: Record<string, string> = {
  vocal: "Vocals",
  vocals: "Vocals",
  drums: "Drums",
  bass: "Bass",
  synth: "Synth",
  texture: "Texture",
  other: "Production",
}

export function StemCredits({ mashupId, className }: StemCreditsProps) {
  const [credits, setCredits] = useState<StemCredit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadCredits() {
      try {
        const response = await fetch(`/api/stems/credits?mashupId=${encodeURIComponent(mashupId)}`)
        if (!response.ok) return
        const data = (await response.json()) as { credits: StemCredit[] }
        if (!cancelled) setCredits(data.credits)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadCredits()
    return () => { cancelled = true }
  }, [mashupId])

  if (loading) {
    return (
      <div className={cn("animate-pulse space-y-2", className)}>
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-12 bg-muted rounded" />
      </div>
    )
  }

  if (credits.length === 0) return null

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Music2 className="h-4 w-4 text-primary" />
        Stem Credits
      </h3>
      <div className="space-y-2">
        {credits.map((credit, i) => {
          const label = INSTRUMENT_LABELS[credit.instrument.toLowerCase()] ?? credit.instrument
          const initials = credit.creatorDisplayName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)

          return (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-card px-3 py-2"
            >
              <Link href={`/profile/${credit.creatorUsername}`} className="shrink-0">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={credit.creatorAvatar} alt={credit.creatorDisplayName} />
                  <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-foreground truncate">
                  {label} by{" "}
                  <Link
                    href={`/profile/${credit.creatorUsername}`}
                    className="font-medium text-primary hover:underline"
                  >
                    @{credit.creatorUsername}
                  </Link>
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{credit.stemTitle}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
