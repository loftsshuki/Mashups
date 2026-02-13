"use client"

import { useAudio } from "@/lib/audio/audio-context"
import { TrackInfo } from "@/components/player/track-info"
import { PlayButton } from "@/components/player/play-button"
import { ProgressBar } from "@/components/player/progress-bar"
import { VolumeControl } from "@/components/player/volume-control"
import { Button } from "@/components/ui/button"
import { SkipBack, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"

export function NowPlayingBar() {
  const { state, previous, next } = useAudio()
  const hasTrack = !!state.currentTrack

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-card/90 border-t border-border transition-transform duration-300",
        !hasTrack && "translate-y-full"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: track info */}
        <div className="min-w-0 w-1/4">
          <TrackInfo size="sm" />
        </div>

        {/* Center: controls & progress */}
        <div className="flex flex-1 flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={previous}
              disabled={!hasTrack || state.queue.length <= 1}
              aria-label="Previous track"
            >
              <SkipBack className="size-3.5" />
            </Button>
            <PlayButton size="sm" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={next}
              disabled={!hasTrack || state.queue.length <= 1}
              aria-label="Next track"
            >
              <SkipForward className="size-3.5" />
            </Button>
          </div>
          <ProgressBar showTime={false} className="max-w-md" />
        </div>

        {/* Right: volume */}
        <div className="hidden sm:flex items-center justify-end w-1/4">
          <VolumeControl />
        </div>
      </div>
    </div>
  )
}
