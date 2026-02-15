"use client"

import { cn } from "@/lib/utils"

interface CollectiveProgressProps {
  current: number
  goal: number
  label: string
  className?: string
}

export function CollectiveProgress({ current, goal, label, className }: CollectiveProgressProps) {
  const percentage = Math.min((current / goal) * 100, 100)

  function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`
    return n.toLocaleString()
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">
          {formatNumber(current)} / {formatNumber(goal)}
        </span>
      </div>
      <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground text-right">
        {percentage.toFixed(1)}% complete
      </p>
    </div>
  )
}
