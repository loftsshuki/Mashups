"use client"

import { useRef, useCallback, useState, useEffect } from "react"

import { cn } from "@/lib/utils"
import { useAudio } from "@/lib/audio/audio-context"

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

interface ProgressBarProps {
  className?: string
  showTime?: boolean
}

export function ProgressBar({ className, showTime = true }: ProgressBarProps) {
  const { state, seek } = useAudio()
  const barRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragTime, setDragTime] = useState(0)

  const hasTrack = !!state.currentTrack
  const duration = state.duration || 0
  const displayTime = isDragging ? dragTime : state.currentTime
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0

  const getTimeFromEvent = useCallback(
    (clientX: number): number => {
      if (!barRef.current || duration <= 0) return 0
      const rect = barRef.current.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      return ratio * duration
    },
    [duration],
  )

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hasTrack || duration <= 0) return
      const time = getTimeFromEvent(e.clientX)
      seek(time)
    },
    [hasTrack, duration, getTimeFromEvent, seek],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hasTrack || duration <= 0) return
      e.preventDefault()
      setIsDragging(true)
      setDragTime(getTimeFromEvent(e.clientX))
    },
    [hasTrack, duration, getTimeFromEvent],
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setDragTime(getTimeFromEvent(e.clientX))
    }

    const handleMouseUp = (e: MouseEvent) => {
      const time = getTimeFromEvent(e.clientX)
      seek(time)
      setIsDragging(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, getTimeFromEvent, seek])

  return (
    <div className={cn("w-full select-none", className)}>
      {/* Bar */}
      <div
        ref={barRef}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={displayTime}
        tabIndex={hasTrack ? 0 : -1}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        className={cn(
          "group relative w-full rounded-full bg-muted transition-all",
          hasTrack ? "cursor-pointer" : "cursor-default",
          "h-1.5 hover:h-2",
        )}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      {/* Time display */}
      {showTime && (
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>{hasTrack ? formatTime(displayTime) : "--:--"}</span>
          <span>{hasTrack ? formatTime(duration) : "--:--"}</span>
        </div>
      )}
    </div>
  )
}
