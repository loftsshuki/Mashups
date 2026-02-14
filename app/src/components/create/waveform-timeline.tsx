"use client"

import { useRef, useState, useCallback, useEffect, useMemo } from "react"
import { ZoomIn, ZoomOut, Scissors, Copy, ClipboardPaste, Trash2, Move } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"

export interface TimelineClip {
  id: string
  trackId: string
  name: string
  audioUrl: string
  startTime: number // Start time in the timeline (seconds)
  duration: number // Duration of the clip (seconds)
  offset: number // Offset into the source audio (seconds)
  color: string
  fadeIn?: number // Fade in duration (seconds)
  fadeOut?: number // Fade out duration (seconds)
  volume: number // 0-100
  muted: boolean
}

export interface TimelineTrack {
  id: string
  name: string
  type: "audio" | "stem"
  stemType?: "vocals" | "drums" | "bass" | "other"
  clips: TimelineClip[]
  height: number
  color: string
}

interface WaveformTimelineProps {
  tracks: TimelineTrack[]
  totalDuration: number
  onTracksChange?: (tracks: TimelineTrack[]) => void
  onPlayheadChange?: (time: number) => void
  isPlaying?: boolean
  currentTime?: number
  className?: string
}

const MIN_ZOOM = 0.1 // 10% zoom (10x zoomed out)
const MAX_ZOOM = 10 // 1000% zoom (10x zoomed in)
const PIXELS_PER_SECOND = 50 // Base scale: 50px = 1 second

