"use client"

import { useState, useEffect, useCallback } from "react"
import { TrendingUp, Search, RefreshCw, Disc, Play, Plus, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getTrendingSounds,
  searchTrendingSounds,
  formatNumber,
  getVelocityStyles,
  getRankChange,
  type TrendingSound,
} from "@/lib/data/trending-sounds"

interface TrendingSidebarProps {
  onRemixSound?: (sound: TrendingSound) => void
  className?: string
}

export function TrendingSidebar({ onRemixSound, className }: TrendingSidebarProps) {
  const [sounds, setSounds] = useState<TrendingSound[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [previewingId, setPreviewingId] = useState<string | null>(null)

  // Load trending sounds
  const loadSounds = useCallback(async () => {
    setIsLoading(true)
    const platform = activeTab === "all" ? "all" : (activeTab as "tiktok" | "spotify" | "youtube")
    const data = await getTrendingSounds({ platform, limit: 10 })
    setSounds(data)
    setIsLoading(false)
  }, [activeTab])

  useEffect(() => {
    void loadSounds()
  }, [loadSounds])

  // Search sounds
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      void loadSounds()
      return
    }
    setIsLoading(true)
    const results = await searchTrendingSounds(searchQuery)
    setSounds(results)
    setIsLoading(false)
  }, [searchQuery, loadSounds])

  // Preview sound (simulated)
  const handlePreview = useCallback((sound: TrendingSound) => {
    if (previewingId === sound.id) {
      setPreviewingId(null)
    } else {
      setPreviewingId(sound.id)
      // Auto stop after 10 seconds
      setTimeout(() => setPreviewingId((current) => (current === sound.id ? null : current)), 10000)
    }
  }, [previewingId])

  return (
    <div className={cn("w-80 border-l border-border bg-card flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Trending Sounds</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-auto"
            onClick={() => void loadSounds()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
          </Button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Search sounds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleSearch()}
            className="h-8 text-xs"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => void handleSearch()}>
            <Search className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Platform Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-10">
          <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs">
            All
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs">
            TikTok
          </TabsTrigger>
          <TabsTrigger value="spotify" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs">
            Spotify
          </TabsTrigger>
          <TabsTrigger value="youtube" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs">
            YouTube
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="flex-1 m-0 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : sounds.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Disc className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-xs">No sounds found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sounds.map((sound) => (
                <TrendingSoundCard
                  key={sound.id}
                  sound={sound}
                  isPreviewing={previewingId === sound.id}
                  onPreview={() => handlePreview(sound)}
                  onRemix={() => onRemixSound?.(sound)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface TrendingSoundCardProps {
  sound: TrendingSound
  isPreviewing: boolean
  onPreview: () => void
  onRemix: () => void
}

function TrendingSoundCard({ sound, isPreviewing, onPreview, onRemix }: TrendingSoundCardProps) {
  const velocity = getVelocityStyles(sound.velocity)
  const rankChange = getRankChange(sound.rank, sound.previousRank)

  return (
    <div className="p-3 hover:bg-muted/50 transition-colors group">
      <div className="flex gap-3">
        {/* Rank */}
        <div className="flex flex-col items-center justify-center w-6">
          <span className="text-lg font-bold text-muted-foreground">{sound.rank}</span>
          {rankChange.direction !== "same" && (
            <span
              className={cn(
                "text-[10px]",
                rankChange.direction === "up" ? "text-green-500" : "text-red-500"
              )}
            >
              {rankChange.direction === "up" ? "↑" : "↓"}
              {rankChange.diff}
            </span>
          )}
        </div>

        {/* Thumbnail */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
          <img
            src={sound.thumbnailUrl}
            alt={sound.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onPreview}
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity",
              isPreviewing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <Play className={cn("h-5 w-5 text-white", isPreviewing && "animate-pulse")} />
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{sound.title}</p>
              <p className="text-xs text-muted-foreground truncate">{sound.artist}</p>
            </div>
            <Badge className={cn("text-[10px] h-4 shrink-0", velocity.badge)}>
              {velocity.icon} {velocity.label}
            </Badge>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
            {sound.stats.posts && <span>{formatNumber(sound.stats.posts)} posts</span>}
            {sound.stats.streams && <span>{formatNumber(sound.stats.streams)} streams</span>}
            {sound.stats.views && <span>{formatNumber(sound.stats.views)} views</span>}
            <span
              className={cn(
                sound.stats.growthRate > 0 ? "text-green-500" : "text-red-500"
              )}
            >
              {sound.stats.growthRate > 0 ? "+" : ""}
              {sound.stats.growthRate}%
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-1">
            {sound.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted">
                #{tag}
              </span>
            ))}
            {sound.bpm && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                {sound.bpm} BPM
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs flex-1"
          onClick={onRemix}
        >
          <Plus className="h-3 w-3 mr-1" />
          Remix This
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
