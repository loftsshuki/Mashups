"use client"

import { useState } from "react"
import Link from "next/link"
import { Play, Pause, Timer, ArrowRight, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChallengeStem {
  id: string
  title: string
  instrument: string
  audioUrl?: string
}

interface ChallengeWorkspaceProps {
  challengeId: string
  challengeTitle: string
  stems: ChallengeStem[]
  timeLimit?: number // minutes
  className?: string
}

export function ChallengeWorkspace({
  challengeId,
  challengeTitle,
  stems,
  timeLimit,
  className,
}: ChallengeWorkspaceProps) {
  const [playingId, setPlayingId] = useState<string | null>(null)

  const stemIds = stems.map((s) => s.id).join(",")
  const createUrl = `/create?challenge=${challengeId}&stems=${stemIds}`

  return (
    <div className={cn("rounded-xl border border-border/70 bg-card/70 p-5 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Challenge Stems</h3>
        {timeLimit && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Timer className="h-3.5 w-3.5" />
            {timeLimit} min limit
          </div>
        )}
      </div>

      {/* Stem previews */}
      <div className="space-y-2">
        {stems.map((stem) => {
          const isPlaying = playingId === stem.id
          const instrumentColors: Record<string, string> = {
            vocal: "bg-pink-500/20 text-pink-400",
            vocals: "bg-pink-500/20 text-pink-400",
            drums: "bg-amber-500/20 text-amber-400",
            bass: "bg-emerald-500/20 text-emerald-400",
            synth: "bg-violet-500/20 text-violet-400",
            guitar: "bg-red-500/20 text-red-400",
            other: "bg-slate-500/20 text-slate-400",
          }
          const colorClass = instrumentColors[stem.instrument] ?? instrumentColors.other

          return (
            <div
              key={stem.id}
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/50 px-3 py-2"
            >
              <button
                onClick={() => setPlayingId(isPlaying ? null : stem.id)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors shrink-0"
              >
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5 ml-0.5" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{stem.title}</p>
              </div>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", colorClass)}>
                {stem.instrument}
              </span>
            </div>
          )
        })}
      </div>

      {/* Action */}
      <Link href={createUrl}>
        <Button className="w-full">
          <Trophy className="mr-2 h-4 w-4" />
          Enter Challenge
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}
