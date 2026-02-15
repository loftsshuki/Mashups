"use client"

import { useState, useEffect } from "react"
import { Plus, ListMusic, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { NeonPage, NeonHero } from "@/components/marketing/neon-page"
import { PlaylistCard } from "@/components/playlist/playlist-card"
import { CreatePlaylistForm } from "@/components/playlist/create-playlist-form"
import { getPlaylists, getMyPlaylists } from "@/lib/data/playlists"
import type { Playlist } from "@/lib/data/types"

type FilterMode = "community" | "mine"

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterMode>("community")
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      const data =
        filter === "mine" ? await getMyPlaylists() : await getPlaylists()
      if (!cancelled) {
        setPlaylists(data)
        setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [filter])

  function handleCreated(playlist: Playlist) {
    setShowCreate(false)
    setPlaylists((prev) => [playlist, ...prev])
  }

  return (
    <NeonPage>
      <NeonHero
        eyebrow="Playlists"
        title="Collaborative Playlists"
        description="Community-curated collections of mashups. Create your own or add to others."
        actions={
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1.5 h-4 w-4" />
                Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Playlist</DialogTitle>
              </DialogHeader>
              <CreatePlaylistForm
                onCreated={handleCreated}
                onCancel={() => setShowCreate(false)}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filter tabs */}
      <div className="mb-6 flex items-center gap-2">
        <Badge
          variant={filter === "community" ? "default" : "secondary"}
          className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
          onClick={() => setFilter("community")}
        >
          <Users className="mr-1 h-3 w-3" />
          Community
        </Badge>
        <Badge
          variant={filter === "mine" ? "default" : "secondary"}
          className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
          onClick={() => setFilter("mine")}
        >
          <ListMusic className="mr-1 h-3 w-3" />
          My Playlists
        </Badge>
      </div>

      {/* Playlist grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="rounded-2xl px-6 py-16 text-center">
          <ListMusic className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium text-foreground">
            {filter === "mine"
              ? "You haven't created any playlists yet"
              : "No playlists found"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {filter === "mine"
              ? "Create your first playlist to start collecting mashups"
              : "Be the first to create a community playlist"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </NeonPage>
  )
}
