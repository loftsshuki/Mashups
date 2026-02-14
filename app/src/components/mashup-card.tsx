"use client"

import type { ComponentProps } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAudio } from "@/lib/audio/audio-context"
import type { Track } from "@/lib/audio/types"
import { Pause } from "lucide-react"
import { TipButton } from "@/components/monetization/tip-button"
import { trackRecommendationEvent } from "@/lib/data/recommendation-events"

interface MashupCardProps {
  id: string
  title: string
  coverUrl: string
  genre: string
  duration: number
  playCount: number
  audioUrl?: string
  creator: {
    username: string
    displayName: string
    avatarUrl: string
  }
  rightsBadge?: string
  rightsBadgeVariant?: ComponentProps<typeof Badge>["variant"]
  rightsScore?: number
  className?: string
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function formatPlayCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  }
  return count.toString()
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
  const { state, playTrack, pause } = useAudio()
  const isThisTrackPlaying = state.currentTrack?.id === id && state.isPlaying
  const canPlay = Boolean(audioUrl)

  function handlePlayClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!canPlay) return

    if (isThisTrackPlaying) {
      pause()
      void trackRecommendationEvent({
        mashupId: id,
        eventType: "skip",
        context: "mashup_card",
      })
      return
    }

    const track: Track = {
      id,
      title,
      artist: creator.displayName,
      audioUrl: audioUrl || "",
      coverUrl,
      duration,
    }
    playTrack(track)
    void trackRecommendationEvent({
      mashupId: id,
      eventType: "play",
      context: "mashup_card",
    })
  }

  return (
    <Link href={`/mashup/${id}`} className={cn("group block", className)}>
      <Card className="neon-panel overflow-hidden border-primary/20 py-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-primary/25">
        {/* Cover image with play button overlay */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={coverUrl}
            alt={title}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Play/Pause button overlay */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-colors duration-300",
              isThisTrackPlaying ? "bg-black/30" : "bg-black/0 group-hover:bg-black/30"
            )}
          >
            <button
              onClick={handlePlayClick}
              disabled={!canPlay}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 shadow-lg backdrop-blur-sm transition-all duration-300",
                isThisTrackPlaying
                  ? "scale-100 opacity-100"
                  : "scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100",
                !canPlay && "cursor-not-allowed opacity-40"
              )}
              aria-label={
                canPlay ? (isThisTrackPlaying ? "Pause" : "Play") : "Audio unavailable"
              }
            >
              {isThisTrackPlaying ? (
                <Pause className="h-5 w-5 text-primary-foreground" fill="currentColor" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="ml-0.5 h-5 w-5 text-primary-foreground"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Playing indicator */}
          {isThisTrackPlaying && (
            <div className="absolute left-2 bottom-2 flex items-end gap-0.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-full bg-primary animate-pulse"
                  style={{
                    height: `${8 + i * 4}px`,
                    animationDelay: `${i * 150}ms`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Duration badge */}
          <div className="absolute right-2 bottom-2">
            <span className="rounded-md border border-white/20 bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Card body */}
        <CardContent className="space-y-3 p-4">
          {/* Title */}
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
            {title}
          </h3>

          {/* Creator info */}
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarImage src={creator.avatarUrl} alt={creator.displayName} />
              <AvatarFallback>
                {creator.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-xs text-muted-foreground">
              {creator.displayName}
            </span>
          </div>

          {/* Meta: genre badge + play count + tip */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-1">
              <Badge variant="secondary" className="text-[10px]">
                {genre}
              </Badge>
              {rightsBadge ? (
                <Badge variant={rightsBadgeVariant} className="text-[10px]">
                  {rightsBadge}
                  {typeof rightsScore === "number" ? ` ${rightsScore}` : ""}
                </Badge>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <TipButton
                recipientId={creator.username}
                recipientName={creator.displayName}
                recipientAvatar={creator.avatarUrl}
                variant="compact"
                showLabel={false}
              />
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
  )
}
