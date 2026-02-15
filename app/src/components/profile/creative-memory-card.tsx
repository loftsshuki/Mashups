"use client"

import { useEffect, useState } from "react"
import { Brain, Music, Clock, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CreativeProfile } from "@/lib/data/creative-profile"

interface CreativeMemoryCardProps {
  username: string
  className?: string
}

export function CreativeMemoryCard({ username, className }: CreativeMemoryCardProps) {
  const [profile, setProfile] = useState<CreativeProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetch(`/api/profile/creative-memory?username=${encodeURIComponent(username)}`)
        if (!response.ok) return
        const data = (await response.json()) as { profile: CreativeProfile }
        if (!cancelled) setProfile(data.profile)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [username])

  if (loading) {
    return (
      <div className={cn("rounded-xl border border-border/70 bg-card/70 p-4 animate-pulse", className)}>
        <div className="h-32 bg-muted rounded" />
      </div>
    )
  }

  if (!profile) return null

  const maxHourCount = Math.max(...profile.productiveHours.map((h) => h.count), 1)

  return (
    <div className={cn("rounded-xl border border-border/70 bg-card/70 p-5 space-y-5", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Creative Memory</h3>
        </div>
        <span className="text-xs font-bold text-primary">{profile.archetype}</span>
      </div>

      {/* Genre radar (simplified as bars) */}
      <div className="space-y-2">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Top Genres</p>
        {profile.topGenres.slice(0, 5).map((g) => (
          <div key={g.genre} className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-16 truncate">{g.genre}</span>
            <div className="flex-1 h-2 bg-muted/30 rounded-full">
              <div
                className="h-full rounded-full bg-primary/60"
                style={{ width: `${g.percentage}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground w-6 text-right">{g.percentage}%</span>
          </div>
        ))}
      </div>

      {/* Productive hours heatmap */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Most Productive Hours</p>
        <div className="flex gap-[2px]">
          {profile.productiveHours.map((h) => (
            <div
              key={h.hour}
              className="flex-1 h-5 rounded-sm"
              style={{
                backgroundColor: h.count > 0
                  ? `rgba(99, 102, 241, ${0.1 + (h.count / maxHourCount) * 0.8})`
                  : "rgba(255,255,255,0.03)",
              }}
              title={`${h.hour}:00 — ${h.count} creations`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>12am</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-lg font-bold text-foreground">{profile.totalMashups}</p>
          <p className="text-[10px] text-muted-foreground">Mashups</p>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{profile.bpmRange.average}</p>
          <p className="text-[10px] text-muted-foreground">Avg BPM</p>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{profile.collabRate}%</p>
          <p className="text-[10px] text-muted-foreground">Collab Rate</p>
        </div>
      </div>

      {/* Signature sounds */}
      <div className="flex flex-wrap gap-1.5">
        {profile.topInstruments.slice(0, 4).map((inst) => (
          <span
            key={inst.instrument}
            className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary capitalize"
          >
            {inst.instrument}
          </span>
        ))}
      </div>
    </div>
  )
}
