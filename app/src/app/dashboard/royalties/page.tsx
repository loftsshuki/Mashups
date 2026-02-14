"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  FileText,
  Download,
  Globe,
  Music,
} from "lucide-react"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  NeonPage,
  NeonHero,
  NeonGrid,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import { createClient } from "@/lib/supabase/client"
import {
  getRoyaltyStreams,
  getRoyaltyProjections,
  getTaxDocuments,
  aggregateBySource,
  aggregateByPlatform,
  REVENUE_SOURCES,
  PLATFORMS,
} from "@/lib/data/royalty-dashboard"
import type {
  RoyaltyStream,
  RoyaltyProjection,
  TaxDocument,
} from "@/lib/data/types"

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

function SourceBreakdownBar({
  breakdown,
}: {
  breakdown: Record<string, { count: number; totalCents: number }>
}) {
  const total = Object.values(breakdown).reduce(
    (sum, v) => sum + v.totalCents,
    0,
  )
  if (total === 0) return null

  return (
    <div className="space-y-2">
      {/* Visual bar */}
      <div className="flex h-4 overflow-hidden rounded-full">
        {REVENUE_SOURCES.map((src) => {
          const entry = breakdown[src.value]
          if (!entry || entry.totalCents === 0) return null
          const pct = (entry.totalCents / total) * 100
          return (
            <div
              key={src.value}
              style={{ width: `${pct}%`, backgroundColor: src.color }}
              className="transition-all"
              title={`${src.label}: ${formatMoney(entry.totalCents)} (${pct.toFixed(1)}%)`}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {REVENUE_SOURCES.map((src) => {
          const entry = breakdown[src.value]
          if (!entry || entry.totalCents === 0) return null
          return (
            <div key={src.value} className="flex items-center gap-1.5 text-xs">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: src.color }}
              />
              <span className="text-muted-foreground">{src.label}</span>
              <span className="font-medium text-foreground">
                {formatMoney(entry.totalCents)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RoyaltiesContent() {
  const [streams, setStreams] = useState<RoyaltyStream[]>([])
  const [projections, setProjections] = useState<RoyaltyProjection[]>([])
  const [taxDocs, setTaxDocs] = useState<TaxDocument[]>([])
  const [sourceFilter, setSourceFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        const userId = user?.id ?? "mock-user"

        const [streamData, projData, taxData] = await Promise.all([
          getRoyaltyStreams(userId, { limit: 100 }),
          getRoyaltyProjections(userId),
          getTaxDocuments(userId),
        ])
        setStreams(streamData)
        setProjections(projData)
        setTaxDocs(taxData)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const sourceBreakdown = useMemo(() => aggregateBySource(streams), [streams])
  const platformBreakdown = useMemo(
    () => aggregateByPlatform(streams),
    [streams],
  )

  const totalEarned = streams.reduce((sum, s) => sum + s.amount_cents, 0)
  const currentMonth = projections[0]
  const prevMonth = projections[1]
  const monthlyGrowth =
    currentMonth && prevMonth && prevMonth.actual_cents > 0
      ? ((currentMonth.actual_cents - prevMonth.actual_cents) /
          prevMonth.actual_cents) *
        100
      : 0

  const filteredStreams = sourceFilter
    ? streams.filter((s) => s.source === sourceFilter)
    : streams

  if (loading) {
    return (
      <NeonPage className="max-w-6xl">Loading royalty dashboard...</NeonPage>
    )
  }

  return (
    <NeonPage className="max-w-6xl">
      <NeonHero
        eyebrow="Royalty Dashboard 2.0"
        title="Stream-by-stream earnings breakdown."
        description="Track every cent across platforms, sources, and mashups. Projected monthly earnings and tax document export."
      />

      {/* Top-level metrics */}
      <NeonGrid className="sm:grid-cols-4">
        <div className="neon-panel rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5" />
            Total Earned
          </div>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatMoney(totalEarned)}
          </p>
        </div>
        <div className="neon-panel rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" />
            This Month
          </div>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatMoney(currentMonth?.actual_cents ?? 0)}
          </p>
        </div>
        <div className="neon-panel rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            Projected
          </div>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatMoney(currentMonth?.projected_cents ?? 0)}
          </p>
        </div>
        <div className="neon-panel rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            Growth
          </div>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {monthlyGrowth > 0 ? "+" : ""}
            {monthlyGrowth.toFixed(1)}%
          </p>
        </div>
      </NeonGrid>

      {/* Source breakdown */}
      <NeonSectionHeader
        title="Revenue by Source"
        description="Breakdown of earnings across all revenue streams"
      />
      <div className="neon-panel rounded-2xl p-4">
        <SourceBreakdownBar breakdown={sourceBreakdown} />
      </div>

      {/* Platform breakdown */}
      <NeonSectionHeader
        title="Revenue by Platform"
        description="Where your earnings come from"
      />
      <NeonGrid className="sm:grid-cols-3 md:grid-cols-5">
        {PLATFORMS.map((platform) => {
          const entry = platformBreakdown[platform.value]
          return (
            <div
              key={platform.value}
              className="neon-panel rounded-2xl p-3 text-center"
            >
              <Globe
                className="mx-auto h-5 w-5"
                style={{ color: platform.color }}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {platform.label}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {formatMoney(entry?.totalCents ?? 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {entry?.count ?? 0} streams
              </p>
            </div>
          )
        })}
      </NeonGrid>

      {/* Monthly trend */}
      {projections.length > 0 && (
        <>
          <NeonSectionHeader
            title="Monthly Trend"
            description="Projected vs actual earnings over time"
          />
          <div className="neon-panel rounded-2xl p-4">
            <div className="space-y-3">
              {projections.map((proj) => {
                const pct =
                  proj.projected_cents > 0
                    ? Math.min(
                        100,
                        (proj.actual_cents / proj.projected_cents) * 100,
                      )
                    : 0
                return (
                  <div key={proj.month}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {proj.month}
                      </span>
                      <span className="text-muted-foreground">
                        {formatMoney(proj.actual_cents)} /{" "}
                        {formatMoney(proj.projected_cents)}
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted/30">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {/* Source breakdown for this month */}
                    {Object.keys(proj.source_breakdown).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {Object.entries(proj.source_breakdown).map(
                          ([source, cents]) => {
                            const srcDef = REVENUE_SOURCES.find(
                              (s) => s.value === source,
                            )
                            return (
                              <span
                                key={source}
                                className="text-[10px] text-muted-foreground"
                              >
                                <span
                                  className="mr-0.5 inline-block h-1.5 w-1.5 rounded-full"
                                  style={{
                                    backgroundColor: srcDef?.color ?? "#888",
                                  }}
                                />
                                {srcDef?.label ?? source}:{" "}
                                {formatMoney(cents)}
                              </span>
                            )
                          },
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Stream-by-stream log */}
      <NeonSectionHeader
        title="Stream-by-Stream Log"
        description="Every individual earning event"
      />

      {/* Source filter */}
      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant={!sourceFilter ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSourceFilter(null)}
        >
          All
        </Badge>
        {REVENUE_SOURCES.map((src) => (
          <Badge
            key={src.value}
            variant={sourceFilter === src.value ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() =>
              setSourceFilter(
                sourceFilter === src.value ? null : src.value,
              )
            }
          >
            {src.label}
          </Badge>
        ))}
      </div>

      <div className="space-y-2">
        {filteredStreams.length > 0 ? (
          filteredStreams.map((stream) => {
            const srcDef = REVENUE_SOURCES.find(
              (s) => s.value === stream.source,
            )
            const platDef = PLATFORMS.find(
              (p) => p.value === stream.platform,
            )
            return (
              <div
                key={stream.id}
                className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/50 px-3 py-2"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${srcDef?.color ?? "#888"}15`,
                    color: srcDef?.color ?? "#888",
                  }}
                >
                  {stream.source === "play" ? (
                    <Music className="h-4 w-4" />
                  ) : stream.source === "tip" ? (
                    <DollarSign className="h-4 w-4" />
                  ) : (
                    <BarChart3 className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {srcDef?.label ?? stream.source}
                    </span>
                    {stream.platform && (
                      <Badge variant="outline" className="text-[10px]">
                        {platDef?.label ?? stream.platform}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(stream.streamed_at).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formatMoney(stream.amount_cents)}
                </p>
              </div>
            )
          })
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No streams match the selected filter.
          </p>
        )}
      </div>

      {/* Tax Documents */}
      <NeonSectionHeader
        title="Tax Documents"
        description="Download tax documents for your records"
      />
      <div className="space-y-2">
        {taxDocs.length > 0 ? (
          taxDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/50 px-3 py-2"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {doc.document_type} — {doc.tax_year}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total: {formatMoney(doc.total_earnings_cents)} | Generated{" "}
                  {new Date(doc.generated_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 rounded-full text-xs"
                onClick={() => {
                  const url = doc.document_url
                  if (url) {
                    const a = document.createElement("a")
                    a.href = url
                    a.download = `${doc.document_type}-${doc.tax_year}.pdf`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                  } else {
                    const blob = new Blob(
                      [
                        `${doc.document_type} — Tax Year ${doc.tax_year}\n` +
                        `Total Earnings: ${formatMoney(doc.total_earnings_cents)}\n` +
                        `Generated: ${new Date(doc.generated_at).toLocaleDateString()}\n`,
                      ],
                      { type: "text/plain" }
                    )
                    const objectUrl = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = objectUrl
                    a.download = `${doc.document_type}-${doc.tax_year}.txt`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(objectUrl)
                  }
                }}
              >
                <Download className="h-3 w-3" />
                Export
              </Button>
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No tax documents available yet.
          </p>
        )}
      </div>
    </NeonPage>
  )
}

export default function RoyaltiesPage() {
  return (
    <AuthGuard>
      <RoyaltiesContent />
    </AuthGuard>
  )
}
