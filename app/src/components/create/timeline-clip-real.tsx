"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useWaveform } from "@/lib/hooks/use-waveform"
import type { TimelineClip } from "./waveform-timeline"

interface TimelineClipRealProps {
  clip: TimelineClip
  isSelected: boolean
  zoom: number
  trackColor: string
  onSelect?: () => void
  onMove?: (newStartTime: number) => void
  onTrimStart?: (newStartTime: number, newOffset: number) => void
  onTrimEnd?: (newDuration: number) => void
  pixelsPerSecond?: number
}

const PIXELS_PER_SECOND = 50

export function TimelineClipReal({
  clip,
  isSelected,
  zoom,
  trackColor,
  onSelect,
  onMove,
  onTrimStart,
  onTrimEnd,
  pixelsPerSecond = PIXELS_PER_SECOND,
}: TimelineClipRealProps) {
  const clipRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isTrimmingStart, setIsTrimmingStart] = useState(false)
  const [isTrimmingEnd, setIsTrimmingEnd] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartTime, setDragStartTime] = useState(0)
  const [visualStartTime, setVisualStartTime] = useState(clip.startTime)
  const [visualDuration, setVisualDuration] = useState(clip.duration)
  const [visualOffset, setVisualOffset] = useState(clip.offset)

  // Load real waveform data
  const { data: waveformData, isLoading } = useWaveform(clip.audioUrl, {
    barCount: Math.max(50, Math.min(200, Math.floor(clip.duration * 10))),
    startTime: clip.offset,
    duration: clip.duration,
  })

  // Reset visual state when clip changes
  useEffect(() => {
    setVisualStartTime(clip.startTime)
    setVisualDuration(clip.duration)
    setVisualOffset(clip.offset)
  }, [clip.startTime, clip.duration, clip.offset])

  // Mouse handlers for dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelect?.()

      const target = e.target as HTMLElement
      const isTrimHandle = target.dataset.trim === "start" || target.dataset.trim === "end"

      if (isTrimHandle) {
        if (target.dataset.trim === "start") {
          setIsTrimmingStart(true)
        } else {
          setIsTrimmingEnd(true)
        }
      } else {
        setIsDragging(true)
        setDragStartX(e.clientX)
        setDragStartTime(clip.startTime)
      }
    },
    [clip.startTime, onSelect]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging && !isTrimmingStart && !isTrimmingEnd) return

      const deltaX = e.clientX - dragStartX
      const deltaTime = deltaX / (pixelsPerSecond * zoom)

      if (isDragging) {
        const newStartTime = Math.max(0, dragStartTime + deltaTime)
        setVisualStartTime(newStartTime)
      } else if (isTrimmingStart) {
        const maxTrim = clip.duration - 0.1
        const trimAmount = Math.max(0, Math.min(deltaTime, maxTrim))
        setVisualStartTime(clip.startTime + trimAmount)
        setVisualDuration(clip.duration - trimAmount)
        setVisualOffset(clip.offset + trimAmount)
      } else if (isTrimmingEnd) {
        const minDuration = 0.1
        const newDuration = Math.max(minDuration, clip.duration + deltaTime)
        setVisualDuration(newDuration)
      }
    },
    [
      isDragging,
      isTrimmingStart,
      isTrimmingEnd,
      dragStartX,
      dragStartTime,
      pixelsPerSecond,
      zoom,
      clip.startTime,
      clip.duration,
      clip.offset,
    ]
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onMove?.(visualStartTime)
    } else if (isTrimmingStart) {
      onTrimStart?.(visualStartTime, visualOffset)
    } else if (isTrimmingEnd) {
      onTrimEnd?.(visualDuration)
    }

    setIsDragging(false)
    setIsTrimmingStart(false)
    setIsTrimmingEnd(false)
  }, [
    isDragging,
    isTrimmingStart,
    isTrimmingEnd,
    visualStartTime,
    visualDuration,
    visualOffset,
    onMove,
    onTrimStart,
    onTrimEnd,
  ])

  // Calculate dimensions
  const clipWidth = visualDuration * pixelsPerSecond * zoom
  const leftPosition = visualStartTime * pixelsPerSecond * zoom

  // Get waveform peaks (real or fallback)
  const peaks = waveformData?.peaks || generateFallbackPeaks(100)

  return (
    <div
      ref={clipRef}
      className={cn(
        "absolute top-1 bottom-1 rounded-lg border-2 overflow-hidden select-none",
        isSelected
          ? "border-primary ring-2 ring-primary/20 z-10"
          : "border-transparent hover:border-primary/50 z-0",
        (isDragging || isTrimmingStart || isTrimmingEnd) && "cursor-grabbing z-20"
      )}
      style={{
        left: leftPosition,
        width: Math.max(clipWidth, 30),
        minWidth: 30,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Clip background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundColor: clip.color }}
      />

      {/* Clip header */}
      <div
        className="relative h-5 px-2 flex items-center justify-between text-[10px] font-medium text-white"
        style={{ backgroundColor: clip.color }}
      >
        <span className="truncate">{clip.name}</span>
        <span className="opacity-70">{visualDuration.toFixed(1)}s</span>
      </div>

      {/* Real Waveform */}
      <div className="relative h-[calc(100%-20px)] flex items-center gap-[1px] px-1 py-0.5">
        {isLoading ? (
          // Loading skeleton
          <div className="flex w-full h-full items-center gap-[1px]">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-full bg-current opacity-20 animate-pulse"
                style={{
                  height: `${30 + Math.random() * 40}%`,
                  color: clip.color,
                }}
              />
            ))}
          </div>
        ) : (
          // Real waveform
          peaks.map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-full transition-all"
              style={{
                height: `${Math.max(4, height * 100)}%`,
                backgroundColor: clip.color,
                opacity: 0.5 + height * 0.5,
                minHeight: 2,
              }}
            />
          ))
        )}
      </div>

      {/* Fade overlays */}
      {clip.fadeIn && clip.fadeIn > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-black/30 to-transparent pointer-events-none"
          style={{
            width: `${Math.min((clip.fadeIn / visualDuration) * 100, 30)}%`,
          }}
        />
      )}
      {clip.fadeOut && clip.fadeOut > 0 && (
        <div
          className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-black/30 to-transparent pointer-events-none"
          style={{
            width: `${Math.min((clip.fadeOut / visualDuration) * 100, 30)}%`,
          }}
        />
      )}

      {/* Trim handles */}
      {isSelected && (
        <>
          <div
            data-trim="start"
            className="absolute left-0 top-0 bottom-0 w-3 cursor-w-resize flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <div className="w-0.5 h-8 bg-white/70 rounded-full" />
          </div>
          <div
            data-trim="end"
            className="absolute right-0 top-0 bottom-0 w-3 cursor-e-resize flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <div className="w-0.5 h-8 bg-white/70 rounded-full" />
          </div>
        </>
      )}

      {/* Volume indicator */}
      {clip.volume < 100 && (
        <div className="absolute top-6 right-1 text-[8px] text-white/70 bg-black/30 px-1 rounded">
          {clip.volume}%
        </div>
      )}

      {/* Mute indicator */}
      {clip.muted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-xs font-bold text-white">MUTED</span>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute bottom-1 left-1 text-[8px] text-white/70 bg-black/30 px-1 rounded">
          Analyzing...
        </div>
      )}
    </div>
  )
}

function generateFallbackPeaks(count: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const position = i / count
    const envelope = Math.sin(position * Math.PI)
    const detail = Math.sin(i * 0.5) * 0.3 + Math.cos(i * 0.7) * 0.2
    return Math.max(0.1, Math.min(0.9, envelope * 0.6 + detail))
  })
}
