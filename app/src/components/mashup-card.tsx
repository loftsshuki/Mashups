"use client";

import type { ComponentProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAudio } from "@/lib/audio/audio-context";
import type { Track } from "@/lib/audio/types";
import { Pause, Play, Repeat2 } from "lucide-react";
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
  rightsBadgeVariant?: ComponentProps<typeof Badge>["variant"];
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
  rightsBadge,
  rightsBadgeVariant = "outline",
  rightsScore,
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
      <Card className="overflow-hidden bg-card border border-border/50 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 hover:border-primary/20">
        {/* Cover Image */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={coverUrl}
            alt={title}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Play Button Overlay */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-300",
              isThisTrackPlaying
                ? "bg-black/40"
                : "bg-black/0 group-hover:bg-black/40"
            )}
          >
            <button
              onClick={handlePlayClick}
              disabled={!canPlay}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300",
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
                <Pause className="h-6 w-6" fill="currentColor" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
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

          {/* Remix + Duration */}
          <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
            <Link
              href={`/create?remix=${id}`}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md bg-black/70 text-white backdrop-blur-sm transition-all duration-300",
                "scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground"
              )}
              aria-label="Remix this mashup"
            >
              <Repeat2 className="h-3.5 w-3.5" />
            </Link>
            <span className="px-2 py-1 rounded-md bg-black/70 text-xs font-medium text-white backdrop-blur-sm">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-2 leading-tight mb-3">
            {title}
          </h3>

          {/* Creator */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={creator.avatarUrl} alt={creator.displayName} />
              <AvatarFallback className="text-[10px] bg-muted">
                {creator.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate">
              {creator.displayName}
            </span>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] font-medium">
                {genre}
              </Badge>
              {rightsBadge && (
                <Badge variant={rightsBadgeVariant} className="text-[10px]">
                  {rightsBadge}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-3.5 w-3.5"
              >
                <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatPlayCount(playCount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
