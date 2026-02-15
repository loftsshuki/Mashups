"use client"

import { useState } from "react"
import { Sparkles, Play, Users, MessageCircle, X, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface WhileAwayStats {
  newPlays: number
  newFollowers: number
  newComments: number
  trendingMashups: string[]
}

interface WelcomeBackProps {
  daysSinceLastVisit: number
  stats: WhileAwayStats
  className?: string
}

export function WelcomeBack({ daysSinceLastVisit, stats, className }: WelcomeBackProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className={cn(
      "relative rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-background p-6 space-y-4",
      className
    )}>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Welcome back!</h3>
          <p className="text-xs text-muted-foreground">
            You&apos;ve been away for {daysSinceLastVisit} days. Here&apos;s what happened:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/50 bg-card/50 p-3 text-center">
          <Play className="h-4 w-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{stats.newPlays.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">new plays</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/50 p-3 text-center">
          <Users className="h-4 w-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">+{stats.newFollowers}</p>
          <p className="text-[10px] text-muted-foreground">new followers</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/50 p-3 text-center">
          <MessageCircle className="h-4 w-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{stats.newComments}</p>
          <p className="text-[10px] text-muted-foreground">new comments</p>
        </div>
      </div>

      {stats.trendingMashups.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Trending while you were away</p>
          <div className="flex flex-wrap gap-1.5">
            {stats.trendingMashups.map((title) => (
              <span
                key={title}
                className="rounded-full bg-muted/30 px-2.5 py-0.5 text-[10px] font-medium text-foreground"
              >
                {title}
              </span>
            ))}
          </div>
        </div>
      )}

      <Button size="sm" asChild>
        <Link href="/create">
          Let&apos;s Create
          <ArrowRight className="ml-2 h-3 w-3" />
        </Link>
      </Button>
    </div>
  )
}
