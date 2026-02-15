"use client"

import { useEffect, useState } from "react"
import { Headphones, BarChart3, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ABPlayer } from "@/components/blind-test/ab-player"

interface BlindTestPair {
  id: string
  trackA: { audioUrl: string; label: string }
  trackB: { audioUrl: string; label: string }
  answer?: {
    original: string
    mashup: string
    mashupCreator: string
    mashupTitle: string
    originalTitle: string
  }
}

export default function BlindTestPage() {
  const [pair, setPair] = useState<BlindTestPair | null>(null)
  const [communityStats, setCommunityStats] = useState({ mashupPreferred: 0, totalVotes: 0 })
  const [voted, setVoted] = useState(false)
  const [userChoice, setUserChoice] = useState<"A" | "B" | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadPair() {
    setLoading(true)
    setVoted(false)
    setUserChoice(null)
    try {
      const response = await fetch("/api/blind-test")
      if (response.ok) {
        const data = (await response.json()) as { pair: BlindTestPair; communityStats: typeof communityStats }
        setPair(data.pair)
        setCommunityStats(data.communityStats)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPair()
  }, [])

  async function handleVote(choice: "A" | "B") {
    setUserChoice(choice)
    setVoted(true)
    // Fetch the reveal
    if (pair) {
      const response = await fetch(`/api/blind-test?reveal=true`)
      if (response.ok) {
        const data = (await response.json()) as { pair: BlindTestPair }
        setPair(data.pair)
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Headphones className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Blind Test
        </h1>
        <p className="text-muted-foreground">
          Can you tell the original from the mashup? Listen, vote, and find out.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">Loading test pair...</p>
        </div>
      ) : pair ? (
        <div className="space-y-6">
          <ABPlayer
            trackA={pair.trackA}
            trackB={pair.trackB}
            onVote={handleVote}
            voted={voted}
          />

          {/* Reveal */}
          {voted && pair.answer && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-center">
              <h3 className="text-sm font-semibold text-foreground">
                {userChoice === pair.answer.mashup ? "You preferred the mashup!" : "You preferred the original!"}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-border/50 bg-card/50 p-3">
                  <p className="font-medium text-foreground">Track {pair.answer.original}</p>
                  <p className="text-muted-foreground">Original</p>
                  <p className="text-muted-foreground mt-1">{pair.answer.originalTitle}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-card/50 p-3">
                  <p className="font-medium text-foreground">Track {pair.answer.mashup}</p>
                  <p className="text-primary">Mashup</p>
                  <p className="text-muted-foreground mt-1">{pair.answer.mashupTitle}</p>
                  <p className="text-[10px] text-muted-foreground">by {pair.answer.mashupCreator}</p>
                </div>
              </div>

              <Button size="sm" variant="outline" onClick={loadPair}>
                <RefreshCw className="mr-2 h-3 w-3" />
                Try Another
              </Button>
            </div>
          )}

          {/* Community stats */}
          <div className="rounded-lg border border-border/50 bg-card/50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Community Results</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                Mashups preferred {communityStats.mashupPreferred}% of the time
              </p>
              <p className="text-[10px] text-muted-foreground">{communityStats.totalVotes.toLocaleString()} total votes</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No test pairs available.</p>
        </div>
      )}
    </div>
  )
}
