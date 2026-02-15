"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAudio } from "@/lib/audio/audio-context";
import type { Track } from "@/lib/audio/types";
import { Pause, Play } from "lucide-react";
import { trackRecommendationEvent } from "@/lib/data/recommendation-events";

interface MashupCardProps {
  id: string;
  title: string;
  coverUrl: string;
  genre: string;
  duration: number;
  playCount: number;
  audioUrl?: string;
  creator: {
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  rightsBadge?: string;
  rightsBadgeVariant?: string;
  rightsScore?: number;
  className?: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatPlayCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return count.toString();
}

export function MashupCard({
  id,
  title,
  coverUrl,
  genre,
  duration,
  playCount,
  audioUrl,
  creator,
  className,
}: MashupCardProps) {
  const { state, playTrack, pause } = useAudio();
  const isThisTrackPlaying = state.currentTrack?.id === id && state.isPlaying;
  const canPlay = Boolean(audioUrl);

  function handlePlayClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!canPlay) return;

    if (isThisTrackPlaying) {
      pause();
      void trackRecommendationEvent({
        mashupId: id,
        eventType: "skip",
        context: "mashup_card",
      });
      return;
    }

    const track: Track = {
      id,
      title,
      artist: creator.displayName,
      audioUrl: audioUrl || "",
      coverUrl,
      duration,
    };
    playTrack(track);
    void trackRecommendationEvent({
      mashupId: id,
      eventType: "play",
      context: "mashup_card",
    });
  }

  return (
    <Link href={`/mashup/${id}`} className={cn("group block", className)}>
      <div className="overflow-hidden rounded-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20">
        {/* Cover Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <Image
            src={coverUrl}
            alt={title}
            fill
            unoptimized
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Play Button Overlay */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-300",
              isThisTrackPlaying
                ? "bg-black/40"
                : "bg-black/0 group-hover:bg-black/30"
            )}
          >
            <button
              onClick={handlePlayClick}
              disabled={!canPlay}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-all duration-300",
                isThisTrackPlaying
                  ? "scale-100 opacity-100"
                  : "scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100",
                !canPlay && "cursor-not-allowed opacity-40"
              )}
              aria-label={
                canPlay
                  ? isThisTrackPlaying
                    ? "Pause"
                    : "Play"
                  : "Audio unavailable"
              }
            >
              {isThisTrackPlaying ? (
                <Pause className="h-5 w-5" fill="currentColor" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
              )}
            </button>
          </div>

          {/* Playing Indicator */}
          {isThisTrackPlaying && (
            <div className="absolute left-3 bottom-3 flex items-end gap-0.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-primary animate-pulse"
                  style={{
                    height: `${6 + i * 3}px`,
                    animationDelay: `${i * 100}ms`,
                    animationDuration: "0.6s",
                  }}
                />
              ))}
            </div>
          )}

          {/* Duration Badge */}
          <div className="absolute right-3 bottom-3">
            <span className="px-2 py-1 rounded bg-black/70 text-xs font-mono text-white/90 backdrop-blur-sm font-[family-name:var(--font-mono)]">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="pt-3">
          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-2 leading-tight text-sm">
            {title}
          </h3>

          {/* Creator — editorial italic */}
          <p className="mt-1 font-[family-name:var(--font-editorial)] italic text-sm text-muted-foreground truncate">
            {creator.displayName}
          </p>

          {/* Meta */}
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="uppercase tracking-wider text-[10px]">{genre}</span>
            <span className="opacity-30">·</span>
            <span className="font-[family-name:var(--font-mono)]">
              {formatPlayCount(playCount)} plays
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
