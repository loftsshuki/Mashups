"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface BattleLobbyProps {
    onMatchFound: (opponent: any) => void
}

export function BattleLobby({ onMatchFound }: BattleLobbyProps) {
    const [isSearching, setIsSearching] = useState(false)

    const startSearch = () => {
        setIsSearching(true)
        // Simulate matchmaking delay
        setTimeout(() => {
            setIsSearching(false)
            onMatchFound({
                username: "GlitchMaster99",
                rank: "Diamond",
                avatar: "https://placehold.co/100x100/purple/white?text=GM"
            })
        }, 3000)
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* User Card */}
                <Card className="p-8 bg-zinc-900/50 border-zinc-800 flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full bg-zinc-800 border-4 border-zinc-700 overflow-hidden">
                        <img src="https://placehold.co/128x128/zinc/white?text=ME" alt="You" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-2xl font-bold">You</h3>
                        <p className="text-zinc-500">Level 42 Producer</p>
                    </div>
                </Card>

                {/* VS Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-20 h-20 bg-red-600 rounded-full font-black text-2xl italic border-8 border-zinc-950 shadow-xl">
                    VS
                </div>

                {/* Opponent Card (Placeholder) */}
                <Card className="p-8 bg-zinc-900/30 border-zinc-800/50 flex flex-col items-center gap-4 opacity-50 border-dashed">
                    <div className="w-32 h-32 rounded-full bg-zinc-900/50 border-4 border-zinc-800 flex items-center justify-center">
                        <Search className="w-12 h-12 text-zinc-700" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-zinc-700">Searching...</h3>
                        <p className="text-zinc-800">Waiting for opponent</p>
                    </div>
                </Card>
            </div>

            <div className="mt-8">
                {!isSearching ? (
                    <Button
                        size="lg"
                        className="bg-red-600 hover:bg-red-700 text-xl px-12 py-8 rounded-2xl shadow-[0_0_40px_-10px_rgba(220,38,38,0.5)] transition-all hover:scale-105 active:scale-95"
                        onClick={startSearch}
                    >
                        FIND MATCH
                    </Button>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
                        <p className="text-zinc-400 animate-pulse">Scanning global queues...</p>
                        <Button variant="ghost" className="text-zinc-500" onClick={() => setIsSearching(false)}>Cancel</Button>
                    </div>
                )}
            </div>
        </div>
    )
}
