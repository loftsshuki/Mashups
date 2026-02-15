"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Link from "next/link"
import { Play, Pause, ArrowRight, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProcessTrack {
  title: string
  artist: string
  entryTime: number // seconds where this stem enters
  color: string
}

interface ProcessPlayerProps {
  title: string
  creatorName: string
  creatorAvatar?: string
  audioUrl: string
  duration: number
  tracks: ProcessTrack[]
  mashupId: string
  className?: string
}

export function ProcessPlayer({
  title,
  creatorName,
  creatorAvatar,
  audioUrl,
  duration,
  tracks,
  mashupId,
  className,
}: ProcessPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [showCta, setShowCta] = useState(false)

  useEffect(() => {
    const audio = new Audio(audioUrl)
    audioRef.current = audio

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime)
    })

    audio.addEventListener("ended", () => {
      setIsPlaying(false)
      setShowCta(true)
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

  const progress = duration > 0 ? currentTime / duration : 0

  return (
    <div className={cn("relative w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-gradient-to-b from-background to-card p-8", className)}>
      {/* Track info */}
      <div className="text-center mb-8 space-y-2">
        {creatorAvatar && (
          <img
            src={creatorAvatar}
            alt={creatorName}
            className="h-16 w-16 rounded-full mx-auto border-2 border-primary/30 object-cover"
          />
        )}
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">by {creatorName}</p>
      </div>

      {/* Stem timeline visualization */}
      <div className="w-full max-w-2xl mb-8 space-y-2">
        {tracks.map((track, i) => {
          const isActive = currentTime >= track.entryTime
          const entryProgress = duration > 0 ? track.entryTime / duration : 0

          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground w-16 text-right shrink-0 truncate">
                {track.title}
              </span>
              <div className="flex-1 h-6 rounded-md bg-muted/20 relative overflow-hidden">
                {/* Entry marker */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-white/20"
                  style={{ left: `${entryProgress * 100}%` }}
                />
                {/* Active region */}
                <div
                  className="absolute top-0 bottom-0 left-0 rounded-md transition-all duration-300"
                  style={{
                    width: isActive ? `${Math.min(progress * 100, 100)}%` : "0%",
                    backgroundColor: track.color,
                    opacity: isActive ? 0.6 : 0,
                    marginLeft: `${entryProgress * 100}%`,
                  }}
                />
                {/* Label */}
                <span className={cn(
                  "absolute inset-0 flex items-center px-2 text-[10px] font-medium transition-colors",
                  isActive ? "text-white" : "text-muted-foreground"
                )}>
                  {track.artist}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Playback controls */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={togglePlay}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
        >
          {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
        </button>

        {/* Progress bar */}
        <div className="w-full max-w-md">
          <div className="h-1.5 rounded-full bg-muted/30">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* End CTA */}
      {showCta && (
        <div className="mt-8 text-center space-y-3 animate-in fade-in">
          <p className="text-sm text-muted-foreground">Inspired? Make your own.</p>
          <Link href={`/create?remix=${mashupId}`}>
            <Button size="lg">
              <Music className="mr-2 h-5 w-5" />
              Make Your Own
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}
