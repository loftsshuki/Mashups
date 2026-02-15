"use client"

import { useEffect, useState } from "react"
import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CreativeStreak } from "@/lib/data/types"

interface CreativeStreakProps {
  username: string
  className?: string
}

export function CreativeStreakCard({ username, className }: CreativeStreakProps) {
  const [streak, setStreak] = useState<CreativeStreak | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadStreak() {
      try {
        const response = await fetch(`/api/streaks?username=${encodeURIComponent(username)}`)
        if (!response.ok) return
        const data = (await response.json()) as { streak: CreativeStreak | null }
        if (!cancelled) setStreak(data.streak)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadStreak()
    return () => { cancelled = true }
  }, [username])

  if (loading) {
    return (
      <div className={cn("rounded-xl border border-border/70 bg-card/70 p-4 animate-pulse", className)}>
        <div className="h-16 bg-muted rounded" />
      </div>
    )
  }

  if (!streak) return null

  // Generate contribution grid (last 12 weeks)
  const weeks = streak.streak_history.slice(0, 12).reverse()
  const maxCount = Math.max(...weeks.map((w) => w.mashup_count), 1)

  return (
    <div className={cn("rounded-xl border border-border/70 bg-card/70 p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h3 className="text-sm font-semibold text-foreground">Creative Streak</h3>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">{streak.current_weekly_streak}</span>
          <span className="text-xs text-muted-foreground">weeks</span>
        </div>
      </div>

      {streak.current_weekly_streak > 0 && (
        <p className="text-xs text-muted-foreground">
          Created something every week for {streak.current_weekly_streak} week{streak.current_weekly_streak !== 1 ? "s" : ""} straight.
          {streak.longest_weekly_streak > streak.current_weekly_streak && (
            <> Personal best: {streak.longest_weekly_streak} weeks.</>
          )}
        </p>
      )}

      {/* Contribution grid */}
      {weeks.length > 0 && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {weeks.map((week) => {
              const intensity = week.mashup_count / maxCount
              return (
                <div
                  key={week.week}
                  className="flex-1 h-6 rounded-sm transition-colors"
                  style={{
                    backgroundColor: intensity > 0
                      ? `rgba(34, 197, 94, ${0.15 + intensity * 0.7})`
                      : "rgba(255, 255, 255, 0.05)",
                  }}
                  title={`${week.week}: ${week.mashup_count} mashup${week.mashup_count !== 1 ? "s" : ""}`}
                />
              )
            })}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{weeks[0]?.week}</span>
            <span>{weeks[weeks.length - 1]?.week}</span>
          </div>
        </div>
      )}
    </div>
  )
}
