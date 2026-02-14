"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { NeonPage } from "@/components/marketing/neon-page"
import { PlaylistHeader } from "@/components/playlist/playlist-header"
import { PlaylistTrackList } from "@/components/playlist/playlist-track-list"
import { JourneyModeButton } from "@/components/playlist/journey-mode-button"
import { PlaylistCommentSection } from "@/components/playlist/playlist-comment-section"
import {
  getPlaylistTracks,
  removeTrackFromPlaylist,
  deletePlaylist,
} from "@/lib/data/playlists"
import { createClient } from "@/lib/supabase/client"
import type { Playlist, PlaylistTrack } from "@/lib/data/types"

interface PlaylistDetailClientProps {
  playlist: Playlist
}

export function PlaylistDetailClient({ playlist }: PlaylistDetailClientProps) {
  const router = useRouter()
  const [tracks, setTracks] = useState<PlaylistTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      const [trackData] = await Promise.all([
        getPlaylistTracks(playlist.id),
        checkOwnership(),
      ])
      if (!cancelled) {
        setTracks(trackData)
        setIsLoading(false)
      }
    }

    async function checkOwnership() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!cancelled && user) {
          setIsOwner(user.id === playlist.creator_id)
        }
      } catch {
        // ignore
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [playlist.id, playlist.creator_id])

  async function handleRemoveTrack(mashupId: string) {
    const prev = tracks
    setTracks((t) => t.filter((track) => track.mashup_id !== mashupId))

    const result = await removeTrackFromPlaylist(playlist.id, mashupId)
    if (result.error) {
      setTracks(prev)
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this playlist?")) return

    const result = await deletePlaylist(playlist.id)
    if (!result.error) {
      router.push("/playlists")
    }
  }

  return (
    <NeonPage>
      <PlaylistHeader
        playlist={playlist}
        isOwner={isOwner}
        onJourneyMode={() => {}}
        onDelete={isOwner ? handleDelete : undefined}
      />

      {/* Journey Mode - prominent placement */}
      <div className="mb-6">
        <JourneyModeButton tracks={tracks} />
      </div>

      <Separator className="mb-8" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Track list */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Tracks ({tracks.length})
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <PlaylistTrackList
              tracks={tracks}
              isOwner={isOwner}
              onRemoveTrack={handleRemoveTrack}
            />
          )}
        </div>

        {/* Comments sidebar */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Comments
          </h2>
          <PlaylistCommentSection playlistId={playlist.id} />
        </div>
      </div>
    </NeonPage>
  )
}
