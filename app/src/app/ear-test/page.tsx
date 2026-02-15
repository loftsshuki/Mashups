"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { Ear, ArrowRight, RotateCcw, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BlindPlayer } from "@/components/ear-test/blind-player"

interface BlindMashup {
  id: string
  audioUrl: string
}

interface RevealedMashup {
  id: string
  title: string
  audioUrl: string
  genre: string
  creatorName: string
  playCount: number
  coverUrl: string | null
}

type Phase = "loading" | "listening" | "reveal"

export default function EarTestPage() {
  const [phase, setPhase] = useState<Phase>("loading")
  const [blindMashups, setBlindMashups] = useState<BlindMashup[]>([])
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [revealed, setRevealed] = useState<RevealedMashup[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Load blind mashups
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetch("/api/ear-test")
        if (!response.ok) return
        const data = (await response.json()) as { mashups: BlindMashup[] }
        if (!cancelled) {
          setBlindMashups(data.mashups)
          setPhase("listening")
        }
      } catch {
        // Failed to load
      }
    }

    void load()
    return () => { cancelled = true }
  }, [])

  const handleRate = useCallback((mashupId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [mashupId]: rating }))
  }, [])

  const allRated = blindMashups.length > 0 && blindMashups.every((m) => ratings[m.id] !== undefined)

  const handleReveal = useCallback(async () => {
    try {
      const response = await fetch("/api/ear-test?reveal=true")
      if (!response.ok) return
      const data = (await response.json()) as { mashups: RevealedMashup[] }
      setRevealed(data.mashups)
      setPhase("reveal")
    } catch {
      // Failed to reveal
    }
  }, [])

  const handleReset = useCallback(() => {
    setPhase("loading")
    setBlindMashups([])
    setRatings({})
    setRevealed([])
    setCurrentIndex(0)

    // Reload
    void (async () => {
      const response = await fetch("/api/ear-test")
      if (!response.ok) return
      const data = (await response.json()) as { mashups: BlindMashup[] }
      setBlindMashups(data.mashups)
      setPhase("listening")
    })()
  }, [])

  function formatCount(count: number): string {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
    if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`
    return count.toString()
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Ear className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          The Ear Test
        </h1>
        <p className="mt-2 text-muted-foreground">
          5 mashups. No metadata. Just your ears. Rate them blind.
        </p>
      </div>

      {/* Loading */}
      {phase === "loading" && (
        <div className="text-center py-12">
          <Headphones className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" />
          <p className="mt-3 text-sm text-muted-foreground">Selecting mashups...</p>
        </div>
      )}

      {/* Listening Phase */}
      {phase === "listening" && (
        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(Object.keys(ratings).length / blindMashups.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {Object.keys(ratings).length}/{blindMashups.length}
            </span>
          </div>

          {/* Card flow — show one at a time */}
          {blindMashups[currentIndex] && (
            <BlindPlayer
              audioUrl={blindMashups[currentIndex].audioUrl}
              index={currentIndex}
              rating={ratings[blindMashups[currentIndex].id] ?? null}
              onRate={(rating) => {
                handleRate(blindMashups[currentIndex].id, rating)
                // Auto-advance after rating
                if (currentIndex < blindMashups.length - 1) {
                  setTimeout(() => setCurrentIndex((i) => i + 1), 500)
                }
              }}
            />
          )}

          {/* Navigation dots */}
          <div className="flex justify-center gap-2">
            {blindMashups.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setCurrentIndex(i)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i === currentIndex
                    ? "bg-primary"
                    : ratings[m.id] !== undefined
                      ? "bg-primary/40"
                      : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Reveal button */}
          {allRated && (
            <div className="text-center pt-4">
              <Button size="lg" onClick={handleReveal}>
                Reveal Results
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Reveal Phase */}
      {phase === "reveal" && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground text-center">
            The Reveal
          </h2>

          {revealed.map((mashup) => {
            const userRating = ratings[mashup.id]
            return (
              <div
                key={mashup.id}
                className="rounded-xl border border-border/70 bg-card/70 p-4 flex items-center gap-4"
              >
                {/* Cover */}
                <div className="h-14 w-14 rounded-lg bg-muted/50 overflow-hidden shrink-0">
                  {mashup.coverUrl ? (
                    <img src={mashup.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Headphones className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/mashup/${mashup.id}`}
                    className="text-sm font-medium text-foreground hover:text-primary truncate block"
                  >
                    {mashup.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    by {mashup.creatorName} · {mashup.genre} · {formatCount(mashup.playCount)} plays
                  </p>
                </div>

                {/* User rating */}
                {userRating !== undefined && (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-lg font-bold text-primary">{userRating}</span>
                    <span className="text-xs text-muted-foreground">/5</span>
                  </div>
                )}
              </div>
            )
          })}

          {/* Actions */}
          <div className="flex justify-center gap-3 pt-4">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button asChild>
              <Link href="/discover">
                Discover More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-16 rounded-xl border border-border/50 bg-card/50 p-6">
        <h2 className="text-sm font-semibold text-foreground mb-2">About The Ear Test</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Every week, we select 5 mashups — weighted toward lesser-known creators.
          You listen blind (no titles, no play counts, no genres) and rate purely by ear.
          After rating all 5, we reveal the full details. It&apos;s the ultimate test of taste,
          and a great way to discover new creators.
        </p>
      </div>
    </div>
  )
}
