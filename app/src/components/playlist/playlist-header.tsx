"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ListMusic, Play, Trash2, Users } from "lucide-react"
import type { Playlist } from "@/lib/data/types"

interface PlaylistHeaderProps {
  playlist: Playlist
  isOwner: boolean
  onJourneyMode: () => void
  onDelete?: () => void
}

export function PlaylistHeader({
  playlist,
  isOwner,
  onJourneyMode,
  onDelete,
}: PlaylistHeaderProps) {
  const creatorName =
    playlist.creator?.display_name || playlist.creator?.username || "Unknown"
  const initials = creatorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
      {/* Cover image */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl sm:w-64">
        {playlist.cover_image_url ? (
          <Image
            src={playlist.cover_image_url}
            alt={playlist.title}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/40 via-secondary/30 to-primary/20">
            <ListMusic className="h-16 w-16 text-primary/60" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-3">
          {/* Title */}
          <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            {playlist.title}
          </h1>

          {/* Description */}
          {playlist.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {playlist.description}
            </p>
          )}

          {/* Creator */}
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              {playlist.creator?.avatar_url && (
                <AvatarImage
                  src={playlist.creator.avatar_url}
                  alt={creatorName}
                />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{creatorName}</span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <ListMusic className="h-3 w-3" />
              {playlist.track_count}{" "}
              {playlist.track_count === 1 ? "track" : "tracks"}
            </Badge>
            {playlist.is_collaborative && (
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                Collaborative
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button onClick={onJourneyMode} className="gap-2">
            <Play className="h-4 w-4" />
            Journey Mode
          </Button>
          {isOwner && onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
