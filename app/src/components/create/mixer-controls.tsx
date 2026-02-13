"use client"

import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface MixerTrack {
  name: string
  volume: number
  muted: boolean
  solo: boolean
}

interface MixerControlsProps {
  tracks: MixerTrack[]
  onVolumeChange: (index: number, volume: number) => void
  onMuteToggle: (index: number) => void
  onSoloToggle: (index: number) => void
}

export function MixerControls({
  tracks,
  onVolumeChange,
  onMuteToggle,
  onSoloToggle,
}: MixerControlsProps) {
  if (tracks.length === 0) return null

  return (
    <div className="space-y-3">
      {tracks.map((track, index) => (
        <div
          key={`${track.name}-${index}`}
          className="flex items-center gap-3 rounded-lg border border-border/50 bg-card px-4 py-3"
        >
          {/* Track number & name */}
          <div className="flex min-w-0 shrink-0 items-center gap-2" style={{ width: "140px" }}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {index + 1}
            </div>
            <span className="truncate text-sm font-medium text-foreground">
              {track.name}
            </span>
          </div>

          {/* Volume slider */}
          <div className="flex flex-1 items-center gap-3">
            <Slider
              value={[track.volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={([val]) => onVolumeChange(index, val)}
              className={cn(
                "flex-1",
                track.muted && "opacity-40"
              )}
            />
            <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {track.volume}
            </span>
          </div>

          {/* Mute button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onMuteToggle(index)}
            className={cn(
              "shrink-0",
              track.muted && "text-destructive hover:text-destructive"
            )}
          >
            {track.muted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            <span className="sr-only">{track.muted ? "Unmute" : "Mute"}</span>
          </Button>

          {/* Solo button */}
          <Button
            variant={track.solo ? "default" : "outline"}
            size="icon-sm"
            onClick={() => onSoloToggle(index)}
            className={cn(
              "shrink-0 text-xs font-bold",
              track.solo && "bg-amber-500 text-white hover:bg-amber-600"
            )}
          >
            S
            <span className="sr-only">{track.solo ? "Unsolo" : "Solo"}</span>
          </Button>
        </div>
      ))}
    </div>
  )
}
