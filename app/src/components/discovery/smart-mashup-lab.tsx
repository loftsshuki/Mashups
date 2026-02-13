"use client"

import { Sparkles, GitBranch } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAudio } from "@/lib/audio/audio-context"
import type { Track } from "@/lib/audio/types"
import { mockMashups } from "@/lib/mock-data"
import { getSmartMashupPairs } from "@/lib/smart-mashups"

function toTrack(
  id: string,
  title: string,
  artist: string,
  audioUrl: string,
  coverUrl: string,
  duration: number,
): Track {
  return { id, title, artist, audioUrl, coverUrl, duration }
}

export function SmartMashupLab() {
  const { playTrack } = useAudio()
  const pairs = getSmartMashupPairs(mockMashups, 4)

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <Sparkles className="size-7 text-primary" />
          <div>
            <h2 className="text-3xl font-bold">Smart Mashup Lab</h2>
            <p className="text-sm text-muted-foreground">
              Auto-picked pairs with compatible tempo and style
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {pairs.map((pair) => {
            const queue: Track[] = [
              toTrack(
                pair.left.id,
                pair.left.title,
                pair.left.creator.displayName,
                pair.left.audioUrl,
                pair.left.coverUrl,
                pair.left.duration,
              ),
              toTrack(
                pair.right.id,
                pair.right.title,
                pair.right.creator.displayName,
                pair.right.audioUrl,
                pair.right.coverUrl,
                pair.right.duration,
              ),
            ]

            return (
              <Card key={pair.id} className="border-border/60">
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary" className="font-medium">
                      Match {(pair.score * 100).toFixed(0)}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">{pair.reason}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-foreground">{pair.left.title}</span>
                    <GitBranch className="size-3.5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{pair.right.title}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {pair.left.genre} • {pair.left.bpm} BPM
                    </span>
                    <span>
                      {pair.right.genre} • {pair.right.bpm} BPM
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => playTrack(queue[0], queue)}
                  >
                    Queue Pair
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
