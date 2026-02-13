"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import {
  NeonGrid,
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import { buildCreatorAnalytics } from "@/lib/data/analytics"
import { mockMashups } from "@/lib/mock-data"

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

function AnalyticsContent() {
  const stats = buildCreatorAnalytics(mockMashups)

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
        <div className="neon-panel rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Total Plays</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {stats.totalPlays.toLocaleString()}
          </p>
        </div>
        <div className="neon-panel rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Avg Completion</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatPercent(stats.avgCompletionRate)}
          </p>
        </div>
        <div className="neon-panel rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Skip Rate</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatPercent(stats.skipRate)}
          </p>
        </div>
        <div className="neon-panel rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Save Rate</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatPercent(stats.saveRate)}
          </p>
        </div>
        <div className="neon-panel rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Likes</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {stats.totalLikes.toLocaleString()}
          </p>
        </div>
        <div className="neon-panel rounded-2xl p-4">
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

