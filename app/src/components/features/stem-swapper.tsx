"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wand2, Music, Drum, Speaker, Mic2, Guitar, ArrowRight, Play, RefreshCw, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const STEM_TYPES = {
    drums: { icon: Drum, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    bass: { icon: Speaker, color: "text-red-500", bg: "bg-red-500/10" },
    vocals: { icon: Mic2, color: "text-pink-500", bg: "bg-pink-500/10" },
    other: { icon: Guitar, color: "text-blue-500", bg: "bg-blue-500/10" },
}

const GENRE_KITS = [
    { id: "lofi", name: "Lo-Fi Beats", color: "from-indigo-500 to-purple-500" },
    { id: "techno", name: "Warehouse Techno", color: "from-zinc-500 to-zinc-900" },
    { id: "rock", name: "Indie Rock", color: "from-orange-500 to-red-500" },
    { id: "trap", name: "Atlanta Trap", color: "from-yellow-500 to-orange-500" },
]

export function StemSwapper() {
    const [selectedStem, setSelectedStem] = useState<keyof typeof STEM_TYPES>("drums")
    const [activeKit, setActiveKit] = useState<string | null>(null)
    const [processState, setProcessState] = useState<"idle" | "analyzing" | "transferring" | "done">("idle")
    const [isPlaying, setIsPlaying] = useState(false)
    const [isOriginal, setIsOriginal] = useState(false)
    const isProcessing = processState === "analyzing" || processState === "transferring"

    const handleSwap = (kitId: string) => {
        if (processState !== "idle" && activeKit !== kitId) return
        if (processState === "done" && activeKit === kitId) {
            // If already done, toggle play
            setIsPlaying(!isPlaying)
            return
        }

        setActiveKit(kitId)
        setProcessState("analyzing")

        // Simulate AI Pipeline
        setTimeout(() => setProcessState("transferring"), 800)
        setTimeout(() => setProcessState("done"), 2500)
    }

    const togglePreview = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsOriginal(!isOriginal)
    }

    return (
        <Card className="w-[400px] bg-zinc-950 border-zinc-800 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Wand2 className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-zinc-100 text-sm">Smart Stem Swap</h3>
                    <p className="text-xs text-zinc-400">Generative Timber Replacement</p>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 text-zinc-500 hover:text-white">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <div className="p-4 space-y-6">
                {/* Source Selector */}
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">
                        Target Stem
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {(Object.entries(STEM_TYPES) as [keyof typeof STEM_TYPES, any][]).map(([key, config]) => {
                            const Icon = config.icon
                            const isSelected = selectedStem === key
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedStem(key)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                                        isSelected
                                            ? "bg-zinc-800 border-zinc-600 ring-1 ring-zinc-500"
                                            : "bg-zinc-900/50 border-transparent hover:bg-zinc-800/50 text-zinc-500"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5", isSelected ? config.color : "text-zinc-600")} />
                                    <span className={cn("text-[10px] font-medium capitalize", isSelected ? "text-zinc-200" : "text-zinc-600")}>
                                        {key}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center text-zinc-700">
                    <ArrowRight className="w-5 h-5 rotate-90" />
                </div>

                {/* Target Kits */}
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">
                        Apply Style
                    </label>
                    <div className="space-y-2">
                        {GENRE_KITS.map(kit => (
                            <div
                                key={kit.id}
                                onClick={() => handleSwap(kit.id)}
                                className={cn(
                                    "group relative overflow-hidden rounded-md border p-3 cursor-pointer transition-all",
                                    activeKit === kit.id
                                        ? "border-zinc-500 bg-zinc-800"
                                        : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                                )}
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-2 h-8 rounded-sm bg-gradient-to-b", kit.color)} />
                                        <span className={cn("font-medium text-sm", activeKit === kit.id ? "text-white" : "text-zinc-400 group-hover:text-zinc-200")}>
                                            {kit.name}
                                        </span>
                                    </div>

                                    {activeKit === kit.id ? (
                                        <div className="flex items-center gap-2">
                                            {processState === "analyzing" && <span className="text-[10px] text-zinc-500 animate-pulse">Analyzing...</span>}
                                            {processState === "transferring" && <span className="text-[10px] text-zinc-500 animate-pulse">Transferring...</span>}

                                            {processState === "done" && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={togglePreview}
                                                        className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors"
                                                    >
                                                        {isOriginal ? "ORIG" : "SWAP"}
                                                    </button>
                                                    {isPlaying ? (
                                                        <RefreshCw className="w-4 h-4 text-white animate-spin" />
                                                    ) : (
                                                        <Play className="w-4 h-4 text-green-400 fill-current" />
                                                    )}
                                                </div>
                                            )}

                                            {(processState === "analyzing" || processState === "transferring") && (
                                                <RefreshCw className="w-3 h-3 text-zinc-500 animate-spin" />
                                            )}
                                        </div>
                                    ) : (
                                        <Play className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </div>

                                {activeKit === kit.id && !isProcessing && (
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: processState === "done" ? "100%" : processState === "transferring" ? "60%" : "30%" }}
                                        transition={{ duration: 0.5 }}
                                        className={cn(
                                            "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r",
                                            processState === "done" ? "from-green-500 to-emerald-400" : "from-cyan-500 to-blue-500"
                                        )}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    )
}
