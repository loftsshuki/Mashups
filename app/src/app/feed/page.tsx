"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Sparkles, TrendingUp, Target, Users as UsersIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { NeonHero, NeonPage } from "@/components/marketing/neon-page"
import { getFollowingFeed, getForYouFeed, getFeedGenres } from "@/lib/data/follow-feed"
import { getTrendingAnalysis } from "@/lib/data/recommendations"
import { MashupCard } from "@/components/mashup-card"
import type { Mashup } from "@/lib/data/types"

type Tab = "for-you" | "following"

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<Tab>("for-you")
  const [mashups, setMashups] = useState<Mashup[]>([])
  const [genres, setGenres] = useState<string[]>([])
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [trending, setTrending] = useState<any>(null)

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // ------------------------------------------------------------------
  // Load genres + trending data once on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    async function loadSideData() {
      const [genreList, trendData] = await Promise.all([
        getFeedGenres(),
        getTrendingAnalysis(),
      ])
      setGenres(genreList)
      setTrending(trendData)
    }
    loadSideData()
  }, [])

  // ------------------------------------------------------------------
  // Load / reload feed whenever tab, genre, or page changes
  // ------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false

    async function loadFeed() {
      const isFirstPage = page === 1
      if (isFirstPage) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }

      try {
        const fetcher = activeTab === "following" ? getFollowingFeed : getForYouFeed
        const opts: { page: number; limit: number; genre?: string } = {
          page,
          limit: 12,
        }
        if (selectedGenre) opts.genre = selectedGenre

        const result = await fetcher(opts)

        if (cancelled) return

        if (isFirstPage) {
          setMashups(result.mashups)
        } else {
          setMashups((prev) => [...prev, ...result.mashups])
        }
        setHasMore(result.hasMore)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
          setIsLoadingMore(false)
        }
      }
    }

    loadFeed()
    return () => {
      cancelled = true
    }
  }, [activeTab, selectedGenre, page])

  // ------------------------------------------------------------------
  // Infinite scroll via IntersectionObserver
  // ------------------------------------------------------------------
  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
        setPage((p) => p + 1)
      }
    },
    [hasMore, isLoadingMore, isLoading],
  )

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "200px",
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [observerCallback])

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------
  function switchTab(tab: Tab) {
    if (tab === activeTab) return
    setActiveTab(tab)
    setMashups([])
    setPage(1)
    setHasMore(true)
  }

  function selectGenre(genre: string | null) {
    setSelectedGenre(genre)
    setMashups([])
    setPage(1)
    setHasMore(true)
  }

  // ------------------------------------------------------------------
  // Render helpers
  // ------------------------------------------------------------------
  const isEmpty = !isLoading && mashups.length === 0

  return (
    <NeonPage>
      <NeonHero
        eyebrow="Feed"
        title="Your Personalized Feed"
        description="Discover new mashups from creators you follow and AI-powered recommendations tailored to your taste."
      />

      {/* ---- Tabs ---- */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={activeTab === "for-you" ? "default" : "outline"}
          size="sm"
          onClick={() => switchTab("for-you")}
          className="gap-1.5"
        >
          <Sparkles className="h-4 w-4" />
          For You
        </Button>
        <Button
          variant={activeTab === "following" ? "default" : "outline"}
          size="sm"
          onClick={() => switchTab("following")}
          className="gap-1.5"
        >
          <UsersIcon className="h-4 w-4" />
          Following
        </Button>
      </div>

      {/* ---- Genre filter bar ---- */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Badge
          variant={selectedGenre === null ? "default" : "outline"}
          className="cursor-pointer whitespace-nowrap select-none"
          onClick={() => selectGenre(null)}
        >
          All
        </Badge>
        {genres.map((genre) => (
          <Badge
            key={genre}
            variant={selectedGenre === genre ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap select-none"
            onClick={() => selectGenre(genre)}
          >
            {genre}
          </Badge>
        ))}
      </div>

      {/* ---- Main grid + sidebar ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            activeTab === "following" ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
                <UsersIcon className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-1">
                  You aren&apos;t following anyone yet
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  Follow creators you love and their latest mashups will show up here.
                </p>
                <Link href="/explore">
                  <Button>Explore Creators</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
                <Sparkles className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-1">No mashups found</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Try selecting a different genre or check back later for new recommendations.
                </p>
              </div>
            )
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mashups.map((m) => (
                  <MashupCard
                    key={m.id}
                    id={m.id}
                    title={m.title}
                    coverUrl={m.cover_image_url ?? "/images/placeholder-cover.svg"}
                    genre={m.genre ?? "Other"}
                    duration={m.duration ?? 0}
                    playCount={m.play_count}
                    audioUrl={m.audio_url}
                    creator={{
                      username: m.creator?.username ?? "unknown",
                      displayName: m.creator?.display_name ?? "Unknown",
                      avatarUrl: m.creator?.avatar_url ?? "",
                    }}
                  />
                ))}
              </div>

              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-square w-full rounded-xl" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Sentinel element for infinite scroll */}
          <div ref={sentinelRef} className="h-1" />
        </div>

        {/* ---- Sidebar - Trending ---- */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending Now
                </span>
                <Link href="/trending" className="text-xs font-normal text-primary hover:underline">
                  View all
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!trending ? (
                <Skeleton className="h-20" />
              ) : (
                <>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Hot Genres</h4>
                    <div className="space-y-2">
                      {trending?.trendingGenres.slice(0, 3).map((g: any) => (
                        <div key={g.genre} className="flex items-center justify-between text-sm">
                          <span>{g.genre}</span>
                          <Badge variant="secondary" className="text-green-600">
                            +{g.growth}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Rising Creators</h4>
                    <div className="space-y-2">
                      {trending?.risingCreators.slice(0, 2).map((c: any) => (
                        <div key={c.creatorId} className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground">
                              +{c.followerGrowth} followers
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Viral Sounds</h4>
                    <div className="space-y-2">
                      {trending?.viralSounds.slice(0, 2).map((s: any) => (
                        <div key={s.trackId} className="text-sm">
                          <p className="font-medium">{s.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.artist} &bull; {s.platform}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Daily Challenge Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Daily Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">Speed Demon</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create a mashup with only 150+ BPM tracks
              </p>
              <Link href="/daily-flip">
                <Button className="w-full mt-4" variant="secondary">
                  Accept Challenge
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </NeonPage>
  )
}
