"use client"

import { useState } from "react"
import { Play, Pause, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChainLink {
  id: string
  position: number
  creatorName: string
  creatorAvatar: string
  mashupId: string
  audioUrl: string
  changedElement: string
  createdAt: string
}

interface ChainTimelineProps {
  links: ChainLink[]
  maxLinks: number
  className?: string
}

export function ChainTimeline({ links, maxLinks, className }: ChainTimelineProps) {
  const [playingId, setPlayingId] = useState<string | null>(null)

  const emptySlots = maxLinks - links.length

  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-4 min-w-max">
          {links.map((link, i) => {
            const isPlaying = playingId === link.id

            return (
              <div key={link.id} className="flex items-center gap-3">
                {/* Link card */}
                <div className="w-48 rounded-xl border border-border/70 bg-card/70 p-4 space-y-3 shrink-0">
                  {/* Creator */}
                  <div className="flex items-center gap-2">
                    <img
                      src={link.creatorAvatar}
                      alt={link.creatorName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-medium text-foreground">@{link.creatorName}</p>
                      <p className="text-[10px] text-muted-foreground">Link #{link.position + 1}</p>
                    </div>
                  </div>

                  {/* Change description */}
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {link.changedElement}
                  </p>

                  {/* Play button */}
                  <button
                    onClick={() => setPlayingId(isPlaying ? null : link.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-3.5 w-3.5" />
                    ) : (
                      <Play className="h-3.5 w-3.5 ml-0.5" />
                    )}
                    {isPlaying ? "Pause" : "Listen"}
                  </button>
                </div>

                {/* Arrow connector */}
                {i < links.length - 1 && (
                  <div className="text-muted-foreground/50 text-lg shrink-0">→</div>
                )}
              </div>
            )
          })}

          {/* Empty slots */}
          {emptySlots > 0 && (
            <>
              {links.length > 0 && (
                <div className="text-muted-foreground/50 text-lg flex items-center shrink-0">→</div>
              )}
              {/* Next available slot */}
              <div className="w-48 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 flex flex-col items-center justify-center gap-2 shrink-0">
                <Plus className="h-6 w-6 text-primary" />
                <p className="text-xs font-medium text-primary">Your Turn</p>
                <p className="text-[10px] text-muted-foreground">Add the next link</p>
              </div>

              {/* Remaining empty slots */}
              {Array.from({ length: emptySlots - 1 }, (_, i) => (
                <div key={`empty-${i}`} className="flex items-center gap-3">
                  <div className="text-muted-foreground/30 text-lg shrink-0">→</div>
                  <div className="w-48 rounded-xl border border-dashed border-border/30 bg-muted/10 p-4 flex items-center justify-center shrink-0">
                    <p className="text-[10px] text-muted-foreground">Slot {links.length + i + 2}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
