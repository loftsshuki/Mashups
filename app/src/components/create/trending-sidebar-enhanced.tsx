"use client"

import { useState, useEffect, useCallback } from "react"
import {
  TrendingUp,
  Music2,
  Flame,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Hash,
  Play,
  Plus,
  ExternalLink,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingSound,
  MOCK_TRENDING_SOUNDS,
  getTrendingSounds
} from "@/lib/data/trending-sounds"

// Phase 2: Enhanced Trending Sounds with velocity indicators and one-click remix

interface TrendingSidebarEnhancedProps {
  onRemixSound?: (sound: TrendingSound) => void
  className?: string
}

export function TrendingSidebarEnhanced({
  onRemixSound,
  className
}: TrendingSidebarEnhancedProps) {
  const [sounds, setSounds] = useState<TrendingSound[]>(MOCK_TRENDING_SOUNDS)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | "tiktok" | "spotify" | "youtube">("all")
  const [hoveredSound, setHoveredSound] = useState<string | null>(null)

  // Refresh trending sounds
  const refreshSounds = useCallback(async () => {
    setIsLoading(true)
    try {
      const fresh = await getTrendingSounds()
      setSounds(fresh)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch trending sounds:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshSounds, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [refreshSounds])

  // Filter sounds by platform
  const filteredSounds = sounds.filter(
    (sound) => selectedPlatform === "all" || sound.platform === selectedPlatform
  )

  // Sort by velocity (hot first)
  const sortedSounds = [...filteredSounds].sort((a, b) => {
    const velocityOrder = { hot: 3, rising: 2, steady: 1, cooling: 0 }
    return velocityOrder[b.velocity] - velocityOrder[a.velocity]
  })

  // Get velocity color
  const getVelocityColor = (velocity: TrendingSound["velocity"]) => {
    switch (velocity) {
      case "hot":
        return "text-red-500 bg-red-500/10 border-red-500/20"
      case "rising":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20"
      case "steady":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20"
      case "cooling":
        return "text-slate-500 bg-slate-500/10 border-slate-500/20"
    }
  }

  // Get velocity icon
  const getVelocityIcon = (velocity: TrendingSound["velocity"]) => {
    switch (velocity) {
      case "hot":
        return <Flame className="h-3 w-3" />
      case "rising":
        return <TrendingUp className="h-3 w-3" />
      case "steady":
        return <Clock className="h-3 w-3" />
      case "cooling":
        return <ArrowUpRight className="h-3 w-3 rotate-180" />
    }
  }

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Trending Sounds
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={refreshSounds}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">
          Updated {lastUpdated.toLocaleTimeString()}
        </p>
      </CardHeader>

      <Tabs value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as typeof selectedPlatform)}>
        <TabsList className="grid grid-cols-4 mx-4 mb-2">
          <TabsTrigger value="all" className="text-[10px]">All</TabsTrigger>
          <TabsTrigger value="tiktok" className="text-[10px]">TikTok</TabsTrigger>
          <TabsTrigger value="spotify" className="text-[10px]">Spotify</TabsTrigger>
          <TabsTrigger value="youtube" className="text-[10px]">YouTube</TabsTrigger>
        </TabsList>

        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-4 pt-0">
              {sortedSounds.map((sound, index) => (
                <div
                  key={sound.id}
                  className={cn(
                    "group relative rounded-lg border p-3 cursor-pointer transition-all",
                    "hover:border-primary/50 hover:bg-muted/50",
                    hoveredSound === sound.id && "border-primary bg-primary/5"
                  )}
                  onMouseEnter={() => setHoveredSound(sound.id)}
                  onMouseLeave={() => setHoveredSound(null)}
                >
                  {/* Rank Badge */}
                  <div className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {index + 1}
                  </div>

                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {sound.thumbnailUrl ? (
                        <img
                          src={sound.thumbnailUrl}
                          alt={sound.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Music2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}

                      {/* Play overlay on hover */}
                      {hoveredSound === sound.id && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Play className="h-5 w-5 text-white fill-current" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-medium truncate">
                            {sound.title}
                          </h4>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {sound.artist}
                          </p>
                        </div>

                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] h-4 px-1 flex items-center gap-0.5",
                            getVelocityColor(sound.velocity)
                          )}
                        >
                          {getVelocityIcon(sound.velocity)}
                          {sound.velocity}
                        </Badge>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 mt-1.5">
                        {sound.stats.posts && (
                          <span className="text-[9px] text-muted-foreground">
                            {formatNumber(sound.stats.posts)} videos
                          </span>
                        )}
                        {sound.stats.streams && (
                          <span className="text-[9px] text-muted-foreground">
                            {formatNumber(sound.stats.streams)} streams
                          </span>
                        )}
                        {sound.stats.growthRate > 0 && (
                          <span className="text-[9px] text-green-500">
                            +{sound.stats.growthRate}%
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {sound.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] text-muted-foreground flex items-center gap-0.5"
                          >
                            <Hash className="h-2 w-2" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons on hover */}
                  {hoveredSound === sound.id && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7"
                        onClick={() => onRemixSound?.(sound)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => window.open(sound.previewUrl, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Tabs>

      {/* Footer stats */}
      <div className="p-4 pt-0 border-t">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{sortedSounds.length} trending sounds</span>
          <Button variant="link" size="sm" className="h-auto p-0 text-[10px]">
            View all
            <ArrowUpRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
