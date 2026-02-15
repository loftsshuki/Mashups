"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { MashupCard } from "@/components/mashup-card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import { TrendingSidebar } from "@/components/create/trending-sidebar"
import { getLocalRecommendationEvents } from "@/lib/data/recommendation-events"
import {
  getRightsSafetyAssessment,
  isRightsSafe,
  type RightsSafetyAssessment,
} from "@/lib/data/rights-safety"
import type { MockMashup } from "@/lib/mock-data"
import { rankForYouMashups } from "@/lib/recommendations/for-you"

const genres = [
  "All",
  "Electronic",
  "Hip-Hop",
  "Lo-fi",
  "Rock",
  "Pop",
  "Synthwave",
  "Trap",
  "Dubstep",
  "Disco",
  "Phonk",
  "Ambient",
  "Chiptune",
  "EDM",
] as const

type SortOption = "for-you" | "trending" | "newest" | "most-liked"
type TempoOption = "all" | "slow" | "mid" | "fast"
type RightsOption = "all" | "safe"

type DiscoverableMashup = {
  mashup: MockMashup
  safety: RightsSafetyAssessment
}

function getSafetyBadge(route: RightsSafetyAssessment["route"]) {
  if (route === "allow") return { label: "Rights-Safe", variant: "default" as const }
  if (route === "review") return { label: "Review", variant: "secondary" as const }
  return { label: "Risk", variant: "destructive" as const }
}

function ExploreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const activeGenre = searchParams.get("genre") || "All"
  const activeSort = (searchParams.get("sort") as SortOption) || "for-you"
  const activeTempo = (searchParams.get("tempo") as TempoOption) || "all"
  const activeRights: RightsOption = searchParams.get("rights") === "safe" ? "safe" : "all"
  const playableOnly = searchParams.get("playable") === "1"
  const [catalogMashups, setCatalogMashups] = useState<MockMashup[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadCatalog() {
      setLoadingCatalog(true)
      try {
        const response = await fetch("/api/discovery/explore", { cache: "no-store" })
        if (!response.ok) return
        const payload = (await response.json()) as { mashups?: MockMashup[] }
        if (!cancelled && Array.isArray(payload.mashups)) {
          setCatalogMashups(payload.mashups)
        }
      } finally {
        if (!cancelled) setLoadingCatalog(false)
      }
    }

    void loadCatalog()
    return () => {
      cancelled = true
    }
  }, [])

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const shouldDelete =
        (key === "genre" && value === "All") ||
        (key === "sort" && value === "for-you") ||
        (key === "tempo" && value === "all") ||
        (key === "rights" && value === "all") ||
        (key === "playable" && value !== "1")

      if (shouldDelete) {
        params.delete(key)
      } else {
        params.set(key, value)
      }

      const queryString = params.toString()
      router.push(`/explore${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      })
    },
    [searchParams, router],
  )

  const filteredAndSorted = useMemo(() => {
    let results: DiscoverableMashup[] = catalogMashups.map((mashup) => ({
      mashup,
      safety: getRightsSafetyAssessment(mashup.id),
    }))

    if (activeGenre !== "All") {
      results = results.filter((entry) =>
        entry.mashup.genre.toLowerCase().includes(activeGenre.toLowerCase()),
      )
    }

    if (playableOnly) {
      results = results.filter((entry) => Boolean(entry.mashup.audioUrl))
    }

    if (activeTempo === "slow") {
      results = results.filter((entry) => entry.mashup.bpm < 90)
    } else if (activeTempo === "mid") {
      results = results.filter(
        (entry) => entry.mashup.bpm >= 90 && entry.mashup.bpm <= 120,
      )
    } else if (activeTempo === "fast") {
      results = results.filter((entry) => entry.mashup.bpm > 120)
    }

    if (activeRights === "safe") {
      results = results.filter((entry) => isRightsSafe(entry.safety))
    }

    switch (activeSort) {
      case "newest":
        results.sort(
          (a, b) =>
            new Date(b.mashup.createdAt).getTime() - new Date(a.mashup.createdAt).getTime(),
        )
        break
      case "for-you": {
        const events = getLocalRecommendationEvents()
        const rankedMashups = rankForYouMashups(
          results.map((entry) => entry.mashup),
          events,
        )
        const rankIndex = new Map(
          rankedMashups.map((mashup, index) => [mashup.id, index]),
        )
        results.sort(
          (a, b) =>
            (rankIndex.get(a.mashup.id) ?? Number.MAX_SAFE_INTEGER) -
            (rankIndex.get(b.mashup.id) ?? Number.MAX_SAFE_INTEGER),
        )
        break
      }
      case "most-liked":
        results.sort((a, b) => b.mashup.likeCount - a.mashup.likeCount)
        break
      case "trending":
      default:
        results.sort((a, b) => b.mashup.playCount - a.mashup.playCount)
        break
    }

    return results
  }, [activeGenre, activeSort, activeTempo, activeRights, playableOnly, catalogMashups])

  const safeCount = filteredAndSorted.filter((entry) => entry.safety.route === "allow").length

  return (
    <NeonPage>
      <NeonHero
        eyebrow="Discovery"
        title="Explore Mashups"
        description="Discover fresh mixes from creators around the world with rights-safe routing baked in."
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <section className="neon-panel mb-8 rounded-2xl p-4">
            <NeonSectionHeader
              title="Filters"
              description="Tune feed results by genre, tempo, playability, and rank logic."
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <Badge
                    key={genre}
                    variant={activeGenre === genre ? "default" : "secondary"}
                    className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                    onClick={() => updateParams("genre", genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Badge
                  variant={playableOnly ? "default" : "secondary"}
                  className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                  onClick={() => updateParams("playable", playableOnly ? "0" : "1")}
                >
                  Playable Only
                </Badge>
                <Badge
                  variant={activeRights === "safe" ? "default" : "secondary"}
                  className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                  onClick={() => updateParams("rights", activeRights === "safe" ? "all" : "safe")}
                >
                  Rights-Safe Only
                </Badge>

                <Select value={activeTempo} onValueChange={(tempo) => updateParams("tempo", tempo)}>
                  <SelectTrigger className="w-[160px] rounded-xl">
                    <SelectValue placeholder="Tempo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tempo</SelectItem>
                    <SelectItem value="slow">Slow (&lt; 90 BPM)</SelectItem>
                    <SelectItem value="mid">Mid (90-120 BPM)</SelectItem>
                    <SelectItem value="fast">Fast (&gt; 120 BPM)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={activeSort} onValueChange={(sort) => updateParams("sort", sort)}>
                  <SelectTrigger className="w-[160px] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="for-you">For You</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="most-liked">Most Liked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {safeCount} rights-safe tracks in current results.
            </p>
          </section>

          {isInitialLoad || loadingCatalog ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSorted.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAndSorted.map(({ mashup, safety }) => {
                const badge = getSafetyBadge(safety.route)
                return (
                  <MashupCard
                    key={mashup.id}
                    id={mashup.id}
                    title={mashup.title}
                    coverUrl={mashup.coverUrl}
                    audioUrl={mashup.audioUrl}
                    genre={mashup.genre}
                    duration={mashup.duration}
                    playCount={mashup.playCount}
                    creator={mashup.creator}
                    rightsBadge={badge.label}
                    rightsBadgeVariant={badge.variant}
                    rightsScore={safety.score}
                  />
                )
              })}
            </div>
          ) : (
            <div className="neon-panel rounded-2xl px-6 py-16 text-center">
              <p className="text-lg font-medium text-foreground">No mashups found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different genre, tempo, or sort option.
              </p>
            </div>
          )}
        </div>

        <aside className="shrink-0 lg:w-80">
          <TrendingSidebar />
        </aside>
      </div>
    </NeonPage>
  )
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <NeonPage>
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="mb-8 h-5 w-72" />
          <div className="mb-8 flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-xl" />
            ))}
          </div>
        </NeonPage>
      }
    >
      <ExploreContent />
    </Suspense>
  )
}
