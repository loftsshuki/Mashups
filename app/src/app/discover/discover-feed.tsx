"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { MashupCard } from "@/components/mashup-card"
import { Loader2 } from "lucide-react"
import type { Mashup } from "@/lib/data/types"

interface DiscoverFeedProps {
  initialMashups: Mashup[]
}

export function DiscoverFeed({ initialMashups }: DiscoverFeedProps) {
  const [mashups, setMashups] = useState(initialMashups)
  const [cursor, setCursor] = useState<string | null>(
    initialMashups.length >= 20 ? initialMashups[initialMashups.length - 1]?.id ?? null : null
  )
  const [isLoading, setIsLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (isLoading || !cursor) return
    setIsLoading(true)

    try {
      const response = await fetch(`/api/discover/chronological?cursor=${encodeURIComponent(cursor)}&limit=20`)
      if (!response.ok) return

      const data = (await response.json()) as {
        mashups: Mashup[]
        nextCursor: string | null
      }

      setMashups((prev) => [...prev, ...data.mashups])
      setCursor(data.nextCursor)
    } finally {
      setIsLoading(false)
    }
  }, [cursor, isLoading])

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore()
        }
      },
      { rootMargin: "200px" }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mashups.map((mashup) => (
          <MashupCard
            key={mashup.id}
            id={mashup.id}
            title={mashup.title}
            coverUrl={mashup.cover_image_url ?? "https://placehold.co/400x400/1a1a2e/white?text=M"}
            genre={mashup.genre ?? "Various"}
            duration={mashup.duration ?? 0}
            playCount={mashup.play_count}
            audioUrl={mashup.audio_url}
            creator={{
              username: mashup.creator?.username ?? "unknown",
              displayName: mashup.creator?.display_name ?? "Unknown",
              avatarUrl: mashup.creator?.avatar_url ?? "https://placehold.co/100x100/333/white?text=?",
            }}
          />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="mt-8 flex justify-center">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading more...
          </div>
        )}
        {!cursor && mashups.length > 0 && (
          <p className="text-sm text-muted-foreground">You&apos;ve reached the end.</p>
        )}
      </div>
    </div>
  )
}
