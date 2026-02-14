"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Drum, Guitar, Music, Volume2, VolumeX, Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { SeparatedStems } from "./stem-upload-zone"

export interface StemTrack {
  type: keyof SeparatedStems
  url: string
  name: string
  volume: number
  muted: boolean
  solo: boolean
  color: string
}

interface StemMixerProps {
  stems: SeparatedStems
  trackName: string
  onStemsChange?: (stems: StemTrack[]) => void
}

const stemConfig = {
  vocals: {
    icon: Mic,
    label: "Vocals",
    color: "bg-pink-500",
    gradient: "from-pink-500 to-rose-500",
  },
  drums: {
    icon: Drum,
    label: "Drums",
    color: "bg-amber-500",
    gradient: "from-amber-500 to-orange-500",
  },
  bass: {
    icon: Guitar,
    label: "Bass",
    color: "bg-emerald-500",
    gradient: "from-emerald-500 to-teal-500",
  },
  other: {
    icon: Music,
    label: "Other",
    color: "bg-blue-500",
    gradient: "from-blue-500 to-indigo-500",
  },
}

export function StemMixer({ stems, trackName, onStemsChange }: StemMixerProps) {
  const [stemTracks, setStemTracks] = useState<StemTrack[]>(() =>
    (Object.keys(stems) as (keyof SeparatedStems)[]).map((type) => ({
      type,
      url: stems[type],
      name: stemConfig[type].label,
      volume: 80,
      muted: false,
      solo: false,
      color: stemConfig[type].color,
    }))
  )

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  // Initialize audio elements
  useEffect(() => {
    stemTracks.forEach((track) => {
      if (!audioRefs.current[track.type]) {
        const audio = new Audio(track.url)
        audioRefs.current[track.type] = audio
        
        audio.addEventListener("loadedmetadata", () => {
          if (duration === 0) {
            setDuration(audio.duration)
          }
        })

        audio.addEventListener("timeupdate", () => {
          setCurrentTime(audio.currentTime)
        })

        audio.addEventListener("ended", () => {
          setIsPlaying(false)
          setCurrentTime(0)
        })
      }
    })

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause()
        audio.src = ""
      })
      audioRefs.current = {}
    }
  }, [stems])

  // Sync playback across all stems
  useEffect(() => {
    Object.values(audioRefs.current).forEach((audio) => {
      if (isPlaying) {
        audio.play().catch(() => {
          // Auto-play blocked
          setIsPlaying(false)
        })
      } else {
        audio.pause()
      }
    })
  }, [isPlaying])

  // Update volume and mute states
  useEffect(() => {
    stemTracks.forEach((track) => {
      const audio = audioRefs.current[track.type]
      if (audio) {
        const hasSolo = stemTracks.some((t) => t.solo)
        const shouldMute = track.muted || (hasSolo && !track.solo)
        
        audio.volume = shouldMute ? 0 : track.volume / 100
      }
    })

    onStemsChange?.(stemTracks)
  }, [stemTracks])

  const handleVolumeChange = (type: keyof SeparatedStems, value: number[]) => {
    setStemTracks((prev) =>
      prev.map((track) =>
        track.type === type ? { ...track, volume: value[0] ?? track.volume } : track
      )
    )
  }

  const toggleMute = (type: keyof SeparatedStems) => {
    setStemTracks((prev) =>
      prev.map((track) =>
        track.type === type ? { ...track, muted: !track.muted } : track
      )
    )
  }

  const toggleSolo = (type: keyof SeparatedStems) => {
    setStemTracks((prev) =>
      prev.map((track) =>
        track.type === type ? { ...track, solo: !track.solo } : track
      )
    )
  }

  const handleSeek = (value: number[]) => {
    const newTime = (value[0] ?? 0) * duration / 100
    Object.values(audioRefs.current).forEach((audio) => {
      audio.currentTime = newTime
    })
    setCurrentTime(newTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="space-y-4 rounded-2xl border border-border/50 bg-card/50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Stem Mixer</h3>
          <p className="text-sm text-muted-foreground">{trackName}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Timeline scrubber */}
      <div className="space-y-1">
        <Slider
          value={[progressPercent]}
          max={100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
      </div>

      {/* Stem tracks */}
      <div className="space-y-2">
        {stemTracks.map((track) => {
          const config = stemConfig[track.type]
          const Icon = config.icon
          const hasSolo = stemTracks.some((t) => t.solo)
          const isActive = !track.muted && (!hasSolo || track.solo)

          return (
            <div
              key={track.type}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 transition-all",
                isActive
                  ? "border-border bg-card"
                  : "border-border/50 bg-muted/30 opacity-60"
              )}
            >
              {/* Icon & Label */}
              <div className="flex w-24 shrink-0 items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    config.color,
                    "text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{config.label}</span>
              </div>

              {/* Mute/Solo buttons */}
              <div className="flex shrink-0 gap-1">
                <Button
                  variant={track.muted ? "destructive" : "ghost"}
                  size="sm"
                  className="h-7 w-7 rounded p-0 text-xs font-bold"
                  onClick={() => toggleMute(track.type)}
                >
                  {track.muted ? <VolumeX className="h-3 w-3" /> : "M"}
                </Button>
                <Button
                  variant={track.solo ? "default" : "ghost"}
                  size="sm"
                  className="h-7 w-7 rounded p-0 text-xs font-bold"
                  onClick={() => toggleSolo(track.type)}
                >
                  S
                </Button>
              </div>

              {/* Volume slider */}
              <div className="flex flex-1 items-center gap-2">
                <Volume2 className="h-3 w-3 shrink-0 text-muted-foreground" />
                <Slider
                  value={[track.volume]}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleVolumeChange(track.type, value)}
                  disabled={track.muted}
                  className={cn("flex-1", track.muted && "opacity-50")}
                />
                <span className="w-8 text-right text-xs text-muted-foreground">
                  {track.volume}%
                </span>
              </div>

              {/* Visual level indicator (simulated) */}
              <div className="flex h-8 w-2 shrink-0 flex-col-reverse gap-0.5 rounded-full bg-muted p-0.5">
                {isActive && isPlaying && (
                  <>
                    <div
                      className={cn(
                        "w-full rounded-sm transition-all",
                        config.color,
                        Math.random() > 0.5 ? "h-1/4" : "h-2/4"
                      )}
                    />
                    <div
                      className={cn(
                        "w-full rounded-sm transition-all",
                        config.color,
                        Math.random() > 0.3 ? "h-1/3" : "h-1/2"
                      )}
                    />
                    <div
                      className={cn(
                        "w-full rounded-sm transition-all",
                        config.color,
                        Math.random() > 0.7 ? "h-1/4" : "h-3/4"
                      )}
                    />
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-xs"
          onClick={() =>
            setStemTracks((prev) =>
              prev.map((t) => ({ ...t, muted: false, solo: false }))
            )
          }
        >
          Reset All
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-xs"
          onClick={() => {
            const vocals = stemTracks.find((t) => t.type === "vocals")
            const other = stemTracks.find((t) => t.type === "other")
            if (vocals && other) {
              setStemTracks((prev) =>
                prev.map((t) => ({
                  ...t,
                  muted: t.type !== "vocals" && t.type !== "other",
                  solo: false,
                }))
              )
            }
          }}
        >
          Acapella
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-xs"
          onClick={() => {
            setStemTracks((prev) =>
              prev.map((t) => ({
                ...t,
                muted: t.type === "vocals",
                solo: false,
              }))
            )
          }}
        >
          Instrumental
        </Button>
      </div>
    </div>
  )
}

interface StemMiniPlayerProps {
  stems: SeparatedStems
  className?: string
}

export function StemMiniPlayer({ stems, className }: StemMiniPlayerProps) {
  const [activeStem, setActiveStem] = useState<keyof SeparatedStems | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playStem = (type: keyof SeparatedStems, url: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }

    const audio = new Audio(url)
    audioRef.current = audio
    
    audio.addEventListener("ended", () => {
      setIsPlaying(false)
      setActiveStem(null)
    })

    audio.play()
    setActiveStem(type)
    setIsPlaying(true)
  }

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setActiveStem(null)
  }

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [])

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {(Object.keys(stems) as (keyof SeparatedStems)[]).map((type) => {
        const config = stemConfig[type]
        const Icon = config.icon
        const isActive = activeStem === type && isPlaying

        return (
          <Button
            key={type}
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 rounded-full text-xs",
              isActive && "border-primary bg-primary/10"
            )}
            onClick={() =>
              isActive ? stopPlayback() : playStem(type, stems[type])
            }
          >
            <Icon className={cn("h-3 w-3", config.color.replace("bg-", "text-"))} />
            {isActive ? "Stop" : config.label}
          </Button>
        )
      })}
    </div>
  )
}
