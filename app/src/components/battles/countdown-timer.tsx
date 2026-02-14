"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface CountdownTimerProps {
  targetDate: string
  className?: string
  size?: "sm" | "md" | "lg"
  showLabels?: boolean
  onComplete?: () => void
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(targetDate: string): TimeLeft | null {
  const difference = new Date(targetDate).getTime() - new Date().getTime()
  
  if (difference <= 0) {
    return null
  }
  
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

function formatNumber(num: number): string {
  return num.toString().padStart(2, "0")
}

export function CountdownTimer({
  targetDate,
  className,
  size = "md",
  showLabels = true,
  onComplete,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft(targetDate))
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft(targetDate)
      setTimeLeft(remaining)
      
      if (!remaining && onComplete) {
        onComplete()
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [targetDate, onComplete])
  
  if (!isClient) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="animate-pulse bg-muted rounded" />
      </div>
    )
  }
  
  if (!timeLeft) {
    return (
      <div className={cn("text-center font-bold text-muted-foreground", className)}>
        Time&apos;s up!
      </div>
    )
  }
  
  const sizeClasses = {
    sm: {
      container: "gap-1",
      box: "min-w-[32px] px-1.5 py-1",
      number: "text-sm",
      label: "text-[8px]",
      separator: "text-sm",
    },
    md: {
      container: "gap-2",
      box: "min-w-[48px] px-2 py-2",
      number: "text-xl",
      label: "text-[10px]",
      separator: "text-xl",
    },
    lg: {
      container: "gap-3",
      box: "min-w-[64px] px-3 py-3",
      number: "text-3xl",
      label: "text-xs",
      separator: "text-3xl",
    },
  }
  
  const sizes = sizeClasses[size]
  
  const timeUnits = [
    { value: timeLeft.days, label: "Days", show: timeLeft.days > 0 || size === "lg" },
    { value: timeLeft.hours, label: "Hrs", show: true },
    { value: timeLeft.minutes, label: "Min", show: true },
    { value: timeLeft.seconds, label: "Sec", show: true },
  ].filter(unit => unit.show)
  
  return (
    <div className={cn("flex items-center justify-center", sizes.container, className)}>
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex items-center">
          <div
            className={cn(
              "flex flex-col items-center rounded-lg bg-muted border border-border",
              sizes.box
            )}
          >
            <span className={cn("font-bold tabular-nums", sizes.number)}>
              {formatNumber(unit.value)}
            </span>
            {showLabels && (
              <span className={cn("text-muted-foreground uppercase tracking-wider", sizes.label)}>
                {unit.label}
              </span>
            )}
          </div>
          {index < timeUnits.length - 1 && (
            <span className={cn("mx-1 font-bold text-muted-foreground", sizes.separator)}>
              :
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

// Compact version for cards
export function CountdownCompact({
  targetDate,
  className,
  prefix = "Ends in",
}: {
  targetDate: string
  className?: string
  prefix?: string
}) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft(targetDate))
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 60000) // Update every minute for compact version
    
    return () => clearInterval(timer)
  }, [targetDate])
  
  if (!isClient || !timeLeft) {
    return <span className={cn("text-xs text-muted-foreground", className)}>{prefix} --</span>
  }
  
  let timeString = ""
  if (timeLeft.days > 0) {
    timeString = `${timeLeft.days}d ${timeLeft.hours}h`
  } else if (timeLeft.hours > 0) {
    timeString = `${timeLeft.hours}h ${timeLeft.minutes}m`
  } else {
    timeString = `${timeLeft.minutes}m`
  }
  
  return (
    <span className={cn("text-xs tabular-nums", className)}>
      {prefix} <span className="font-medium">{timeString}</span>
    </span>
  )
}
