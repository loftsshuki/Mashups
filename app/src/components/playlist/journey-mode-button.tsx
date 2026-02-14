"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { useAudio } from "@/lib/audio/audio-context"
import type { Track } from "@/lib/audio/types"
import type { PlaylistTrack } from "@/lib/data/types"

interface JourneyModeButtonProps {
  tracks: PlaylistTrack[]
}

export function JourneyModeButton({ tracks }: JourneyModeButtonProps) {
  const { dispatch } = useAudio()

  // Map PlaylistTrack[] to Track[] for the audio player queue
  const audioTracks: Track[] = tracks
    .filter((t) => t.mashup?.audio_url)
    .map((t) => ({
      id: t.mashup!.id,
      title: t.mashup!.title,
      artist:
        t.mashup!.creator?.display_name ||
        t.mashup!.creator?.username ||
        "Unknown",
      audioUrl: t.mashup!.audio_url,
      coverUrl: t.mashup!.cover_image_url || "",
      duration: t.mashup!.duration ?? 0,
    }))

  const hasAudio = audioTracks.length > 0

  const handleClick = useCallback(() => {
    if (!hasAudio) return

    dispatch({
      type: "SET_QUEUE",
      queue: audioTracks,
      startIndex: 0,
    })
  }, [dispatch, audioTracks, hasAudio])

  return (
    <Button onClick={handleClick} disabled={!hasAudio} className="gap-2">
      <Play className="h-4 w-4" />
      Journey Mode
    </Button>
  )
}
