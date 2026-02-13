"use client"

import { X, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface UploadedTrack {
  file: File
  name: string
  size: number
  uploadProgress: number // 0-100, 100 = done
  uploadedUrl?: string // URL after upload completes
  duration?: number
}

interface TrackListProps {
  tracks: UploadedTrack[]
  onRemove: (index: number) => void
  onReorder?: (from: number, to: number) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function TrackList({ tracks, onRemove }: TrackListProps) {
  if (tracks.length === 0) return null

  return (
    <div className="space-y-2">
      {tracks.map((track, index) => (
        <div
          key={`${track.name}-${index}`}
          className="group flex items-center gap-3 rounded-lg border border-border/50 bg-card px-4 py-3 transition-colors hover:bg-accent/50"
        >
          {/* Track number */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {index + 1}
          </div>

          {/* Track icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <Music className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Track info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {track.name}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatFileSize(track.size)}</span>
              {track.duration !== undefined && track.duration > 0 && (
                <>
                  <span className="text-border">|</span>
                  <span>{formatDuration(track.duration)}</span>
                </>
              )}
            </div>

            {/* Upload progress bar */}
            {track.uploadProgress < 100 && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      track.uploadProgress < 100
                        ? "bg-primary animate-pulse"
                        : "bg-primary"
                    )}
                    style={{ width: `${track.uploadProgress}%` }}
                  />
                </div>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {track.uploadProgress}%
                </span>
              </div>
            )}
          </div>

          {/* Upload status */}
          {track.uploadProgress === 100 && (
            <span className="shrink-0 text-xs font-medium text-emerald-500">
              Uploaded
            </span>
          )}

          {/* Remove button */}
          <Button
            variant="ghost"
            size="icon-xs"
            className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => onRemove(index)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove track</span>
          </Button>
        </div>
      ))}
    </div>
  )
}
