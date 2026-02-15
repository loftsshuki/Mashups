"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { ListMusic, Users } from "lucide-react"
import type { Playlist } from "@/lib/data/types"

interface PlaylistCardProps {
  playlist: Playlist
  className?: string
}

export function PlaylistCard({ playlist, className }: PlaylistCardProps) {
  const creatorName =
    playlist.creator?.display_name || playlist.creator?.username || "Unknown"
  const initials = creatorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Link
      href={`/playlist/${playlist.id}`}
      className={cn("group block", className)}
    >
      <Card className="overflow-hidden border-primary/20 py-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-primary/25">
        {/* Cover image or gradient placeholder */}
        <div className="relative aspect-square overflow-hidden">
          {playlist.cover_image_url ? (
            <Image
              src={playlist.cover_image_url}
              alt={playlist.title}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/40 via-secondary/30 to-primary/20">
              <ListMusic className="h-12 w-12 text-primary/60" />
            </div>
          )}

          {/* Track count badge */}
          <div className="absolute right-2 bottom-2">
            <span className="flex items-center gap-1 rounded-md border border-white/20 bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              <ListMusic className="h-3 w-3" />
              {playlist.track_count} {playlist.track_count === 1 ? "track" : "tracks"}
            </span>
          </div>

          {/* Collaborative badge */}
          {playlist.is_collaborative && (
            <div className="absolute left-2 top-2">
              <Badge
                variant="secondary"
                className="gap-1 bg-black/60 text-[10px] text-white backdrop-blur-sm"
              >
                <Users className="h-3 w-3" />
                Collaborative
              </Badge>
            </div>
          )}
        </div>

        {/* Card body */}
        <CardContent className="space-y-3 p-4">
          {/* Title */}
          <h3 className="line-clamp-1 text-sm font-semibold leading-tight text-foreground">
            {playlist.title}
          </h3>

          {/* Description */}
          {playlist.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {playlist.description}
            </p>
          )}

          {/* Creator info */}
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
            <span className="truncate text-xs text-muted-foreground">
              {creatorName}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
