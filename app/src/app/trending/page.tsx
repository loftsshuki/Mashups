"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Music, ArrowUp, ArrowDown, Minus, Play, ExternalLink } from "lucide-react"
import { NeonPage, NeonHero, NeonGrid } from "@/components/marketing/neon-page"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import {
  getTrendingSounds,
  getVelocityStyles,
  formatNumber,
  getRankChange,
  type TrendingSound,
} from "@/lib/data/trending-sounds"

export default function TrendingPage() {
  const [sounds, setSounds] = useState<TrendingSound[]>([])
  const [loading, setLoading] = useState(true)
  const [platform, setPlatform] = useState<"all" | "tiktok" | "spotify" | "youtube">("all")

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const data = await getTrendingSounds({ platform, limit: 20 })
      if (!cancelled) {
        setSounds(data)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [platform])

  return (
    <NeonPage>
      <NeonHero
        eyebrow="Trending"
        title="Trending Sounds"
        description="Discover what's hot across TikTok, Spotify, and YouTube. Find viral sounds to remix and ride the wave."
      />

      {/* Platform filter */}
      <div className="flex gap-2 mb-6">
        {(["all", "tiktok", "spotify", "youtube"] as const).map((p) => (
          <Badge
            key={p}
            variant={platform === p ? "default" : "outline"}
            className="cursor-pointer capitalize"
            onClick={() => setPlatform(p)}
          >
            {p === "all" ? "All Platforms" : p === "tiktok" ? "TikTok" : p === "spotify" ? "Spotify" : "YouTube"}
          </Badge>
        ))}
      </div>

      {/* Sounds list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : sounds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center">
          <Music className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No trending sounds for this filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sounds.map((sound) => {
            const velocity = getVelocityStyles(sound.velocity)
            const rankChange = getRankChange(sound.rank, sound.previousRank)

            return (
              <Card key={sound.id} className="overflow-hidden">
                <CardContent className="flex items-center gap-4 p-4">
                  {/* Rank */}
                  <div className="flex flex-col items-center w-10 shrink-0">
                    <span className="text-lg font-bold text-foreground">#{sound.rank}</span>
                    <div className="flex items-center text-xs">
                      {rankChange.direction === "up" ? (
                        <span className="text-green-500 flex items-center gap-0.5">
                          <ArrowUp className="h-3 w-3" />{rankChange.diff}
                        </span>
                      ) : rankChange.direction === "down" ? (
                        <span className="text-red-500 flex items-center gap-0.5">
                          <ArrowDown className="h-3 w-3" />{rankChange.diff}
                        </span>
                      ) : (
                        <Minus className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg bg-muted shrink-0 overflow-hidden">
                    <img
                      src={sound.thumbnailUrl}
                      alt={sound.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{sound.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{sound.artist}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {sound.platform}
                      </Badge>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${velocity.badge}`}>
                        {velocity.icon} {velocity.label}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-sm font-medium text-foreground">
                      {sound.stats.posts
                        ? `${formatNumber(sound.stats.posts)} posts`
                        : sound.stats.streams
                          ? `${formatNumber(sound.stats.streams)} streams`
                          : `${formatNumber(sound.stats.views ?? 0)} views`}
                    </p>
                    <p className={`text-xs ${sound.stats.growthRate >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {sound.stats.growthRate >= 0 ? "+" : ""}{sound.stats.growthRate}% this week
                    </p>
                    {sound.bpm && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sound.bpm} BPM {sound.key && `| ${sound.key}`}
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  {sound.isRemixable && (
                    <Link href={`/create?trending=${sound.id}`}>
                      <Button size="sm" variant="outline" className="shrink-0">
                        Remix
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </NeonPage>
  )
}
