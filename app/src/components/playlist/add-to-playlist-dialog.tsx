"use client"

import { useState, useEffect, useTransition, type ReactNode } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getMyPlaylists, addTrackToPlaylist } from "@/lib/data/playlists"
import { CreatePlaylistForm } from "./create-playlist-form"
import { ListMusic, Plus, Check, AlertCircle } from "lucide-react"
import type { Playlist } from "@/lib/data/types"

interface AddToPlaylistDialogProps {
  mashupId: string
  trigger: ReactNode
}

export function AddToPlaylistDialog({
  mashupId,
  trigger,
}: AddToPlaylistDialogProps) {
  const [open, setOpen] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [addedTo, setAddedTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return

    let cancelled = false

    async function load() {
      setIsLoading(true)
      setShowCreate(false)
      setAddedTo(null)
      setError(null)
      const data = await getMyPlaylists()
      if (!cancelled) {
        setPlaylists(data)
        setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [open])

  function handleAdd(playlistId: string) {
    setError(null)
    setAddedTo(null)

    startTransition(async () => {
      const result = await addTrackToPlaylist(playlistId, mashupId)

      if (result.error) {
        setError(result.error)
        return
      }

      setAddedTo(playlistId)

      // Update local track count
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlistId ? { ...p, track_count: p.track_count + 1 } : p
        )
      )

      // Auto-close after brief feedback
      setTimeout(() => {
        setOpen(false)
      }, 1200)
    })
  }

  function handleCreated(playlist: Playlist) {
    setPlaylists((prev) => [playlist, ...prev])
    setShowCreate(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <DialogDescription>
            Choose a playlist or create a new one
          </DialogDescription>
        </DialogHeader>

        {showCreate ? (
          <CreatePlaylistForm
            onCreated={handleCreated}
            onCancel={() => setShowCreate(false)}
          />
        ) : (
          <div className="space-y-3">
            {/* Error feedback */}
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Playlist list */}
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : playlists.length === 0 ? (
              <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-6 text-center">
                <ListMusic className="mx-auto h-6 w-6 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  You don&apos;t have any playlists yet
                </p>
              </div>
            ) : (
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {playlists.map((playlist) => {
                  const isAdded = addedTo === playlist.id

                  return (
                    <button
                      key={playlist.id}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/50 disabled:opacity-50"
                      onClick={() => handleAdd(playlist.id)}
                      disabled={isPending || isAdded}
                    >
                      {/* Playlist icon / cover */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary/30 to-secondary/20">
                        {isAdded ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <ListMusic className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {playlist.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {playlist.track_count}{" "}
                          {playlist.track_count === 1 ? "track" : "tracks"}
                        </p>
                      </div>

                      {isAdded && (
                        <span className="text-xs font-medium text-green-500">
                          Added!
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Create new playlist option */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="h-4 w-4" />
              Create new playlist
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
