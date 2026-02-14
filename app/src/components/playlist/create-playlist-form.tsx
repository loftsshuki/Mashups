"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { createPlaylist, updatePlaylist } from "@/lib/data/playlists"
import type { Playlist } from "@/lib/data/types"

interface CreatePlaylistFormProps {
  onCreated: (playlist: Playlist) => void
  onCancel: () => void
}

export function CreatePlaylistForm({
  onCreated,
  onCancel,
}: CreatePlaylistFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isCollaborative, setIsCollaborative] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    setError(null)

    startTransition(async () => {
      const result = await createPlaylist(
        trimmedTitle,
        description.trim() || undefined
      )

      if (result.error) {
        setError(result.error)
        return
      }

      if (result.playlist) {
        // If collaborative flag differs from default, update it
        if (isCollaborative) {
          await updatePlaylist(result.playlist.id, {
            is_collaborative: true,
          })
          result.playlist.is_collaborative = true
        }

        onCreated(result.playlist)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="playlist-title">Title</Label>
        <Input
          id="playlist-title"
          placeholder="My awesome playlist"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="playlist-description">Description (optional)</Label>
        <Textarea
          id="playlist-description"
          placeholder="What's this playlist about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isPending}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Collaborative toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
        <div className="space-y-0.5">
          <Label htmlFor="playlist-collaborative" className="text-sm font-medium">
            Collaborative
          </Label>
          <p className="text-xs text-muted-foreground">
            Allow others to add tracks to this playlist
          </p>
        </div>
        <Switch
          id="playlist-collaborative"
          checked={isCollaborative}
          onCheckedChange={setIsCollaborative}
          disabled={isPending}
        />
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending || !title.trim()}>
          {isPending ? "Creating..." : "Create Playlist"}
        </Button>
      </div>
    </form>
  )
}
