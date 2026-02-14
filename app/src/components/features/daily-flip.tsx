"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Flame, Trophy, Clock, Share2, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DailyFlipProps {
  className?: string
}

const MOCK_DAILY_STEMS = [
  { id: 1, name: "Motown Vocals", type: "Vocal", color: "bg-pink-500", bpm: 110, key: "Am" },
  { id: 2, name: "Trap Hi-Hats", type: "Drums", color: "bg-yellow-500", bpm: 140, key: "-" },
  { id: 3, name: "Ambient Pad", type: "Synth", color: "bg-blue-500", bpm: 90, key: "C" },
]

export function DailyFlip({ className }: DailyFlipProps) {
  const [isPlaying, setIsPlaying] = useState<number | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // Mock audio player
  const togglePlay = (id: number) => {
    if (isPlaying === id) {
      setIsPlaying(null)
    } else {
      setIsPlaying(id)
    }
  }

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState(29600) // Start with ~8 hours in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <Card className={cn("overflow-hidden border-2 border-primary/20", className)}>
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
            <Flame className="w-3 h-3 mr-1 text-orange-300" />
            Daily Flip #42
          </Badge>
          <div className="flex items-center text-sm font-medium opacity-90">
            <Clock className="w-4 h-4 mr-1.5" />
            {formatTime(timeLeft)} left
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">Motown × Trap</h2>
        <p className="text-indigo-100 mb-6 max-w-md text-sm">
          Create a banger using today's 3 stems.
          Use at least 10s of each. Wildcards allowed.
        </p>

        <div className="grid gap-3 mb-6">
          {MOCK_DAILY_STEMS.map((stem) => (
            <div
              key={stem.id}
              className="group flex items-center bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-colors cursor-pointer"
              onClick={() => togglePlay(stem.id)}
            >
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mr-4 shadow-lg", stem.color)}>
                {isPlaying === stem.id ? (
                  <Pause className="w-4 h-4 text-white fill-current" />
                ) : (
                  <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{stem.name}</div>
                <div className="text-xs text-indigo-200">{stem.bpm} BPM • {stem.key}</div>
              </div>
              <Badge variant="outline" className="border-white/20 text-white text-[10px] uppercase tracking-wider">
                {stem.type}
              </Badge>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button size="lg" className="flex-1 bg-white text-indigo-600 hover:bg-indigo-50 font-bold border-0 shadow-xl">
            Start Flipping
          </Button>
          <Button size="icon" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {hasSubmitted ? (
        <div className="bg-zinc-900 p-6 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Flip Submitted!</h3>
          <p className="text-zinc-400 text-sm mb-4">You're currently ranked #84</p>
          <Button variant="outline" className="w-full">View Leaderboard</Button>
        </div>
      ) : (
        <div className="bg-zinc-950 p-4 border-t border-zinc-800">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>2,841 producers flipping right now</span>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-950 ring-2 ring-zinc-950" />
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
