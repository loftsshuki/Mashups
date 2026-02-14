"use client"

import { useRef, useState, useCallback, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import type { TimelineClip } from "./waveform-timeline"

interface TimelineClipEditorProps {
  clip: TimelineClip
  isSelected: boolean
  zoom: number
  trackColor: string
  onSelect?: () => void
  onMove?: (newStartTime: number) => void
  onTrimStart?: (newStartTime: number, newOffset: number) => void
  onTrimEnd?: (newDuration: number) => void
  onFadeInChange?: (duration: number) => void
  onFadeOutChange?: (duration: number) => void
  pixelsPerSecond?: number
}

const PIXELS_PER_SECOND = 50

export function TimelineClipEditor({
  clip,
  isSelected,
  zoom,
  trackColor,
  onSelect,
  onMove,
  onTrimStart,
  onTrimEnd,
  onFadeInChange,
  onFadeOutChange,
  pixelsPerSecond = PIXELS_PER_SECOND,
}: TimelineClipEditorProps) {
  const clipRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isTrimmingStart, setIsTrimmingStart] = useState(false)
  const [isTrimmingEnd, setIsTrimmingEnd] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartTime, setDragStartTime] = useState(0)
  const [visualStartTime, setVisualStartTime] = useState(clip.startTime)
  const [visualDuration, setVisualDuration] = useState(clip.duration)
  const [visualOffset, setVisualOffset] = useState(clip.offset)

  // Reset visual state when clip changes
  useEffect(() => {
    setVisualStartTime(clip.startTime)
    setVisualDuration(clip.duration)
    setVisualOffset(clip.offset)
  }, [clip.startTime, clip.duration, clip.offset])

  // Generate waveform bars
  const waveformBars = useCallback(() => {
    const bars = 80
    return Array.from({ length: bars }, (_, i) => {
      // Create a pseudo-random but visually pleasing waveform
      const position = i / bars
      const envelope = Math.sin(position * Math.PI) // Envelope shape
      const detail = Math.sin(i * 0.5) * 0.3 + Math.cos(i * 0.7) * 0.2
      const noise = Math.sin(i * 2.3) * 0.1
      return Math.max(0.1, Math.min(0.9, envelope * 0.6 + detail + noise))
    })
  }, [clip.audioUrl])

  const bars = useMemo(() => waveformBars(), [waveformBars])

  // Mouse handlers for dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelect?.()

      const target = e.target as HTMLElement
      const isTrimHandle = target.dataset.trim === "start" || target.dataset.trim === "end"

      if (isTrimHandle) {
        // Handle trim
        if (target.dataset.trim === "start") {
          setIsTrimmingStart(true)
        } else {
          setIsTrimmingEnd(true)
        }
      } else {
        // Handle move
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
        // Trim from start
        const maxTrim = clip.duration - 0.1 // Minimum 0.1s clip
        const trimAmount = Math.max(0, Math.min(deltaTime, maxTrim))
        setVisualStartTime(clip.startTime + trimAmount)
        setVisualDuration(clip.duration - trimAmount)
        setVisualOffset(clip.offset + trimAmount)
      } else if (isTrimmingEnd) {
        // Trim from end
        const minDuration = 0.1 // Minimum 0.1s
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
        width: clipWidth,
        minWidth: 20,
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

      {/* Waveform */}
      <div className="relative h-[calc(100%-20px)] flex items-center gap-[2px] px-2 py-1">
        {bars.map((height, i) => (
          <div
            key={i}
            className="flex-1 rounded-full transition-all"
            style={{
              height: `${height * 80}%`,
              backgroundColor: clip.color,
              opacity: 0.6 + height * 0.4,
            }}
          />
        ))}
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

      {/* Trim handles (visible on hover or selection) */}
      {isSelected && (
        <>
          {/* Left trim handle */}
          <div
            data-trim="start"
            className="absolute left-0 top-0 bottom-0 w-3 cursor-w-resize flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <div className="w-0.5 h-8 bg-white/70 rounded-full" />
          </div>

          {/* Right trim handle */}
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
    </div>
  )
}
