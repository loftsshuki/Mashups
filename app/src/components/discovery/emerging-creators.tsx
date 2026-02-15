"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TrendingUp, Sparkles } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface EmergingCreator {
  id: string
  username: string
  displayName: string
  avatarUrl: string
  overallScore: number
  mashupCount: number
  totalPlays: number
  recentGrowth: string
  topGenre: string
}

interface EmergingCreatorsProps {
  className?: string
}

export function EmergingCreators({ className }: EmergingCreatorsProps) {
  const [creators, setCreators] = useState<EmergingCreator[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/discovery/emerging?limit=5")
        if (response.ok) {
          const data = (await response.json()) as { creators: EmergingCreator[] }
          setCreators(data.creators)
        }
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Rising Creators</h3>
        <Badge variant="secondary" className="text-[9px]">AI Discovered</Badge>
      </div>

      {creators.map((creator) => (
        <Link
          key={creator.id}
          href={`/profile/${creator.username}`}
          className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-3 py-2.5 hover:border-primary/30 transition-colors group"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={creator.avatarUrl} alt={creator.displayName} />
            <AvatarFallback>{creator.displayName.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
              {creator.displayName}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {creator.mashupCount} mashups · {creator.topGenre}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="flex items-center gap-0.5 text-xs font-medium text-primary">
              <TrendingUp className="h-3 w-3" />
              {creator.recentGrowth}
            </span>
            <p className="text-[10px] text-muted-foreground">{creator.totalPlays.toLocaleString()} plays</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
