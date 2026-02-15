"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Crown, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CreatorAvatar } from "@/components/creator-avatar"
import {
  NeonGrid,
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import type { CreatorScoreboardRow } from "@/lib/growth/scoreboard"

function formatCount(value: number): string {
  return value.toLocaleString()
}

export default function ScoreboardPage() {
  const [rows, setRows] = useState<CreatorScoreboardRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadRows() {
      setLoading(true)
      try {
        const response = await fetch("/api/scoreboard/weekly", { cache: "no-store" })
        if (!response.ok) return
        const payload = (await response.json()) as { rows?: CreatorScoreboardRow[] }
        if (!cancelled && Array.isArray(payload.rows)) setRows(payload.rows)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadRows()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <NeonPage className="max-w-6xl">
      <NeonHero
        eyebrow="Creator Scoreboard"
        title="Public leaderboard ranked by weekly growth."
        description="This board prioritizes momentum, weekly post cadence, and current play lift over total legacy followers."
        actions={
          <Button className="rounded-full" asChild>
            <Link href="/create">
              Submit a Track
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <NeonSectionHeader
        title="Top Movers"
        description={
          loading
            ? "Loading weekly ranking..."
            : "Weekly ranking refreshes based on growth loops, not vanity totals."
        }
      />
      <NeonGrid>
        {rows.map((row) => (
          <div
            key={row.username}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                #{row.rank}
              </div>
              <CreatorAvatar
                username={row.username}
                displayName={row.displayName}
                avatarUrl={row.avatarUrl}
                size="sm"
              />
              {row.rank <= 3 ? <Crown className="h-4 w-4 text-primary" /> : null}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                +{row.weeklyGrowthRate.toFixed(1)}% growth
              </span>
              <span>{row.weeklyPosts} posts</span>
              <span>{formatCount(row.weeklyPlays)} weekly plays</span>
              <span>momentum {row.momentumLift.toFixed(1)}k</span>
            </div>
          </div>
        ))}
      </NeonGrid>
    </NeonPage>
  )
}
