"use client"

import { useState, useEffect } from "react"
import { Play, Pause, Clock, ArrowRight, Music2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
// Use existing mock logic from battles but customized
// In a real app, this would fetch from API

interface Stem {
    id: number
    name: string
    type: string
    color: string
    bpm: number
    key: string
    icon: any
}

const DAILY_STEMS: Stem[] = [
    { id: 1, name: "Motown Vocals (1968)", type: "Vocal", color: "bg-pink-500/20 text-pink-400 border-pink-500/50", bpm: 110, key: "Am", icon: Music2 },
    { id: 2, name: "Atlanta Trap Hi-Hats", type: "Drums", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50", bpm: 140, key: "-", icon: Music2 },
    { id: 3, name: "Blade Runner Pad", type: "Synth", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50", bpm: 90, key: "C", icon: Music2 },
]

export function DailyChallengeHero() {
    const [timeLeft, setTimeLeft] = useState(25400) // ~7 hours
    const [isPlaying, setIsPlaying] = useState<number | null>(null)

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    }

    const togglePlay = (id: number) => {
        setIsPlaying(isPlaying === id ? null : id)
    }

    return (
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-8 md:p-12">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl opacity-50" />

            <div className="relative z-10 grid gap-12 md:grid-cols-2">
                {/* Left Column: Info */}
                <div className="flex flex-col justify-center space-y-6">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-primary/50 text-primary uppercase tracking-widest px-3 py-1 bg-primary/10">
                            Daily Flip #42
                        </Badge>
                        <div className="flex items-center text-sm font-mono text-muted-foreground">
                            <Clock className="mr-1.5 h-4 w-4 text-primary" />
                            <span className="text-primary font-bold">{formatTime(timeLeft)}</span>
                            <span className="ml-1">remaining</span>
                        </div>
                    </div>

                    <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">
                        Motown Meets <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
                            Future Trap
                        </span>
                    </h1>

                    <p className="text-lg text-muted-foreground max-w-md">
                        Today's challenge: Blend a 1968 soul vocal with modern trap drums.
                        Use at least 30s of each stem.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <Button size="lg" className="h-14 rounded-full px-8 text-lg font-bold shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
                            Start Flipping
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 rounded-full px-8 bg-transparent">
                            How it works
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>1,204 producers participating right now</span>
                    </div>
                </div>

                {/* Right Column: Stems */}
                <div className="flex flex-col justify-center">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-2">
                            <span>Todays Stems</span>
                            <span>BPM / Key</span>
                        </div>
                        {DAILY_STEMS.map((stem) => (
                            <Card
                                key={stem.id}
                                className={cn(
                                    "group relative overflow-hidden border transition-all duration-300 hover:border-white/20 hover:bg-white/5 cursor-pointer",
                                    stem.color
                                )}
                                onClick={() => togglePlay(stem.id)}
                            >
                                <div className="flex items-center p-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm mr-4 group-hover:bg-white/20 transition-colors">
                                        {isPlaying === stem.id ? (
                                            <Pause className="h-5 w-5 fill-current" />
                                        ) : (
                                            <Play className="h-5 w-5 fill-current ml-0.5" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold truncate text-white text-lg">{stem.name}</h3>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Badge variant="secondary" className="bg-black/20 text-white/70 border-0 text-[10px]">{stem.type}</Badge>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs font-mono opacity-70">
                                        <div>{stem.bpm} BPM</div>
                                        <div>{stem.key}</div>
                                    </div>
                                </div>
                                {/* Audio Waveform Visualization Mock */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                                    {isPlaying === stem.id && (
                                        <Progress value={45} className="h-full bg-white/50 rounded-none w-full animate-in fade-in" />
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-8 rounded-xl bg-black/40 p-4 border border-white/5 backdrop-blur-sm text-center">
                        <p className="text-sm text-muted-foreground">
                            "This vocal chop is insane. Whoever flips this best wins the month."
                        </p>
                        <div className="mt-2 flex items-center justify-center gap-2 text-xs font-bold text-white">
                            <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
                            @skrillex_official
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
