"use client"

import { useState, useMemo, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MashupCard } from "@/components/mashup-card"
import { mockMashups } from "@/lib/mock-data"

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
]

type SortOption = "trending" | "newest" | "most-liked"

function ExploreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const activeGenre = searchParams.get("genre") || "All"
  const activeSort = (searchParams.get("sort") as SortOption) || "trending"
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Simulate initial loading
  useState(() => {
    setTimeout(() => setIsInitialLoad(false), 300)
  })

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === "All" || value === "trending") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      const queryString = params.toString()
      router.push(`/explore${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      })
    },
    [searchParams, router]
  )

  function handleGenreClick(genre: string) {
    updateParams("genre", genre)
  }

  function handleSortChange(sort: string) {
    updateParams("sort", sort)
  }

  const filteredAndSorted = useMemo(() => {
    let results = [...mockMashups]

    // Filter by genre
    if (activeGenre !== "All") {
      results = results.filter((m) =>
        m.genre.toLowerCase().includes(activeGenre.toLowerCase())
      )
    }

    // Sort
    switch (activeSort) {
      case "newest":
        results.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
      case "most-liked":
        results.sort((a, b) => b.likeCount - a.likeCount)
        break
      case "trending":
      default:
        results.sort((a, b) => b.playCount - a.playCount)
        break
    }

    return results
  }, [activeGenre, activeSort])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Explore Mashups
        </h1>
        <p className="mt-2 text-muted-foreground">
          Discover fresh mixes from creators around the world
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Badge
              key={genre}
              variant={activeGenre === genre ? "default" : "secondary"}
              className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
              onClick={() => handleGenreClick(genre)}
            >
              {genre}
            </Badge>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={activeSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="most-liked">Most Liked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mashup grid */}
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
              genre={mashup.genre}
              duration={mashup.duration}
              playCount={mashup.playCount}
              creator={mashup.creator}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border/50 bg-muted/30 px-6 py-16 text-center">
          <p className="text-lg font-medium text-foreground">No mashups found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different genre or sort option
          </p>
        </div>
      )}
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
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
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  )
}
