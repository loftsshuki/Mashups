"use client"

import { useState } from "react"
import type { Comment } from "@/lib/data/types"

interface TimestampCommentMarkersProps {
  comments: Comment[]
  duration: number
  onMarkerClick?: (timestampSec: number) => void
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function TimestampCommentMarkers({
  comments,
  duration,
  onMarkerClick,
}: TimestampCommentMarkersProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!duration || !comments.length) return null

  return (
    <div className="pointer-events-none absolute inset-0">
      {comments.map((comment, i) => {
        const sec = comment.timestamp_sec ?? 0
        const position = (sec / duration) * 100
        if (position < 0 || position > 100) return null

        const displayName =
          comment.user?.display_name || comment.user?.username || "Anonymous"

        return (
          <div
            key={comment.id}
            className="pointer-events-auto absolute top-0 -translate-x-1/2"
            style={{ left: `${position}%` }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onMarkerClick?.(sec)}
          >
            {/* Marker dot */}
            <button
              className="flex h-3 w-3 items-center justify-center rounded-full bg-primary/80 transition-transform hover:scale-150"
              aria-label={`Comment at ${formatTime(sec)}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
            </button>

            {/* Tooltip on hover */}
            {hoveredIndex === i && (
              <div className="absolute bottom-full left-1/2 z-30 mb-2 w-48 -translate-x-1/2 rounded-lg border border-border bg-popover p-2 shadow-lg">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {displayName}
                  </span>
                  <span>at {formatTime(sec)}</span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs text-foreground/80">
                  {comment.content}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
