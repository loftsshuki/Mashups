"use client"

import Image from "next/image"
import Link from "next/link"
import { Play, Pause, Music } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Waveform } from "@/components/player/waveform"
import { ProgressBar } from "@/components/player/progress-bar"
import { LikeButton } from "@/components/mashup/like-button"
import { ShareButton } from "@/components/mashup/share-button"
import { CommentSection } from "@/components/mashup/comment-section"
import { useAudio } from "@/lib/audio/audio-context"
import type { Track } from "@/lib/audio/types"
import type { MockMashup } from "@/lib/mock-data"

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function formatCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  }
  return count.toString()
}

export function MashupDetailClient({ mashup }: { mashup: MockMashup }) {
  const { state, playTrack, toggle } = useAudio()
  const isThisTrack = state.currentTrack?.id === mashup.id
  const isPlaying = isThisTrack && state.isPlaying
  const canPlay = Boolean(mashup.audioUrl)

  const creatorInitials = mashup.creator.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)

  function handlePlay() {
    if (!canPlay) return
    if (isThisTrack) {
      toggle()
      return
    }
    const track: Track = {
      id: mashup.id,
      title: mashup.title,
      artist: mashup.creator.displayName,
      audioUrl: mashup.audioUrl,
      coverUrl: mashup.coverUrl,
      duration: mashup.duration,
    }
    playTrack(track)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Main layout */}
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        {/* Left: Cover + creator info */}
        <div className="flex flex-col items-center gap-6 lg:items-start">
          {/* Cover image */}
          <div className="relative h-[300px] w-[300px] overflow-hidden rounded-xl shadow-lg">
            <Image
              src={mashup.coverUrl}
              alt={mashup.title}
              fill
              unoptimized
              className="object-cover"
            />
            {/* Play overlay */}
            <button
              onClick={handlePlay}
              disabled={!canPlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
              aria-label={canPlay ? (isPlaying ? "Pause" : "Play") : "Audio unavailable"}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 shadow-lg backdrop-blur-sm transition-transform hover:scale-105">
                {isPlaying ? (
                  <Pause className="h-7 w-7 text-primary-foreground" fill="currentColor" />
                ) : (
                  <Play className="ml-1 h-7 w-7 text-primary-foreground" fill="currentColor" />
                )}
              </div>
            </button>
          </div>

          {/* Creator info */}
          <Link
            href={`/profile/${mashup.creator.username}`}
            className="group flex items-center gap-3 transition-colors"
          >
            <Avatar>
              <AvatarImage
                src={mashup.creator.avatarUrl}
                alt={mashup.creator.displayName}
              />
              <AvatarFallback>{creatorInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                {mashup.creator.displayName}
              </p>
              <p className="text-xs text-muted-foreground">
                @{mashup.creator.username}
              </p>
            </div>
          </Link>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <LikeButton
              mashupId={mashup.id}
              initialCount={mashup.likeCount}
              initialLiked={false}
            />
            <ShareButton
              mashupId={mashup.id}
              title={mashup.title}
            />
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex-1 space-y-8">
          {/* Title and description */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {mashup.title}
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {mashup.description}
            </p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {mashup.genre}
            </Badge>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{mashup.bpm}</span> BPM
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {formatDuration(mashup.duration)}
              </span>{" "}
              duration
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {formatCount(mashup.playCount)}
              </span>{" "}
              plays
            </div>
          </div>

          {/* Waveform player */}
          <div className="overflow-hidden rounded-lg bg-muted/30 p-6">
            <Waveform height={96} barCount={80} />
            {isThisTrack && (
              <div className="mt-3">
                <ProgressBar showTime={true} />
              </div>
            )}
            {!isThisTrack && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Click play to load waveform
              </p>
            )}
          </div>

          {/* Source tracks */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Source Tracks
            </h2>
            <div className="space-y-3">
              {mashup.sourceTracks.map((track, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-card px-4 py-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                    <Music className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {track.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{track.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Comments
            </h2>
            <CommentSection mashupId={mashup.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
