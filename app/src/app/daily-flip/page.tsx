"use client"

import { useState, useEffect } from "react"
import { Play, Pause, Flame, Trophy, Clock, Share2, Upload, Zap, Calendar, ChevronRight, Medal } from "lucide-react"
import { cn } from "@/lib/utils"
import { NeonPage, NeonHero, NeonSectionHeader, NeonGrid } from "@/components/marketing/neon-page"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { getTodaysFlip, getFlipLeaderboard, getFlipHistory, getFlipStats, getUserFlipStreak } from "@/lib/data/daily-flip"
import type { DailyFlip, DailyFlipEntry } from "@/lib/data/types"

function DailyFlipContent() {
  const [flip, setFlip] = useState<DailyFlip | null>(null)
  const [leaderboard, setLeaderboard] = useState<DailyFlipEntry[]>([])
  const [history, setHistory] = useState<DailyFlip[]>([])
  const [stats, setStats] = useState<{ entryCount: number; voteCount: number; topScore: number } | null>(null)
  const [streak, setStreak] = useState<{ currentStreak: number; longestStreak: number; totalFlips: number } | null>(null)
  const [isPlaying, setIsPlaying] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    async function load() {
      const todaysFlip = await getTodaysFlip()
      setFlip(todaysFlip)

      if (todaysFlip) {
        const [lb, st, sk, hi] = await Promise.all([
          getFlipLeaderboard(todaysFlip.id, 10),
          getFlipStats(todaysFlip.id),
          getUserFlipStreak("mock-user"),
          getFlipHistory(5),
        ])
        setLeaderboard(lb)
        setStats(st)
        setStreak(sk)
        setHistory(hi)

        // Calculate time remaining
        const remaining = Math.max(0, Math.floor((new Date(todaysFlip.ends_at).getTime() - Date.now()) / 1000))
        setTimeLeft(remaining)
      }
      setLoading(false)
    }
    load()
  }, [])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <NeonPage>
        <Skeleton className="h-64 rounded-xl" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </NeonPage>
    )
  }

  if (!flip) {
    return (
      <NeonPage>
        <NeonHero eyebrow="Daily Flip" title="No active challenge" description="Check back tomorrow for a new Daily Flip challenge!" />
      </NeonPage>
    )
  }

  return (
    <NeonPage>
      <NeonHero
        eyebrow={`Daily Flip #${flip.flip_number}`}
        title={flip.title}
        description={flip.description || "Create a banger using today's stems. Use at least 10s of each. Wildcards allowed."}
      />

      {/* Stats row */}
      <NeonGrid className="sm:grid-cols-4">
        <div className="neon-panel rounded-2xl p-4 text-center">
          <Clock className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-1 text-2xl font-semibold font-mono text-foreground">{formatTime(timeLeft)}</p>
          <p className="text-xs text-muted-foreground">Time Left</p>
        </div>
        <div className="neon-panel rounded-2xl p-4 text-center">
          <Upload className="mx-auto h-5 w-5 text-blue-500" />
          <p className="mt-1 text-2xl font-semibold text-foreground">{stats?.entryCount.toLocaleString() ?? 0}</p>
          <p className="text-xs text-muted-foreground">Entries</p>
        </div>
        <div className="neon-panel rounded-2xl p-4 text-center">
          <Flame className="mx-auto h-5 w-5 text-orange-500" />
          <p className="mt-1 text-2xl font-semibold text-foreground">{streak?.currentStreak ?? 0}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
        <div className="neon-panel rounded-2xl p-4 text-center">
          <Trophy className="mx-auto h-5 w-5 text-yellow-500" />
          <p className="mt-1 text-2xl font-semibold text-foreground">{streak?.totalFlips ?? 0}</p>
          <p className="text-xs text-muted-foreground">Total Flips</p>
        </div>
      </NeonGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Stems + Action */}
        <div className="lg:col-span-2 space-y-6">
          <NeonSectionHeader title="Today's Stems" description="Preview each stem, then start flipping" />

          <div className="space-y-3">
            {flip.stems.map((stem, i) => (
              <button
                key={i}
                onClick={() => setIsPlaying(isPlaying === i ? null : i)}
                className={cn(
                  "w-full flex items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors",
                  isPlaying === i
                    ? "border-primary bg-primary/5"
                    : "border-border/70 bg-background/50 hover:border-primary/30"
                )}
              >
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white", stem.color)}>
                  {isPlaying === i ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{stem.name}</p>
                  <p className="text-xs text-muted-foreground">{stem.bpm} BPM · {stem.key}</p>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                  {stem.type}
                </Badge>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button size="lg" className="flex-1 gap-2">
              <Zap className="h-5 w-5" /> Start Flipping
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Share2 className="h-5 w-5" /> Share
            </Button>
          </div>

          {/* Leaderboard */}
          <NeonSectionHeader title="Leaderboard" description="Top entries for today's flip" />
          <div className="space-y-1">
            {leaderboard.map((entry, i) => {
              const name = entry.user?.display_name || entry.user?.username || "Anonymous"
              const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
              return (
                <div key={entry.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent/50 transition-colors">
                  <span className={cn("w-6 text-center text-sm font-bold", i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-muted-foreground")}>
                    {i < 3 ? <Medal className="h-4 w-4 mx-auto" /> : i + 1}
                  </span>
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{entry.score}</p>
                    <p className="text-[10px] text-muted-foreground">{entry.vote_count} votes</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right column: History + Rules */}
        <div className="space-y-6">
          {flip.rules && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{flip.rules}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Past Flips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.map(past => (
                <div key={past.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">#{past.flip_number} {past.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(past.started_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Flame className="h-4 w-4" /> Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Streak</span>
                <span className="font-semibold">{streak?.currentStreak ?? 0} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Longest Streak</span>
                <span className="font-semibold">{streak?.longestStreak ?? 0} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Flips</span>
                <span className="font-semibold">{streak?.totalFlips ?? 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </NeonPage>
  )
}

export default function DailyFlipPage() {
  return (
    <AuthGuard>
      <DailyFlipContent />
    </AuthGuard>
  )
}
