"use client"

import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { X, GripVertical, Music } from "lucide-react"
import type { PlaylistTrack } from "@/lib/data/types"

interface PlaylistTrackListProps {
  tracks: PlaylistTrack[]
  isOwner: boolean
  onRemoveTrack: (mashupId: string) => void
}

export function PlaylistTrackList({
  tracks,
  isOwner,
  onRemoveTrack,
}: PlaylistTrackListProps) {
  if (tracks.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 bg-muted/30 px-6 py-8 text-center">
        <Music className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">
          No tracks yet
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add mashups to this playlist to get started
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/50">
      {tracks.map((track, index) => {
        const mashupTitle = track.mashup?.title ?? "Untitled"
        const mashupCover = track.mashup?.cover_image_url
        const creatorName =
          track.mashup?.creator?.display_name ||
          track.mashup?.creator?.username ||
          "Unknown"
        const addedByName =
          track.added_by_user?.display_name ||
          track.added_by_user?.username ||
          "Unknown"
        const addedByInitials = addedByName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()

        return (
          <div
            key={track.id}
            className="group flex items-center gap-3 py-3 hover:bg-muted/30"
          >
            {/* Grip handle (visual only) */}
            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />

            {/* Position number */}
            <span className="w-6 shrink-0 text-center text-sm font-medium text-muted-foreground">
              {index + 1}
            </span>

            {/* Cover thumbnail */}
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
              {mashupCover ? (
                <Image
                  src={mashupCover}
                  alt={mashupTitle}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/20">
                  <Music className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Track info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {mashupTitle}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {creatorName}
              </p>
            </div>

            {/* Added by */}
            <div className="hidden items-center gap-1.5 sm:flex">
              <Avatar size="sm">
                {track.added_by_user?.avatar_url && (
                  <AvatarImage
                    src={track.added_by_user.avatar_url}
                    alt={addedByName}
                  />
                )}
                <AvatarFallback className="text-[10px]">
                  {addedByInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {addedByName}
              </span>
            </div>

            {/* Remove button */}
            {isOwner && (
              <Button
                variant="ghost"
                size="icon-xs"
                className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                onClick={() => onRemoveTrack(track.mashup_id)}
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Remove track</span>
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
