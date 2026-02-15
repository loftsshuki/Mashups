"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Music2 } from "lucide-react"

interface SpinnerStem {
  id: string
  title: string
  instrument: string | null
  genre: string | null
}

interface RouletteSpinnerProps {
  stems: SpinnerStem[]
  isSpinning: boolean
  onSpinComplete: () => void
  className?: string
}

const INSTRUMENT_COLORS: Record<string, string> = {
  vocal: "bg-pink-500/20 border-pink-500/40 text-pink-400",
  drums: "bg-amber-500/20 border-amber-500/40 text-amber-400",
  bass: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
  synth: "bg-blue-500/20 border-blue-500/40 text-blue-400",
  texture: "bg-violet-500/20 border-violet-500/40 text-violet-400",
  other: "bg-gray-500/20 border-gray-500/40 text-gray-400",
}

export function RouletteSpinner({ stems, isSpinning, onSpinComplete, className }: RouletteSpinnerProps) {
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false])

  useEffect(() => {
    if (!isSpinning || stems.length === 0) return

    // Staggered reveal
    const timers = [
      setTimeout(() => setRevealed([true, false, false]), 600),
      setTimeout(() => setRevealed([true, true, false]), 1200),
      setTimeout(() => {
        setRevealed([true, true, true])
        onSpinComplete()
      }, 1800),
    ]

    return () => timers.forEach(clearTimeout)
  }, [isSpinning, stems, onSpinComplete])

  // Reset when stems change
  useEffect(() => {
    if (stems.length === 0) setRevealed([false, false, false])
  }, [stems])

  return (
    <div className={cn("grid grid-cols-3 gap-4", className)}>
      {[0, 1, 2].map((i) => {
        const stem = stems[i]
        const isRevealed = revealed[i]
        const colorClass = stem
          ? INSTRUMENT_COLORS[stem.instrument?.toLowerCase() ?? "other"] ?? INSTRUMENT_COLORS.other
          : "bg-muted border-border"

        return (
          <div
            key={i}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl border-2 p-4 min-h-[140px] transition-all duration-500",
              isRevealed && stem ? colorClass : "bg-muted/50 border-border/50",
              isSpinning && !isRevealed && "animate-pulse"
            )}
          >
            {isRevealed && stem ? (
              <div className="text-center space-y-2">
                <Music2 className="h-6 w-6 mx-auto" />
                <p className="text-sm font-semibold">{stem.title}</p>
                <p className="text-[10px] uppercase tracking-wide opacity-70">
                  {stem.instrument ?? "Sound"}
                </p>
                {stem.genre && (
                  <p className="text-[10px] opacity-50">{stem.genre}</p>
                )}
              </div>
            ) : (
              <div className="text-center space-y-2 opacity-30">
                <div className="h-6 w-6 mx-auto rounded bg-muted-foreground/20" />
                <p className="text-sm font-medium">?</p>
                <p className="text-[10px]">Slot {i + 1}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
