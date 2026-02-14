"use client"

import { useState } from "react"
import { Play, Pause, Heart, Share2, MoreHorizontal, Trophy } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LeaderboardEntry {
    rank: number
    id: string
    username: string
    avatarUrl: string
    title: string
    votes: number
    isPlaying: boolean
    duration: string
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
    { rank: 1, id: "1", username: "djalex", avatarUrl: "https://github.com/shadcn.png", title: "Motown Trap Anthem", votes: 1240, isPlaying: false, duration: "0:28" },
    { rank: 2, id: "2", username: "sarah_beats", avatarUrl: "https://github.com/shadcn.png", title: "Midnight Flip", votes: 985, isPlaying: false, duration: "0:30" },
    { rank: 3, id: "3", username: "bass_god", avatarUrl: "https://github.com/shadcn.png", title: "Low End Theory", votes: 850, isPlaying: false, duration: "0:24" },
    { rank: 4, id: "4", username: "lofi_girl", avatarUrl: "https://github.com/shadcn.png", title: "Chill Vibes Only", votes: 620, isPlaying: false, duration: "0:29" },
    { rank: 5, id: "5", username: "prod_mike", avatarUrl: "https://github.com/shadcn.png", title: "Fast Flip", votes: 410, isPlaying: false, duration: "0:15" },
    { rank: 6, id: "6", username: "noise_maker", avatarUrl: "https://github.com/shadcn.png", title: "Experimental Noise", votes: 305, isPlaying: false, duration: "0:30" },
    { rank: 7, id: "7", username: "beat_master", avatarUrl: "https://github.com/shadcn.png", title: "Classic Boom Bap", votes: 210, isPlaying: false, duration: "0:26" },
]

export function DailyLeaderboard() {
    const [entries, setEntries] = useState(MOCK_LEADERBOARD)

    const togglePlay = (id: string) => {
        setEntries(entries.map(e => ({
            ...e,
            isPlaying: e.id === id ? !e.isPlaying : false // Stop others
        })))
    }

    return (
        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Top Flips
                    </h3>
                    <p className="text-sm text-muted-foreground">Voted by the community</p>
                </div>
                <div className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded">
                    Updates in 04:59
                </div>
            </div>

            <ScrollArea className="h-[500px]">
                <div className="divide-y divide-white/5">
                    {entries.map((entry) => (
                        <div key={entry.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group">
                            <div className="w-8 text-center font-bold text-lg text-muted-foreground font-mono">
                                #{entry.rank}
                            </div>

                            <div className="relative">
                                <Avatar className="h-10 w-10 border border-white/10">
                                    <AvatarImage src={entry.avatarUrl} />
                                    <AvatarFallback>{entry.username[0]}</AvatarFallback>
                                </Avatar>
                                <button
                                    onClick={() => togglePlay(entry.id)}
                                    className="absolute -inset-1 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    {entry.isPlaying ? (
                                        <Pause className="w-4 h-4 text-white" />
                                    ) : (
                                        <Play className="w-4 h-4 text-white ml-0.5" />
                                    )}
                                </button>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold truncate text-white">{entry.title}</h4>
                                    <Badge variant="secondary" className="text-[10px] h-4 px-1">{entry.duration}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">by @{entry.username}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-sm font-medium text-pink-500">
                                    <Heart className="w-4 h-4 fill-pink-500/20" />
                                    {entry.votes}
                                </div>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white">
                                    <Share2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-white/10 bg-white/5 text-center">
                <Button variant="link" className="text-muted-foreground hover:text-white">
                    View Full Leaderboard
                </Button>
            </div>
        </div>
    )
}
