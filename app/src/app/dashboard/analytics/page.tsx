"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { mockMashups } from "@/lib/mock-data"
import { buildCreatorAnalytics } from "@/lib/data/analytics"

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

function AnalyticsContent() {
  const stats = buildCreatorAnalytics(mockMashups)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Creator Analytics</h1>
      <p className="mt-2 text-muted-foreground">
        Engagement and retention snapshot (mock telemetry until recommendation events are live).
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Plays</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.totalPlays.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <p className="text-xs text-muted-foreground">Avg Completion</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{formatPercent(stats.avgCompletionRate)}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <p className="text-xs text-muted-foreground">Skip Rate</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{formatPercent(stats.skipRate)}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <p className="text-xs text-muted-foreground">Save Rate</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{formatPercent(stats.saveRate)}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <p className="text-xs text-muted-foreground">Likes</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.totalLikes.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <p className="text-xs text-muted-foreground">Comments</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.totalComments.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <AnalyticsContent />
    </AuthGuard>
  )
}
