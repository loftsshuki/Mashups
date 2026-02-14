"use client"

import { useRef, useState, useCallback, useMemo, useEffect } from "react"
import { ZoomIn, ZoomOut, Scissors, Copy, ClipboardPaste, Trash2, Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { TimelineClipReal } from "./timeline-clip-real"
import { BeatGrid } from "./beat-grid"
import type { TimelineTrack, TimelineClip } from "./waveform-timeline"

interface TimelineEditorProps {
  tracks: TimelineTrack[]
  totalDuration: number
  bpm?: number
  beatOffset?: number
  onTracksChange?: (tracks: TimelineTrack[]) => void
  onPlayheadChange?: (time: number) => void
  isPlaying?: boolean
  currentTime?: number
  onPlayPause?: () => void
  className?: string
}

const MIN_ZOOM = 0.1
const MAX_ZOOM = 10
const PIXELS_PER_SECOND = 50
const TRACK_LABEL_WIDTH = 128

export function TimelineEditor({
  tracks,
  totalDuration,
  bpm = 120,
  beatOffset = 0,
  onTracksChange,
  onPlayheadChange,
  isPlaying = false,
  currentTime = 0,
  onPlayPause,
  className,
}: TimelineEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)
  const [clipboard, setClipboard] = useState<TimelineClip | null>(null)
  const [localTracks, setLocalTracks] = useState<TimelineTrack[]>(tracks)

  // Sync with props
  useEffect(() => {
    setLocalTracks(tracks)
  }, [tracks])

  // Calculate dimensions
  const timelineWidth = useMemo(() => {
    const contentWidth = totalDuration * PIXELS_PER_SECOND * zoom
    const minWidth = (containerRef.current?.clientWidth || 800) - TRACK_LABEL_WIDTH
    return Math.max(contentWidth, minWidth)
  }, [totalDuration, zoom])

  // Time markers
  const timeMarkers = useMemo(() => {
    const markers = []
    let step = 1
    if (zoom < 0.3) step = 10
    else if (zoom < 0.6) step = 5
    else if (zoom < 1.5) step = 1
    else if (zoom < 3) step = 0.5
    else step = 0.25

    for (let t = 0; t <= totalDuration + step; t += step) {
      markers.push(t)
    }
    return markers
  }, [totalDuration, zoom])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`
  }

  // Handle timeline click
  const handleTimelineClick = useCallback(
    (e: React.MouseEvent) => {
      if (!timelineRef.current) return
      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - TRACK_LABEL_WIDTH
      const time = x / (PIXELS_PER_SECOND * zoom)
      onPlayheadChange?.(Math.max(0, Math.min(time, totalDuration)))
    },
    [zoom, totalDuration, onPlayheadChange]
  )

  // Clip operations
  const updateClip = useCallback(
    (trackId: string, clipId: string, updates: Partial<TimelineClip>) => {
      const newTracks = localTracks.map((track) =>
        track.id === trackId
          ? {
              ...track,
              clips: track.clips.map((clip) =>
                clip.id === clipId ? { ...clip, ...updates } : clip
              ),
            }
          : track
      )
      setLocalTracks(newTracks)
      onTracksChange?.(newTracks)
    },
    [localTracks, onTracksChange]
  )

  const handleClipMove = useCallback(
    (trackId: string, clipId: string, newStartTime: number) => {
      updateClip(trackId, clipId, { startTime: newStartTime })
    },
    [updateClip]
  )

  const handleClipTrimStart = useCallback(
    (trackId: string, clipId: string, newStartTime: number, newOffset: number) => {
      const clip = localTracks
        .find((t) => t.id === trackId)
        ?.clips.find((c) => c.id === clipId)
      if (!clip) return

      const durationChange = newStartTime - clip.startTime
      updateClip(trackId, clipId, {
        startTime: newStartTime,
        offset: newOffset,
        duration: clip.duration - durationChange,
      })
    },
    [localTracks, updateClip]
  )

  const handleClipTrimEnd = useCallback(
    (trackId: string, clipId: string, newDuration: number) => {
      updateClip(trackId, clipId, { duration: newDuration })
    },
    [updateClip]
  )

  // Delete selected clip
  const handleDelete = useCallback(() => {
    if (!selectedClipId) return

    const newTracks = localTracks.map((track) => ({
      ...track,
      clips: track.clips.filter((c) => c.id !== selectedClipId),
    }))

    setLocalTracks(newTracks)
    onTracksChange?.(newTracks)
    setSelectedClipId(null)
  }, [selectedClipId, localTracks, onTracksChange])

  // Copy selected clip
  const handleCopy = useCallback(() => {
    if (!selectedClipId) return

    const clip = localTracks
      .flatMap((t) => t.clips)
      .find((c) => c.id === selectedClipId)

    if (clip) {
      setClipboard({ ...clip, id: `copy-${Date.now()}` })
    }
  }, [selectedClipId, localTracks])

  // Paste clip
  const handlePaste = useCallback(() => {
    if (!clipboard) return

    // Find track with selection or first track
    const targetTrackId =
      localTracks.find((t) => t.clips.some((c) => c.id === selectedClipId))?.id ||
      localTracks[0]?.id

    if (!targetTrackId) return

    const newClip: TimelineClip = {
      ...clipboard,
      id: `clip-${Date.now()}`,
      startTime: currentTime,
    }

    const newTracks = localTracks.map((track) =>
      track.id === targetTrackId
        ? { ...track, clips: [...track.clips, newClip] }
        : track
    )

    setLocalTracks(newTracks)
    onTracksChange?.(newTracks)
  }, [clipboard, localTracks, currentTime, selectedClipId, onTracksChange])

  // Split clip at playhead
  const handleSplit = useCallback(() => {
    if (!selectedClipId) return

    const trackWithClip = localTracks.find((t) =>
      t.clips.some((c) => c.id === selectedClipId)
    )
    if (!trackWithClip) return

    const clip = trackWithClip.clips.find((c) => c.id === selectedClipId)
    if (!clip) return

    // Check if playhead is within clip
    const clipEnd = clip.startTime + clip.duration
    if (currentTime <= clip.startTime || currentTime >= clipEnd) return

    const splitPoint = currentTime - clip.startTime
    const firstDuration = splitPoint
    const secondDuration = clip.duration - splitPoint
    const secondOffset = clip.offset + splitPoint

    const newClip: TimelineClip = {
      ...clip,
      id: `clip-${Date.now()}`,
      startTime: currentTime,
      duration: secondDuration,
      offset: secondOffset,
    }

    const newTracks = localTracks.map((track) =>
      track.id === trackWithClip.id
        ? {
            ...track,
            clips: track.clips
              .map((c) =>
                c.id === selectedClipId ? { ...c, duration: firstDuration } : c
              )
              .concat(newClip),
          }
        : track
    )

    setLocalTracks(newTracks)
    onTracksChange?.(newTracks)
  }, [selectedClipId, localTracks, currentTime, onTracksChange])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch (e.key) {
        case "Delete":
        case "Backspace":
          handleDelete()
          break
        case "c":
          if (e.ctrlKey || e.metaKey) handleCopy()
          break
        case "v":
          if (e.ctrlKey || e.metaKey) handlePaste()
          break
        case " ":
          e.preventDefault()
          onPlayPause?.()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleDelete, handleCopy, handlePaste, onPlayPause])

  // Zoom controls
  const zoomIn = () => setZoom((z) => Math.min(z * 1.5, MAX_ZOOM))
  const zoomOut = () => setZoom((z) => Math.max(z / 1.5, MIN_ZOOM))

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/50 p-2">
        {/* Transport */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPlayheadChange?.(0)}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button variant="default" size="icon" className="h-8 w-8" onClick={onPlayPause}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPlayheadChange?.(totalDuration)}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Edit tools */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={handleSplit} disabled={!selectedClipId}>
            <Scissors className="h-3.5 w-3.5" />
            Split
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={handleCopy} disabled={!selectedClipId}>
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={handlePaste} disabled={!clipboard}>
            <ClipboardPaste className="h-3.5 w-3.5" />
            Paste
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-destructive"
            onClick={handleDelete}
            disabled={!selectedClipId}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomOut} disabled={zoom <= MIN_ZOOM}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Slider value={[zoom]} min={MIN_ZOOM} max={MAX_ZOOM} step={0.1} onValueChange={(v) => setZoom(v[0] ?? 1)} className="w-28" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomIn} disabled={zoom >= MAX_ZOOM}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Time display */}
        <div className="ml-auto flex items-center gap-2 text-sm font-mono">
          <span className="text-primary">{formatTime(currentTime)}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={containerRef}
        className="relative overflow-auto rounded-xl border border-border/50 bg-card"
        style={{ maxHeight: "500px" }}
      >
        <div
          ref={timelineRef}
          className="relative"
          style={{ width: timelineWidth + TRACK_LABEL_WIDTH }}
          onClick={handleTimelineClick}
        >
          {/* Time Ruler */}
          <div
            className="sticky top-0 z-20 h-8 border-b border-border bg-card/95 backdrop-blur flex items-end"
            style={{ marginLeft: TRACK_LABEL_WIDTH }}
          >
            {timeMarkers.map((time) => (
              <div
                key={time}
                className="absolute bottom-0 flex flex-col items-center text-[10px] text-muted-foreground"
                style={{
                  left: time * PIXELS_PER_SECOND * zoom,
                  transform: "translateX(-50%)",
                }}
              >
                <span className="mb-0.5">{formatTime(time)}</span>
                <div className="h-2 w-px bg-border" />
              </div>
            ))}
          </div>

          {/* Tracks */}
          <div className="relative">
            {localTracks.map((track, index) => (
              <div
                key={track.id}
                className={cn(
                  "relative border-b border-border/50",
                  index % 2 === 0 ? "bg-card" : "bg-muted/10"
                )}
                style={{ height: track.height }}
              >
                {/* Track Label */}
                <div className="sticky left-0 z-10 float-left h-full w-32 border-r border-border bg-card/95 backdrop-blur p-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: track.color }} />
                    <span className="text-xs font-medium truncate">{track.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {track.clips.length} clip{track.clips.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Clips Container */}
                <div className="relative h-full" style={{ marginLeft: TRACK_LABEL_WIDTH }}>
                  {/* Beat Grid Overlay */}
                  <BeatGrid
                    bpm={bpm}
                    duration={totalDuration}
                    zoom={zoom}
                    offset={beatOffset}
                    pixelsPerSecond={PIXELS_PER_SECOND}
                  />
                  
                  {track.clips.map((clip) => (
                    <TimelineClipReal
                      key={clip.id}
                      clip={clip}
                      isSelected={selectedClipId === clip.id}
                      zoom={zoom}
                      trackColor={track.color}
                      onSelect={() => setSelectedClipId(clip.id)}
                      onMove={(newStart) => handleClipMove(track.id, clip.id, newStart)}
                      onTrimStart={(newStart, newOffset) =>
                        handleClipTrimStart(track.id, clip.id, newStart, newOffset)
                      }
                      onTrimEnd={(newDuration) => handleClipTrimEnd(track.id, clip.id, newDuration)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 z-30 w-px bg-primary pointer-events-none"
              style={{ left: TRACK_LABEL_WIDTH + currentTime * PIXELS_PER_SECOND * zoom }}
            >
              <div className="absolute -top-1 -left-1.5 h-3 w-3 rotate-45 bg-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {localTracks.length} track{localTracks.length !== 1 ? "s" : ""} •{" "}
          {localTracks.reduce((acc, t) => acc + t.clips.length, 0)} clip
          {localTracks.reduce((acc, t) => acc + t.clips.length, 0) !== 1 ? "s" : ""}
          {selectedClipId && " • Selected: 1 clip"}
        </span>
        <div className="flex gap-4">
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <span className="text-[10px]">
            Shortcuts: Space=Play, Ctrl+C=Copy, Ctrl+V=Paste, Delete=Remove
          </span>
        </div>
      </div>
    </div>
  )
}
