"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ListMusic, Play, Users, Share2, Settings } from "lucide-react"
import { NeonPage, NeonSectionHeader } from "@/components/marketing/neon-page"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { PlaylistTrackList } from "@/components/playlist/playlist-track-list"
import { getPlaylistById, getPlaylistTracks, removeTrackFromPlaylist } from "@/lib/data/playlists"
import { useAudio } from "@/lib/audio/audio-context"
import type { Playlist, PlaylistTrack } from "@/lib/data/types"
import type { Track } from "@/lib/audio/types"

function PlaylistDetailContent() {
  const params = useParams()
  const playlistId = params.id as string
  const { dispatch } = useAudio()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [tracks, setTracks] = useState<PlaylistTrack[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [pl, tr] = await Promise.all([
        getPlaylistById(playlistId),
        getPlaylistTracks(playlistId),
      ])
      setPlaylist(pl)
      setTracks(tr)
      setLoading(false)
    }
    load()
  }, [playlistId])

  function handleJourneyMode() {
    const queue: Track[] = tracks
      .filter(t => t.mashup)
      .map(t => ({
        id: t.mashup!.id,
        title: t.mashup!.title,
        artist: t.mashup!.creator?.display_name || t.mashup!.creator?.username || "Unknown",
        audioUrl: t.mashup!.audio_url || "",
        coverUrl: t.mashup!.cover_image_url || "",
        duration: t.mashup!.duration || 0,
      }))
    if (queue.length > 0) {
      dispatch({ type: "SET_QUEUE", queue })
    }
  }

  async function handleRemoveTrack(mashupId: string) {
    const prev = tracks
    setTracks(t => t.filter(tr => tr.mashup_id !== mashupId))
    const result = await removeTrackFromPlaylist(playlistId, mashupId)
    if (result.error) {
      setTracks(prev)
    }
  }

  if (loading) {
    return (
      <NeonPage className="max-w-4xl">
        <Skeleton className="h-48 rounded-xl" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </NeonPage>
    )
  }

  if (!playlist) {
    return (
      <NeonPage className="max-w-4xl">
        <div className="text-center py-12">
          <ListMusic className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-muted-foreground">Playlist not found</p>
        </div>
      </NeonPage>
    )
  }

  const creatorName = playlist.creator?.display_name || playlist.creator?.username || "Unknown"
  const initials = creatorName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <NeonPage className="max-w-4xl">
      {/* Playlist Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="w-40 h-40 shrink-0 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
          {playlist.cover_image_url ? (
            <img src={playlist.cover_image_url} alt={playlist.title} className="h-full w-full object-cover" />
          ) : (
            <ListMusic className="h-16 w-16 text-primary/40" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {playlist.is_collaborative && (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Users className="h-3 w-3" /> Collaborative
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px]">
              {playlist.track_count} tracks
            </Badge>
          </div>
          <h1 className="text-2xl font-bold">{playlist.title}</h1>
          {playlist.description && (
            <p className="mt-1 text-sm text-muted-foreground">{playlist.description}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <Avatar className="h-6 w-6">
              {playlist.creator?.avatar_url && <AvatarImage src={playlist.creator.avatar_url} />}
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{creatorName}</span>
          </div>
          <div className="flex gap-2 mt-4">
            <Button className="gap-1" onClick={handleJourneyMode}>
              <Play className="h-4 w-4" /> Journey Mode
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Track List */}
      <NeonSectionHeader title="Tracks" description="Listen through or play individually" />
      <PlaylistTrackList
        tracks={tracks}
        isOwner={true}
        onRemoveTrack={handleRemoveTrack}
      />
    </NeonPage>
  )
}

export default function PlaylistDetailPage() {
  return (
    <AuthGuard>
      <PlaylistDetailContent />
    </AuthGuard>
  )
}
