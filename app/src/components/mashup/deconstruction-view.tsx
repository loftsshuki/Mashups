"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Volume2, VolumeX, Play, Pause, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface StemTrack {
  id: string
  label: string
  audioUrl: string
  color: string
  instrument: string
}

interface DeconstructionViewProps {
  stems: StemTrack[]
  className?: string
}

interface StemState {
  volume: number
  muted: boolean
  solo: boolean
}

const STEM_COLORS: Record<string, string> = {
  vocal: "#ec4899",
  vocals: "#ec4899",
  drums: "#f59e0b",
  bass: "#10b981",
  synth: "#3b82f6",
  texture: "#8b5cf6",
  other: "#6b7280",
}

export function DeconstructionView({ stems, className }: DeconstructionViewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [stemStates, setStemStates] = useState<Record<string, StemState>>(() => {
    const initial: Record<string, StemState> = {}
    stems.forEach((s) => {
      initial[s.id] = { volume: 80, muted: false, solo: false }
    })
    return initial
  })
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})
  const animationRef = useRef<number | null>(null)

  // Initialize audio elements
  useEffect(() => {
    const refs: Record<string, HTMLAudioElement> = {}
    stems.forEach((stem) => {
      const audio = new Audio(stem.audioUrl)
      audio.preload = "metadata"
      audio.addEventListener("loadedmetadata", () => {
        if (audio.duration > duration) {
          setDuration(audio.duration)
        }
      })
      refs[stem.id] = audio
    })
    audioRefs.current = refs

    return () => {
      Object.values(refs).forEach((audio) => {
        audio.pause()
        audio.src = ""
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stems])

  // Sync volume/mute state
  useEffect(() => {
    const hasSolo = Object.values(stemStates).some((s) => s.solo)

    stems.forEach((stem) => {
      const audio = audioRefs.current[stem.id]
      if (!audio) return

      const state = stemStates[stem.id]
      if (!state) return

      if (hasSolo) {
        audio.volume = state.solo ? state.volume / 100 : 0
      } else {
        audio.volume = state.muted ? 0 : state.volume / 100
      }
    })
  }, [stemStates, stems])

  const updateTime = useCallback(() => {
    const firstAudio = Object.values(audioRefs.current)[0]
    if (firstAudio) {
      setCurrentTime(firstAudio.currentTime)
    }
    animationRef.current = requestAnimationFrame(updateTime)
  }, [])

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      Object.values(audioRefs.current).forEach((a) => a.pause())
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      setIsPlaying(false)
    } else {
      Object.values(audioRefs.current).forEach((a) => {
        void a.play().catch(() => {})
      })
      animationRef.current = requestAnimationFrame(updateTime)
      setIsPlaying(true)
    }
  }, [isPlaying, updateTime])

  const toggleMute = useCallback((stemId: string) => {
    setStemStates((prev) => ({
      ...prev,
      [stemId]: { ...prev[stemId], muted: !prev[stemId].muted, solo: false },
    }))
  }, [])

  const toggleSolo = useCallback((stemId: string) => {
    setStemStates((prev) => {
      const wasSolo = prev[stemId].solo
      const newStates = { ...prev }
      // Clear all solos, then toggle the clicked one
      Object.keys(newStates).forEach((id) => {
        newStates[id] = { ...newStates[id], solo: false }
      })
      if (!wasSolo) {
        newStates[stemId] = { ...newStates[stemId], solo: true, muted: false }
      }
      return newStates
    })
  }, [])

  const setVolume = useCallback((stemId: string, volume: number) => {
    setStemStates((prev) => ({
      ...prev,
      [stemId]: { ...prev[stemId], volume },
    }))
  }, [])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div className={cn("rounded-xl border border-border/70 bg-card/70 p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Deconstruction View</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 rounded-full p-0"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" fill="currentColor" />
            ) : (
              <Play className="h-3.5 w-3.5 ml-0.5" fill="currentColor" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {stems.map((stem) => {
          const state = stemStates[stem.id]
          if (!state) return null
          const color = STEM_COLORS[stem.instrument.toLowerCase()] ?? STEM_COLORS.other
          const hasSolo = Object.values(stemStates).some((s) => s.solo)
          const isActive = hasSolo ? state.solo : !state.muted

          return (
            <div
              key={stem.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all",
                isActive
                  ? "border-border/70 bg-background/50"
                  : "border-border/30 bg-muted/20 opacity-50"
              )}
            >
              {/* Instrument indicator */}
              <div
                className="h-8 w-1 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />

              {/* Label */}
              <div className="min-w-[80px]">
                <p className="text-xs font-medium text-foreground">{stem.label}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{stem.instrument}</p>
              </div>

              {/* Volume slider */}
              <div className="flex-1 mx-2">
                <Slider
                  value={[state.volume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) => setVolume(stem.id, v[0] ?? 80)}
                  className="w-full"
                />
              </div>

              {/* Mute button */}
              <Button
                size="sm"
                variant={state.muted ? "destructive" : "ghost"}
                className="h-7 w-7 p-0 shrink-0"
                onClick={() => toggleMute(stem.id)}
              >
                {state.muted ? (
                  <VolumeX className="h-3.5 w-3.5" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5" />
                )}
              </Button>

              {/* Solo button */}
              <Button
                size="sm"
                variant={state.solo ? "default" : "outline"}
                className="h-7 px-2 text-[10px] font-bold shrink-0"
                onClick={() => toggleSolo(stem.id)}
              >
                S
              </Button>
            </div>
          )
        })}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Toggle stems on/off to hear each layer. Solo (S) isolates a single stem.
      </p>
    </div>
  )
}
