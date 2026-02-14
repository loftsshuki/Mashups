"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getTipsForCreator, summarizeTips } from "@/lib/data/tips"
import type { Tip } from "@/lib/data/types"

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface TipWallProps {
  creatorId: string
  className?: string
}

export function TipWall({ creatorId, className }: TipWallProps) {
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTipsForCreator(creatorId)
      .then(setTips)
      .finally(() => setLoading(false))
  }, [creatorId])

  const summary = summarizeTips(tips)

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        <p className="text-sm text-muted-foreground">Loading tips...</p>
      </div>
    )
  }

  if (tips.length === 0) {
    return (
      <div className={cn("space-y-3", className)}>
        <p className="text-sm text-muted-foreground">
          No tips yet. Be the first to support this creator!
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2 text-center">
          <p className="text-xs text-muted-foreground">Total Tips</p>
          <p className="text-lg font-semibold text-foreground">
            {formatMoney(summary.totalCents)}
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2 text-center">
          <p className="text-xs text-muted-foreground">Supporters</p>
          <p className="text-lg font-semibold text-foreground">
            {summary.count}
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2 text-center">
          <p className="text-xs text-muted-foreground">Top Tip</p>
          <p className="text-lg font-semibold text-foreground">
            {summary.topTipper
              ? formatMoney(summary.topTipper.total)
              : "--"}
          </p>
        </div>
      </div>

      {/* Tip list */}
      <div className="space-y-2">
        {tips.map((tip) => (
          <div
            key={tip.id}
            className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/50 px-3 py-2.5"
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={tip.tipper?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">
                {(tip.tipper?.display_name ?? tip.tipper?.username ?? "?")
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {tip.tipper?.display_name ?? tip.tipper?.username ?? "Anonymous"}
                </span>
                <span className="flex items-center gap-0.5 text-sm font-semibold text-pink-500">
                  <Heart className="h-3 w-3 fill-pink-500" />
                  {formatMoney(tip.amount_cents)}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {timeAgo(tip.created_at)}
                </span>
              </div>
              {tip.message && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {tip.message}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
