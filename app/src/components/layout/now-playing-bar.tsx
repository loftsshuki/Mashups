"use client";

import { useAudio } from "@/lib/audio/audio-context";
import { TrackInfo } from "@/components/player/track-info";
import { PlayButton } from "@/components/player/play-button";
import { ProgressBar } from "@/components/player/progress-bar";
import { VolumeControl } from "@/components/player/volume-control";
import { Button } from "@/components/ui/button";
import { SkipBack, SkipForward, ListMusic } from "lucide-react";
import { cn } from "@/lib/utils";

export function NowPlayingBar() {
  const { state, previous, next } = useAudio();
  const hasTrack = !!state.currentTrack;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 transition-transform duration-500",
        !hasTrack && "translate-y-full"
      )}
    >
      {/* Progress Bar — gold accent, expands on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-muted group/progress hover:h-1 transition-all">
        <div className="h-full w-1/3 bg-primary transition-[width] duration-300 linear" />
      </div>

      <div className="mx-auto flex h-20 max-w-[1400px] items-center gap-4 container-padding">
        {/* Left: Track Info */}
        <div className="min-w-0 flex-1 sm:w-1/4 sm:flex-initial">
          <TrackInfo size="sm" />
        </div>

        {/* Center: Controls & Progress */}
        <div className="flex flex-1 flex-col items-center gap-2 max-w-xl">
          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              onClick={previous}
              disabled={!hasTrack || state.queue.length <= 1}
              aria-label="Previous track"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <PlayButton size="md" />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              onClick={next}
              disabled={!hasTrack || state.queue.length <= 1}
              aria-label="Next track"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <ProgressBar showTime className="w-full" />
        </div>

        {/* Right: Volume & Queue */}
        <div className="hidden sm:flex items-center justify-end gap-2 w-1/4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Queue"
          >
            <ListMusic className="h-4 w-4" />
          </Button>
          <VolumeControl />
        </div>
      </div>
    </div>
  );
}
