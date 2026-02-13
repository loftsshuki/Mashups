"use client"

import { useRef, useEffect, useState } from "react"
import { useAudio } from "@/lib/audio/audio-context"
import { cn } from "@/lib/utils"

interface WaveformProps {
  className?: string
  barCount?: number
  height?: number
}

export function Waveform({ className, barCount = 80, height = 96 }: WaveformProps) {
  const { state, seek } = useAudio()
  const containerRef = useRef<HTMLDivElement>(null)
  const [bars] = useState(() =>
    Array.from({ length: barCount }, (_, i) => {
      // Generate a pseudo-random but deterministic waveform shape
      const base = Math.sin((i / barCount) * Math.PI * 3.5) * 0.35
      const detail = Math.sin(i * 0.8) * 0.15 + Math.cos(i * 1.3) * 0.1
      return Math.max(0.08, Math.min(0.95, 0.4 + base + detail))
    })
  )

  const progress = state.duration > 0 ? state.currentTime / state.duration : 0

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current || state.duration <= 0) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const fraction = x / rect.width
    seek(fraction * state.duration)
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-center gap-[2px] cursor-pointer select-none",
        !state.currentTrack && "pointer-events-none opacity-50",
        className
      )}
      style={{ height }}
      onClick={handleClick}
      role="slider"
      aria-label="Waveform seek"
      aria-valuemin={0}
      aria-valuemax={state.duration || 100}
      aria-valuenow={state.currentTime}
      tabIndex={0}
    >
      {bars.map((barHeight, i) => {
        const barProgress = i / barCount
        const isActive = barProgress <= progress

        return (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-colors duration-150",
              isActive ? "bg-primary" : "bg-primary/20"
            )}
            style={{ height: `${barHeight * 100}%` }}
          />
        )
      })}
    </div>
  )
}
