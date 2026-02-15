"use client"

import { useState } from "react"
import { Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"

interface ABPlayerProps {
  trackA: { audioUrl: string; label: string }
  trackB: { audioUrl: string; label: string }
  onVote: (choice: "A" | "B") => void
  voted: boolean
  className?: string
}

export function ABPlayer({ trackA, trackB, onVote, voted, className }: ABPlayerProps) {
  const [playing, setPlaying] = useState<"A" | "B" | null>(null)

  function togglePlay(track: "A" | "B") {
    setPlaying((prev) => (prev === track ? null : track))
  }

  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      {/* Track A */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-6 text-center space-y-4">
        <button
          onClick={() => togglePlay("A")}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
        >
          {playing === "A" ? (
            <Pause className="h-8 w-8 text-blue-400" fill="currentColor" />
          ) : (
            <Play className="ml-1 h-8 w-8 text-blue-400" fill="currentColor" />
          )}
        </button>
        <p className="text-lg font-bold text-foreground">{trackA.label}</p>
        {!voted && (
          <button
            onClick={() => onVote("A")}
            className="rounded-lg bg-blue-500/20 px-6 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/30 transition-colors"
          >
            I prefer this
          </button>
        )}
      </div>

      {/* Track B */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-6 text-center space-y-4">
        <button
          onClick={() => togglePlay("B")}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 hover:bg-green-500/20 transition-colors"
        >
          {playing === "B" ? (
            <Pause className="h-8 w-8 text-green-400" fill="currentColor" />
          ) : (
            <Play className="ml-1 h-8 w-8 text-green-400" fill="currentColor" />
          )}
        </button>
        <p className="text-lg font-bold text-foreground">{trackB.label}</p>
        {!voted && (
          <button
            onClick={() => onVote("B")}
            className="rounded-lg bg-green-500/20 px-6 py-2 text-sm font-medium text-green-400 hover:bg-green-500/30 transition-colors"
          >
            I prefer this
          </button>
        )}
      </div>
    </div>
  )
}
