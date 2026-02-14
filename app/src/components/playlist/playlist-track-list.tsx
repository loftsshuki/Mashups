"use client"

import { Play, Pause, X } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAudio } from "@/lib/audio/audio-context"
import type { PlaylistTrack } from "@/lib/data/types"
import type { Track } from "@/lib/audio/types"

interface PlaylistTrackListProps {
  tracks: PlaylistTrack[]
  isOwner?: boolean
  onRemoveTrack?: (mashupId: string) => void
}

export function PlaylistTrackList({ tracks, isOwner, onRemoveTrack }: PlaylistTrackListProps) {
  const { state, playTrack, pause } = useAudio()

  function handlePlay(track: PlaylistTrack) {
    if (!track.mashup) return
    const isPlaying = state.currentTrack?.id === track.mashup.id && state.isPlaying
    if (isPlaying) {
      pause()
      return
    }
    const audioTrack: Track = {
      id: track.mashup.id,
      title: track.mashup.title,
      artist: track.mashup.creator?.display_name || track.mashup.creator?.username || "Unknown",
      audioUrl: track.mashup.audio_url || "",
      coverUrl: track.mashup.cover_image_url || "",
      duration: track.mashup.duration || 0,
    }
    playTrack(audioTrack)
  }

  if (tracks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/50 px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">No tracks yet. Add mashups to this playlist.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {tracks.map((track, i) => {
        const mashup = track.mashup
        if (!mashup) return null
        const isPlaying = state.currentTrack?.id === mashup.id && state.isPlaying
        const creatorName = mashup.creator?.display_name || mashup.creator?.username || "Unknown"

        return (
          <div key={track.id} className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent/50 transition-colors">
            <span className="w-6 text-center text-xs text-muted-foreground">{i + 1}</span>
            <button onClick={() => handlePlay(track)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{mashup.title}</p>
              <p className="text-xs text-muted-foreground truncate">{creatorName}</p>
            </div>
            {mashup.genre && (
              <span className="hidden sm:inline text-[10px] text-muted-foreground">{mashup.genre}</span>
            )}
            <span className="text-xs text-muted-foreground">
              {mashup.duration ? `${Math.floor(mashup.duration / 60)}:${(mashup.duration % 60).toString().padStart(2, "0")}` : "--:--"}
            </span>
            {isOwner && onRemoveTrack && (
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive" onClick={() => onRemoveTrack(track.mashup_id)}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
