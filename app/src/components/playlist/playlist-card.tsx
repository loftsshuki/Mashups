"use client"

import Link from "next/link"
import { Music, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { Playlist } from "@/lib/data/types"

interface PlaylistCardProps {
  playlist: Playlist
  className?: string
}

export function PlaylistCard({ playlist, className }: PlaylistCardProps) {
  const creatorName = playlist.creator?.display_name || playlist.creator?.username || "Unknown"
  const initials = creatorName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <Link href={`/playlist/${playlist.id}`} className={className}>
      <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 py-0">
        <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
          {playlist.cover_image_url ? (
            <img src={playlist.cover_image_url} alt={playlist.title} className="h-full w-full object-cover" />
          ) : (
            <Music className="h-12 w-12 text-primary/40" />
          )}
          {playlist.is_collaborative && (
            <Badge className="absolute top-2 right-2 gap-1 text-[10px]" variant="secondary">
              <Users className="h-3 w-3" /> Collab
            </Badge>
          )}
          <div className="absolute bottom-2 right-2">
            <span className="rounded-md border border-white/20 bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              {playlist.track_count} tracks
            </span>
          </div>
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="text-sm font-semibold leading-tight line-clamp-1">{playlist.title}</h3>
          {playlist.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{playlist.description}</p>
          )}
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              {playlist.creator?.avatar_url && <AvatarImage src={playlist.creator.avatar_url} />}
              <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">{creatorName}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
