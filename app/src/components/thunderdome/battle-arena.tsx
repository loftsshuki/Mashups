"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { LivePerformanceDeck } from "@/components/features/live-deck"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface BattleArenaProps {
    opponent: {
        username: string
        avatar: string
        rank: string
    }
    onEndGame: () => void
}

export function BattleArena({ opponent, onEndGame }: BattleArenaProps) {
    const [timeLeft, setTimeLeft] = useState(60) // 60 second battle for demo
    const [score, setScore] = useState(0)
    const [opponentScore, setOpponentScore] = useState(0)

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    onEndGame()
                    return 0
                }
                return prev - 1
            })

            // Simulate opponent score going up
            if (Math.random() > 0.7) {
                setOpponentScore(prev => prev + Math.floor(Math.random() * 50))
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [onEndGame])

    return (
        <div className="space-y-6">
            {/* HUD */}
            <div className="flex items-center justify-between bg-zinc-900/80 backdrop-blur border border-zinc-800 p-4 rounded-xl sticky top-20 z-40 shadow-lg">
                {/* Player Stats */}
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="font-bold text-lg">You</div>
                        <div className="text-2xl font-mono text-cyan-400">{score.toLocaleString()}</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/50" />
                </div>

                {/* Timer */}
                <div className="flex flex-col items-center w-64">
                    <div className="text-4xl font-black font-mono tracking-widest text-white">
                        00:{timeLeft.toString().padStart(2, '0')}
                    </div>
                    <Progress value={(timeLeft / 60) * 100} className="h-2 w-full mt-2 bg-zinc-800" indicatorClassName="bg-gradient-to-r from-green-500 to-red-500" />
                </div>

                {/* Opponent Stats */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/50 overflow-hidden">
                        <img src={opponent.avatar} alt={opponent.username} />
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-lg text-red-400">{opponent.username}</div>
                        <div className="text-2xl font-mono text-white">{opponentScore.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* The Deck - Now the "Weapon" */}
            <div className="relative border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_-20px_rgba(34,211,238,0.3)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 z-10 animate-pulse" />
                <LivePerformanceDeck />

                {/* Overlay prompts */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-2 rounded-full border border-white/20 backdrop-blur pointer-events-none">
                    Drop the Bass! +500 PTS
                </div>
            </div>
        </div>
    )
}
