"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MashupCard } from "@/components/mashup-card"
import { Skeleton } from "@/components/ui/skeleton"
import { getForYouFeed, getFollowingFeed } from "@/lib/data/follow-feed"
import { EmptyFollowingState } from "@/components/feed/empty-following-state"
import type { Mashup } from "@/lib/data/types"

const PAGE_SIZE = 12

interface FeedMashupListProps {
  tab: "for-you" | "following"
  genre: string
}

export function FeedMashupList({ tab, genre }: FeedMashupListProps) {
  const [mashups, setMashups] = useState<Mashup[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Reset when tab or genre changes
  useEffect(() => {
    setMashups([])
    setPage(0)
    setHasMore(true)
    setIsLoading(true)
  }, [tab, genre])

  // Fetch data when page, tab, or genre changes
  useEffect(() => {
    let cancelled = false

    async function fetchPage() {
      setIsLoading(true)
      const fetcher = tab === "following" ? getFollowingFeed : getForYouFeed
      const result = await fetcher({ page, limit: PAGE_SIZE, genre })

      if (cancelled) return

      setMashups((prev) =>
        page === 0 ? result.mashups : [...prev, ...result.mashups],
      )
      setHasMore(result.hasMore)
      setIsLoading(false)
    }

    void fetchPage()
    return () => {
      cancelled = true
    }
  }, [tab, genre, page])

  // Intersection observer for infinite scroll
  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !isLoading) {
        setPage((prev) => prev + 1)
      }
    },
    [hasMore, isLoading],
  )

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "200px",
    })
    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [observerCallback])

  // Empty state for the following tab
  if (!isLoading && mashups.length === 0 && tab === "following") {
    return <EmptyFollowingState />
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mashups.map((mashup) => (
          <MashupCard
            key={mashup.id}
            id={mashup.id}
            title={mashup.title}
            coverUrl={mashup.cover_image_url || "/images/placeholder-cover.svg"}
            audioUrl={mashup.audio_url}
            genre={mashup.genre || "Unknown"}
            duration={mashup.duration || 0}
            playCount={mashup.play_count}
            creator={{
              username: mashup.creator?.username || "unknown",
              displayName:
                mashup.creator?.display_name ||
                mashup.creator?.username ||
                "Unknown",
              avatarUrl: mashup.creator?.avatar_url || "",
            }}
          />
        ))}

        {/* Loading skeletons */}
        {isLoading &&
          Array.from({ length: page === 0 ? 6 : 3 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
      </div>

      {/* Sentinel for infinite scroll */}
      {hasMore && <div ref={sentinelRef} className="h-1" />}

      {/* End message */}
      {!hasMore && mashups.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          You&apos;ve reached the end of the feed.
        </p>
      )}
    </div>
  )
}
