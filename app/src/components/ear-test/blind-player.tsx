"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"

interface BlindPlayerProps {
  audioUrl: string
  index: number
  rating: number | null
  onRate: (rating: number) => void
  className?: string
}

export function BlindPlayer({ audioUrl, index, rating, onRate, className }: BlindPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = new Audio(audioUrl)
    audioRef.current = audio

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration)
    })

    audio.addEventListener("timeupdate", () => {
      if (audio.duration > 0) {
        setProgress(audio.currentTime / audio.duration)
      }
    })

    audio.addEventListener("ended", () => {
      setIsPlaying(false)
      setProgress(0)
    })

    return () => {
      audio.pause()
      audio.src = ""
    }
  }, [audioUrl])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      void audio.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className={cn("rounded-xl border border-border/70 bg-card/70 p-5 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Track #{index + 1}</span>
        {duration > 0 && (
          <span className="text-xs text-muted-foreground">
            {formatTime(progress * duration)} / {formatTime(duration)}
          </span>
        )}
      </div>

      {/* Play + Waveform */}
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </button>

        {/* Placeholder waveform */}
        <div className="flex-1 h-10 flex items-center gap-[2px]">
          {Array.from({ length: 50 }, (_, i) => {
            const filled = i / 50 <= progress
            const barHeight = 20 + Math.sin(i * 0.3 + index * 2) * 60 + Math.random() * 20
            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-colors"
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: filled ? "var(--color-primary)" : "rgba(255,255,255,0.1)",
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Rate this track:</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onRate(star)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold transition-all",
                rating !== null && star <= rating
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/50 bg-background/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {star}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
