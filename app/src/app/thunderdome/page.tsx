"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Swords, Users, Trophy, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BattleLobby } from "@/components/thunderdome/battle-lobby"
import { BattleArena } from "@/components/thunderdome/battle-arena"

export default function ThunderdomePage() {
    const [gameState, setGameState] = useState<"lobby" | "battle" | "results">("lobby")
    const [opponent, setOpponent] = useState<any>(null)

    const handleMatchFound = (opponentData: any) => {
        setOpponent(opponentData)
        setGameState("battle")
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white pt-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                            <Swords className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                                THUNDERDOME
                            </h1>
                            <p className="text-zinc-400">Real-time Multiplayer Mashup Battles</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-mono">
                        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800">
                            <Users className="w-4 h-4 text-green-500" />
                            <span>1,248 Online</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span>Rank #42</span>
                        </div>
                    </div>
                </header>

                {gameState === "lobby" && (
                    <BattleLobby onMatchFound={handleMatchFound} />
                )}

                {gameState === "battle" && (
                    <BattleArena opponent={opponent} onEndGame={() => setGameState("results")} />
                )}

                {gameState === "results" && (
                    <div className="text-center py-20">
                        <h2 className="text-4xl font-bold mb-4">Battle Finished</h2>
                        <Button onClick={() => setGameState("lobby")}>Return to Lobby</Button>
                    </div>
                )}
            </div>
        </div>
    )
}
