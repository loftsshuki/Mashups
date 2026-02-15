"use client"

import { useEffect, useState } from "react"

import { AuthGuard } from "@/components/auth/auth-guard"
import {
  NeonGrid,
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import type { CreatorAnalyticsSnapshot } from "@/lib/data/analytics"

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

function AnalyticsContent() {
  const [stats, setStats] = useState<CreatorAnalyticsSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadStats() {
      setLoading(true)
      try {
        const response = await fetch("/api/analytics/creator", { cache: "no-store" })
        if (!response.ok) return
        const payload = (await response.json()) as { stats?: CreatorAnalyticsSnapshot }
        if (!cancelled && payload.stats) {
          setStats(payload.stats)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadStats()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading || !stats) {
    return <NeonPage className="max-w-6xl">Loading analytics...</NeonPage>
  }

  return (
    <NeonPage className="max-w-6xl">
      <NeonHero
        eyebrow="Creator Analytics"
        title="Engagement and retention snapshot."
        description="Telemetry section rebuilt in the same visual cadence as the Neon-style marketing surfaces."
      />

      <NeonSectionHeader
        title="Performance"
        description="Core metrics driving ranking, retention, and campaign optimization."
      />
      <NeonGrid className="sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Total Plays</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {stats.totalPlays.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Avg Completion</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatPercent(stats.avgCompletionRate)}
          </p>
        </div>
        <div className="rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Skip Rate</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatPercent(stats.skipRate)}
          </p>
        </div>
        <div className="rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Save Rate</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatPercent(stats.saveRate)}
          </p>
        </div>
        <div className="rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Likes</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {stats.totalLikes.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Comments</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {stats.totalComments.toLocaleString()}
          </p>
        </div>
      </NeonGrid>
    </NeonPage>
  )
}

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <AnalyticsContent />
    </AuthGuard>
  )
}
