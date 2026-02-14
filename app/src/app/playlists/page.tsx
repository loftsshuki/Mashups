"use client"

import { useState, useEffect, useTransition } from "react"
import { ListMusic, Plus, Users, X } from "lucide-react"
import { NeonPage, NeonHero, NeonGrid } from "@/components/marketing/neon-page"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { PlaylistCard } from "@/components/playlist/playlist-card"
import { getPlaylists, createPlaylist } from "@/lib/data/playlists"
import type { Playlist } from "@/lib/data/types"

function PlaylistsContent() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "mine" | "collaborative">("all")
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newCollab, setNewCollab] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function load() {
      const data = await getPlaylists()
      setPlaylists(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = playlists.filter(p => {
    if (filter === "collaborative") return p.is_collaborative
    return true
  })

  function handleCreate() {
    if (!newTitle.trim()) return
    startTransition(async () => {
      const result = await createPlaylist(newTitle.trim(), newDescription.trim() || undefined)
      if (result.playlist) {
        setPlaylists(prev => [result.playlist!, ...prev])
      }
      setShowCreate(false)
      setNewTitle("")
      setNewDescription("")
      setNewCollab(false)
    })
  }

  return (
    <NeonPage>
      <NeonHero
        eyebrow="Playlists"
        title="Collaborative Playlists"
        description="Curate and share collections of mashups with the community. Enable collaborative mode to let others contribute."
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1.5">
          {(["all", "mine", "collaborative"] as const).map(f => (
            <Badge
              key={f}
              variant={filter === f ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() => setFilter(f)}
            >
              {f === "collaborative" && <Users className="h-3 w-3 mr-1" />}
              {f === "all" ? "All Playlists" : f === "mine" ? "My Playlists" : "Collaborative"}
            </Badge>
          ))}
        </div>
        <Button size="sm" className="gap-1" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New Playlist
        </Button>
      </div>

      {/* Create Playlist Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Playlist</DialogTitle>
            <DialogDescription>
              Give your playlist a name and optional description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="playlist-title">
                Title
              </label>
              <Input
                id="playlist-title"
                placeholder="My Awesome Playlist"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="playlist-desc">
                Description (optional)
              </label>
              <Textarea
                id="playlist-desc"
                placeholder="What's this playlist about?"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                className="mt-1 resize-none"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newCollab}
                onChange={(e) => setNewCollab(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm text-foreground">Allow others to add tracks</span>
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!newTitle.trim() || isPending}
              >
                {isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <NeonGrid className="sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </NeonGrid>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/50 px-6 py-12 text-center">
          <ListMusic className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No playlists found</p>
          <Button size="sm" className="mt-4 gap-1" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Create Your First Playlist
          </Button>
        </div>
      ) : (
        <NeonGrid className="sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map(playlist => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </NeonGrid>
      )}
    </NeonPage>
  )
}

export default function PlaylistsPage() {
  return (
    <AuthGuard>
      <PlaylistsContent />
    </AuthGuard>
  )
}
