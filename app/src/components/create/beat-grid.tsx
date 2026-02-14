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

interface BeatIndicatorProps {
  bpm: number
  confidence: number
  key?: string
  scale?: string
  className?: string
}

export function BeatIndicator({
  bpm,
  confidence,
  key,
  scale,
  className,
}: BeatIndicatorProps) {
  // Get tempo category
  const getTempoCategory = (bpm: number): { label: string; color: string } => {
    if (bpm < 80) return { label: "Slow", color: "text-blue-400" }
    if (bpm < 110) return { label: "Mid", color: "text-green-400" }
    if (bpm < 130) return { label: "Groovy", color: "text-yellow-400" }
    if (bpm < 150) return { label: "Fast", color: "text-orange-400" }
    return { label: "High Energy", color: "text-red-400" }
  }

  const tempo = getTempoCategory(bpm)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* BPM */}
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold">{bpm}</span>
        <span className="text-xs text-muted-foreground">BPM</span>
      </div>

      {/* Tempo category */}
      <span className={cn("text-xs", tempo.color)}>{tempo.label}</span>

      {/* Confidence indicator */}
      <div className="flex items-center gap-1">
        <div className="w-8 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              confidence > 0.8 ? "bg-green-500" : confidence > 0.5 ? "bg-yellow-500" : "bg-red-500"
            )}
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground">
          {Math.round(confidence * 100)}%
        </span>
      </div>

      {/* Key */}
      {key && (
        <div className="flex items-center gap-1 text-xs">
          <span className="text-muted-foreground">Key:</span>
          <span className="font-medium">
            {key}
            {scale === "minor" ? "m" : ""}
          </span>
        </div>
      )}
    </div>
  )
}

interface CompatibilityBadgeProps {
  score: number
  bpmCompatible: boolean
  keyCompatible: boolean
  className?: string
}

export function CompatibilityBadge({
  score,
  bpmCompatible,
  keyCompatible,
  className,
}: CompatibilityBadgeProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return "bg-green-500/20 text-green-400 border-green-500/30"
    if (score >= 60) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    if (score >= 40) return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    return "bg-red-500/20 text-red-400 border-red-500/30"
  }

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return "Great Match"
    if (score >= 60) return "Good Match"
    if (score >= 40) return "Fair Match"
    return "Poor Match"
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2 py-1 rounded-lg border text-xs",
        getScoreColor(score),
        className
      )}
    >
      <span className="font-medium">{getScoreLabel(score)}</span>
      <span className="opacity-70">({score}%)</span>
      
      <div className="flex gap-1 ml-1">
        {bpmCompatible && (
          <span className="text-[10px] bg-current/20 px-1 rounded">BPM</span>
        )}
        {keyCompatible && (
          <span className="text-[10px] bg-current/20 px-1 rounded">Key</span>
        )}
      </div>
    </div>
  )
}