export function WaveformTimeline({
  tracks,
  totalDuration,
  onTracksChange,
  onPlayheadChange,
  isPlaying = false,
  currentTime = 0,
  className,
}: WaveformTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [scrollX, setScrollX] = useState(0)
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; clipId: string } | null>(null)

  // Calculate timeline dimensions
  const timelineWidth = useMemo(() => {
    return Math.max(
      totalDuration * PIXELS_PER_SECOND * zoom,
      containerRef.current?.clientWidth || 1000
    )
  }, [totalDuration, zoom])

  // Time ruler markers
  const timeMarkers = useMemo(() => {
    const markers = []
    const step = zoom < 0.5 ? 10 : zoom < 1 ? 5 : zoom < 2 ? 1 : 0.5
    for (let t = 0; t <= totalDuration + step; t += step) {
      markers.push(t)
    }
    return markers
  }, [totalDuration, zoom])

  // Handle zoom
  const handleZoomChange = useCallback((value: number[]) => {
    const newZoom = value[0] ?? 1
    setZoom(newZoom)
  }, [])

  const zoomIn = () => setZoom((z) => Math.min(z * 1.5, MAX_ZOOM))
  const zoomOut = () => setZoom((z) => Math.max(z / 1.5, MIN_ZOOM))
  const resetZoom = () => setZoom(1)

  // Handle timeline click (move playhead)
  const handleTimelineClick = useCallback(
    (e: React.MouseEvent) => {
      if (!timelineRef.current || isDragging) return
      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left + scrollX
      const time = x / (PIXELS_PER_SECOND * zoom)
      onPlayheadChange?.(Math.max(0, Math.min(time, totalDuration)))
    },
    [zoom, scrollX, totalDuration, onPlayheadChange, isDragging]
  )

  // Clip drag handlers
  const handleClipMouseDown = useCallback(
    (e: React.MouseEvent, clipId: string) => {
      e.stopPropagation()
      setSelectedClipId(clipId)
      setIsDragging(true)
      setDragStart({ x: e.clientX, clipId })
    },
    []
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !dragStart) return
      // Drag logic would go here
    },
    [isDragging, dragStart]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragStart(null)
  }, [])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`
  }

  // Generate simple waveform data (would be replaced with actual audio analysis)
  const generateWaveformData = (clip: TimelineClip) => {
    const bars = 100
    return Array.from({ length: bars }, (_, i) => {
      const base = Math.sin((i / bars) * Math.PI * 3.5) * 0.35
      const detail = Math.sin(i * 0.8) * 0.15 + Math.cos(i * 1.3) * 0.1
      return Math.max(0.08, Math.min(0.95, 0.4 + base + detail))
    })
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/50 p-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Slider
            value={[zoom]}
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.1}
            onValueChange={handleZoomChange}
            className="w-32"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <Scissors className="h-3.5 w-3.5" />
            Split
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <ClipboardPaste className="h-3.5 w-3.5" />
            Paste
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>
        </div>
      </div>

      {/* Timeline Container */}
      <div
        ref={containerRef}
        className="relative overflow-auto rounded-xl border border-border/50 bg-card"
        onScroll={(e) => setScrollX(e.currentTarget.scrollLeft)}
      >
        <div
          ref={timelineRef}
          className="relative min-h-[300px]"
          style={{ width: timelineWidth }}
          onClick={handleTimelineClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Time Ruler */}
          <div className="sticky top-0 z-20 h-8 border-b border-border bg-card/95 backdrop-blur">
            {timeMarkers.map((time) => (
              <div
                key={time}
                className="absolute top-0 flex flex-col items-center text-[10px] text-muted-foreground"
                style={{
                  left: time * PIXELS_PER_SECOND * zoom,
                  transform: "translateX(-50%)",
                }}
              >
                <span className="mt-1">{formatTime(time)}</span>
                <div className="h-2 w-px bg-border" />
              </div>
            ))}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 z-30 w-px bg-primary pointer-events-none"
            style={{
              left: currentTime * PIXELS_PER_SECOND * zoom,
            }}
          >
            <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-primary rotate-45" />
          </div>

          {/* Tracks */}
          <div className="relative">
            {tracks.map((track, trackIndex) => (
              <div
                key={track.id}
                className={cn(
                  "relative border-b border-border/50",
                  trackIndex % 2 === 0 ? "bg-card" : "bg-muted/20"
                )}
                style={{ height: track.height }}
              >
                {/* Track Label */}
                <div className="sticky left-0 z-10 float-left w-32 h-full border-r border-border bg-card/95 backdrop-blur p-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: track.color }}
                    />
                    <span className="text-xs font-medium truncate">{track.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {track.clips.length} clip{track.clips.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Clips */}
                {track.clips.map((clip) => {
                  const waveformBars = generateWaveformData(clip)
                  const isSelected = selectedClipId === clip.id

                  return (
                    <div
                      key={clip.id}
                      className={cn(
                        "absolute top-2 bottom-2 rounded-lg border-2 cursor-move overflow-hidden transition-all",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-transparent bg-muted/50 hover:bg-muted"
                      )}
                      style={{
                        left: clip.startTime * PIXELS_PER_SECOND * zoom + 128, // Offset for track label
                        width: clip.duration * PIXELS_PER_SECOND * zoom,
                      }}
                      onMouseDown={(e) => handleClipMouseDown(e, clip.id)}
                    >
                      {/* Clip Header */}
                      <div
                        className="h-5 px-2 flex items-center justify-between text-[10px] font-medium"
                        style={{ backgroundColor: clip.color }}
                      >
                        <span className="truncate text-white">{clip.name}</span>
                        <Move className="h-3 w-3 text-white/70" />
                      </div>

                      {/* Waveform Visualization */}
                      <div className="flex items-center justify-center h-[calc(100%-20px)] gap-[1px] px-1">
                        {waveformBars.map((height, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-full bg-current opacity-60"
                            style={{
                              height: `${height * 100}%`,
                              color: clip.color,
                            }}
                          />
                        ))}
                      </div>

                      {/* Fade handles (visual only for now) */}
                      {clip.fadeIn && clip.fadeIn > 0 && (
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"
                          style={{
                            width: Math.min(
                              (clip.fadeIn / clip.duration) * 100,
                              20
                            ) + "%",
                          }}
                        />
                      )}
                      {clip.fadeOut && clip.fadeOut > 0 && (
                        <div
                          className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-black/20 to-transparent pointer-events-none"
                          style={{
                            width: Math.min(
                              (clip.fadeOut / clip.duration) * 100,
                              20
                            ) + "%",
                          }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Empty state */}
          {tracks.length === 0 && (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              <p className="text-sm">No tracks yet. Upload audio to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {tracks.length} track{tracks.length !== 1 ? "s" : ""} •{" "}
          {tracks.reduce((acc, t) => acc + t.clips.length, 0)} clip
          {tracks.reduce((acc, t) => acc + t.clips.length, 0) !== 1 ? "s" : ""}
        </span>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
      </div>
    </div>
  )
}
