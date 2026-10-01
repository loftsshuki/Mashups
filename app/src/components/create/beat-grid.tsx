"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface BeatGridProps {
  bpm: number
  duration: number
  zoom: number
  offset?: number
  pixelsPerSecond?: number
  highlightBeats?: boolean
  className?: string
}

const PIXELS_PER_SECOND = 50

export function BeatGrid({
  bpm,
  duration,
  zoom,
  offset = 0,
  pixelsPerSecond = PIXELS_PER_SECOND,
  highlightBeats = true,
  className,
}: BeatGridProps) {
  // Calculate beat positions
  const beatPositions = useMemo(() => {
    const beatInterval = 60 / bpm
    const positions: { time: number; isBar: boolean; isHalfBar: boolean }[] = []
    
    // Start from offset
    for (let t = offset; t <= duration; t += beatInterval) {
      const beatIndex = Math.round((t - offset) / beatInterval)
      positions.push({
        time: t,
        isBar: beatIndex % 4 === 0, // Every 4 beats is a bar
        isHalfBar: beatIndex % 2 === 0, // Every 2 beats
      })
    }
    
    return positions
  }, [bpm, duration, offset])

  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      {beatPositions.map((beat, index) => {
        const left = beat.time * pixelsPerSecond * zoom
        
        return (
          <div
            key={index}
            className={cn(
              "absolute top-0 bottom-0 border-l",
              beat.isBar
                ? "border-primary/40 border-l-2"
                : beat.isHalfBar
                ? "border-primary/25"
                : "border-primary/10"
            )}
            style={{ left }}
          >
            {/* Beat number on bar lines */}
            {beat.isBar && highlightBeats && (
              <span className="absolute -top-4 left-1 text-[9px] text-primary/50 font-mono">
                {Math.floor(index / 4) + 1}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
