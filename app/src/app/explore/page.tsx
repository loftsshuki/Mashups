"use client"

import { Suspense, useCallback, useMemo, useState } from "react"
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
import { getLocalRecommendationEvents } from "@/lib/data/recommendation-events"
import { mockMashups } from "@/lib/mock-data"
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

function ExploreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const activeGenre = searchParams.get("genre") || "All"
  const activeSort = (searchParams.get("sort") as SortOption) || "for-you"
  const activeTempo = (searchParams.get("tempo") as TempoOption) || "all"
  const playableOnly = searchParams.get("playable") === "1"
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useState(() => {
    setTimeout(() => setIsInitialLoad(false), 300)
  })

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const shouldDelete =
        (key === "genre" && value === "All") ||
        (key === "sort" && value === "for-you") ||
        (key === "tempo" && value === "all") ||
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
    let results = [...mockMashups]

    if (activeGenre !== "All") {
      results = results.filter((m) =>
        m.genre.toLowerCase().includes(activeGenre.toLowerCase()),
      )
    }

    if (playableOnly) {
      results = results.filter((m) => Boolean(m.audioUrl))
    }

    if (activeTempo === "slow") {
      results = results.filter((m) => m.bpm < 90)
    } else if (activeTempo === "mid") {
      results = results.filter((m) => m.bpm >= 90 && m.bpm <= 120)
    } else if (activeTempo === "fast") {
      results = results.filter((m) => m.bpm > 120)
    }

    switch (activeSort) {
      case "newest":
        results.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        break
      case "for-you": {
        const events = getLocalRecommendationEvents()
        results = rankForYouMashups(results, events)
        break
      }
      case "most-liked":
        results.sort((a, b) => b.likeCount - a.likeCount)
        break
      case "trending":
      default:
        results.sort((a, b) => b.playCount - a.playCount)
        break
    }

    return results
  }, [activeGenre, activeSort, activeTempo, playableOnly])

  return (
    <NeonPage>
      <NeonHero
        eyebrow="Discovery"
        title="Explore Mashups"
        description="Discover fresh mixes from creators around the world."
      />

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
      </section>

      {isInitialLoad ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAndSorted.map((mashup) => (
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
            />
          ))}
        </div>
      ) : (
        <div className="neon-panel rounded-2xl px-6 py-16 text-center">
          <p className="text-lg font-medium text-foreground">No mashups found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different genre, tempo, or sort option.
          </p>
        </div>
      )}
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

