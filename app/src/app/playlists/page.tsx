"use client"

import { useState, useEffect } from "react"
import { ListMusic, Plus, Users } from "lucide-react"
import { NeonPage, NeonHero, NeonGrid } from "@/components/marketing/neon-page"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PlaylistCard } from "@/components/playlist/playlist-card"
import { getPlaylists } from "@/lib/data/playlists"
import type { Playlist } from "@/lib/data/types"

function PlaylistsContent() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "mine" | "collaborative">("all")

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
    // "mine" and "all" show all in mock mode
    return true
  })

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
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> New Playlist
        </Button>
      </div>

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
          <Button size="sm" className="mt-4 gap-1">
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
