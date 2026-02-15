"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Dices, Play, ArrowRight, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RouletteSpinner } from "@/components/roulette/roulette-spinner"
import { CountdownTimer } from "@/components/roulette/countdown-timer"

interface RouletteStem {
  id: string
  title: string
  instrument: string | null
  genre: string | null
  bpm: number | null
  key: string | null
  audio_url: string
  duration_ms: number | null
}

type Phase = "idle" | "spinning" | "ready" | "creating" | "done"

export default function RoulettePage() {
  const [phase, setPhase] = useState<Phase>("idle")
  const [stems, setStems] = useState<RouletteStem[]>([])
  const [timerRunning, setTimerRunning] = useState(false)

  const handleSpin = useCallback(async () => {
    setPhase("spinning")
    setStems([])

    try {
      const response = await fetch("/api/roulette/spin", { method: "POST" })
      if (!response.ok) {
        setPhase("idle")
        return
      }
      const data = (await response.json()) as { stems: RouletteStem[] }
      setStems(data.stems)
    } catch {
      setPhase("idle")
    }
  }, [])

  const handleSpinComplete = useCallback(() => {
    setPhase("ready")
  }, [])

  const handleStartCreating = useCallback(() => {
    setPhase("creating")
    setTimerRunning(true)
  }, [])

  const handleTimerComplete = useCallback(() => {
    setTimerRunning(false)
    setPhase("done")
  }, [])

  const createUrl = stems.length > 0
    ? `/create?remix=roulette&stems=${stems.map((s) => s.id).join(",")}`
    : "/create"

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Dices className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Stem Roulette
        </h1>
        <p className="mt-2 text-muted-foreground">
          Spin for 3 random stems. Make something amazing in 5 minutes.
        </p>
      </div>

      {/* Spinner */}
      <div className="mb-8">
        <RouletteSpinner
          stems={stems}
          isSpinning={phase === "spinning"}
          onSpinComplete={handleSpinComplete}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4">
        {phase === "idle" && (
          <Button size="lg" onClick={handleSpin} className="px-8">
            <Dices className="mr-2 h-5 w-5" />
            Spin the Wheel
          </Button>
        )}

        {phase === "spinning" && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Selecting your stems...
          </p>
        )}

        {phase === "ready" && (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Your 3 stems are ready. You have 5 minutes. Go!
            </p>
            <div className="flex gap-3 justify-center">
              <Button size="lg" onClick={handleStartCreating}>
                <Timer className="mr-2 h-5 w-5" />
                Start the Clock
              </Button>
              <Button size="lg" variant="outline" onClick={handleSpin}>
                <Dices className="mr-2 h-5 w-5" />
                Re-spin
              </Button>
            </div>
          </div>
        )}

        {phase === "creating" && (
          <div className="text-center space-y-6">
            <CountdownTimer
              durationSeconds={300}
              isRunning={timerRunning}
              onComplete={handleTimerComplete}
            />
            <Link href={createUrl}>
              <Button size="lg">
                <Play className="mr-2 h-5 w-5" />
                Open in DAW
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {phase === "done" && (
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-foreground">
              Time&apos;s up!
            </p>
            <p className="text-sm text-muted-foreground">
              Publish what you&apos;ve got, or keep polishing — the roulette spirit lives on.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href={createUrl}>
                <Button>Finish & Publish</Button>
              </Link>
              <Button variant="outline" onClick={() => {
                setPhase("idle")
                setStems([])
              }}>
                Play Again
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-16 rounded-xl border border-border/50 bg-card/50 p-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">How it works</h2>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>Hit &ldquo;Spin the Wheel&rdquo; to get 3 random stems</li>
          <li>Start the 5-minute timer when you&apos;re ready</li>
          <li>Open the DAW and create something with your stems</li>
          <li>Publish your creation when the timer runs out</li>
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">
          Roulette mashups get a special tag on the platform. Constraints breed creativity.
        </p>
      </div>
    </div>
  )
}
