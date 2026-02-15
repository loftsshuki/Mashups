"use client"

import { X, Clock, Music, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProvenanceData {
  stemId: string
  stemTitle: string
  creator: string
  createdAt: string
  instrument: string
  mashups: { title: string; plays: number; creator: string }[]
  genreDistribution: { genre: string; percentage: number }[]
  totalPlays: number
  usageCount: number
}

interface ProvenancePanelProps {
  data: ProvenanceData
  onClose: () => void
  className?: string
}

export function ProvenancePanel({ data, onClose, className }: ProvenancePanelProps) {
  const isLegendary = data.usageCount >= 50 && data.totalPlays >= 100000

  return (
    <div className={cn("rounded-xl border border-border/70 bg-card p-5 space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{data.stemTitle}</h3>
          <p className="text-xs text-muted-foreground">by {data.creator}</p>
        </div>
        <div className="flex items-center gap-2">
          {isLegendary && <Badge>Legendary</Badge>}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* History */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Created {new Date(data.createdAt).toLocaleDateString()}</span>
        <span>·</span>
        <span>{data.instrument}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5 text-center">
          <p className="text-lg font-bold text-foreground">{data.usageCount}</p>
          <p className="text-[10px] text-muted-foreground">mashups</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5 text-center">
          <p className="text-lg font-bold text-foreground">{data.totalPlays.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">total plays</p>
        </div>
      </div>

      {/* Genre distribution */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <BarChart3 className="h-3 w-3 text-muted-foreground" />
          <p className="text-xs font-medium text-foreground">Genre Distribution</p>
        </div>
        <div className="space-y-1">
          {data.genreDistribution.map((g) => (
            <div key={g.genre} className="flex items-center gap-2 text-[10px]">
              <span className="w-16 text-muted-foreground">{g.genre}</span>
              <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/60"
                  style={{ width: `${g.percentage}%` }}
                />
              </div>
              <span className="text-muted-foreground w-8 text-right">{g.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mashups using this stem */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Music className="h-3 w-3 text-muted-foreground" />
          <p className="text-xs font-medium text-foreground">Used In ({data.mashups.length})</p>
        </div>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {data.mashups.map((m, i) => (
            <div key={i} className="flex items-center justify-between text-[10px] rounded px-2 py-1 hover:bg-muted/20">
              <div>
                <span className="text-foreground">{m.title}</span>
                <span className="text-muted-foreground ml-1">by {m.creator}</span>
              </div>
              <span className="text-muted-foreground">{m.plays.toLocaleString()} plays</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
