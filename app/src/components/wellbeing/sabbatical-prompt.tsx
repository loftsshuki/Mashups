"use client"

import { useState } from "react"
import { Heart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SabbaticalPromptProps {
  consecutiveDays: number
  className?: string
}

export function SabbaticalPrompt({ consecutiveDays, className }: SabbaticalPromptProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || consecutiveDays < 30) return null

  return (
    <div className={cn(
      "relative rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-5",
      className
    )}>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 shrink-0">
          <Heart className="h-5 w-5 text-amber-500" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            You&apos;ve been creating for {consecutiveDays} days straight
          </p>
          <p className="text-xs text-muted-foreground">
            Your best ideas come after rest. Consider taking a 3-day creative sabbatical —
            your community will be here when you return.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDismissed(true)}
            >
              I&apos;ll keep going
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-amber-500 hover:text-amber-400"
              onClick={() => setDismissed(true)}
            >
              Good idea, taking a break
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
