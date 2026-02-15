"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Headphones, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeaturedMashup {
  id: string
  title: string
  playCount: number
  creatorName: string
}

interface FeaturedInProps {
  username: string
  className?: string
}

function formatCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  }
  return count.toString()
}

export function FeaturedIn({ username, className }: FeaturedInProps) {
  const [mashups, setMashups] = useState<FeaturedMashup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadFeatured() {
      try {
        const response = await fetch(`/api/stems/featured-in?username=${encodeURIComponent(username)}`)
        if (!response.ok) return
        const data = (await response.json()) as { mashups: FeaturedMashup[] }
        if (!cancelled) setMashups(data.mashups)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadFeatured()
    return () => { cancelled = true }
  }, [username])

  if (loading) return null
  if (mashups.length === 0) return null

  const totalPlays = mashups.reduce((sum, m) => sum + m.playCount, 0)

  return (
    <div className={cn("rounded-xl border border-border/70 bg-card/70 p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Featured In</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {mashups.length} mashup{mashups.length !== 1 ? "s" : ""} ({formatCount(totalPlays)} plays)
        </span>
      </div>

      <div className="space-y-1.5">
        {mashups.slice(0, 5).map((mashup) => (
          <Link
            key={mashup.id}
            href={`/mashup/${mashup.id}`}
            className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{mashup.title}</p>
              <p className="text-[10px] text-muted-foreground">by {mashup.creatorName}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-2">
              <Headphones className="h-3 w-3" />
              {formatCount(mashup.playCount)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
