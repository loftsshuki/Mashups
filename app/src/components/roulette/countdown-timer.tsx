"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"

interface CountdownTimerProps {
  durationSeconds: number
  isRunning: boolean
  onComplete: () => void
  className?: string
}

export function CountdownTimer({ durationSeconds, isRunning, onComplete, className }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setRemaining(durationSeconds)
  }, [durationSeconds])

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, onComplete])

  const progress = remaining / durationSeconds
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60

  const circumference = 2 * Math.PI * 45
  const offset = circumference * (1 - progress)

  const urgency = progress < 0.2 ? "text-red-500" : progress < 0.5 ? "text-amber-500" : "text-primary"

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative h-28 w-28">
        <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted/30"
          />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("transition-all duration-1000", urgency)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-2xl font-bold tabular-nums", urgency)}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
      {isRunning && remaining > 0 && (
        <p className="text-xs text-muted-foreground">Time remaining</p>
      )}
      {remaining === 0 && (
        <p className="text-xs font-medium text-red-500">Time&apos;s up!</p>
      )}
    </div>
  )
}
