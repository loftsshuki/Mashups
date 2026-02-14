"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import * as Tone from "tone"
import { Play, Pause, Wand2, Sparkles, Layers, RefreshCw, Volume2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Mock tracks for the demo
const DEMO_TRACKS = [
    {
        id: "t1",
        name: "Neon Lights",
        artist: "Synthwave Collective",
        color: "from-cyan-500 to-blue-600",
        bpm: 128,
        url: "https://tonejs.github.io/audio/loop/FWDL.mp3" // Using Tone.js example loop as placeholder
    },
    {
        id: "t2",
        name: "Midnight Drive",
        artist: "Lofi Beats",
        color: "from-purple-500 to-pink-600",
        bpm: 128,
        url: "https://tonejs.github.io/audio/loop/CX.mp3" // Using Tone.js example loop as placeholder
    }
]

export function AutoMashupPlayer() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [activeSlice, setActiveSlice] = useState<number | null>(null)
    const [mashupMode, setMashupMode] = useState<"chop" | "blend" | "switch">("chop")

    // Audio refs
    const player1 = useRef<Tone.Player | null>(null)
    const player2 = useRef<Tone.Player | null>(null)
    const loop = useRef<Tone.Loop | null>(null)
    const visualizerRef = useRef<HTMLCanvasElement>(null)
    const analyzer = useRef<Tone.Waveform | null>(null)

    // Initialize Audio
    const initAudio = async () => {
        setIsLoading(true)
        await Tone.start()

        // Create analyzer
        analyzer.current = new Tone.Waveform(128)

        // Load players source 1
        player1.current = new Tone.Player(DEMO_TRACKS[0].url).toDestination()
        player1.current.connect(analyzer.current)

        // Load player source 2
        player2.current = new Tone.Player(DEMO_TRACKS[1].url).toDestination()
        player2.current.connect(analyzer.current)

        // Wait for buffers to load
        await Tone.loaded()

        // Sync to transport
        Tone.Transport.bpm.value = 120

        // Create a loop to trigger potential chops
        loop.current = new Tone.Loop((time) => {
            const step = Math.floor(Tone.Transport.position as unknown as number * 4) % 16
            setActiveSlice(step)

            // Simple algorithmic mixing based on mode
            if (mashupMode === "chop") {
                // Alternate every beat
                if (step % 4 < 2) {
                    player1.current?.start(time, "0:0:0", "8n")
                } else {
                    player2.current?.start(time, "0:0:0", "8n")
                }
            } else if (mashupMode === "switch") {
                // Switch every bar (4 beats)
                if (step < 8) {
                    if (step % 4 === 0) player1.current?.start(time, "0:0:0", "1m")
                } else {
                    if (step % 8 === 0) player2.current?.start(time, "0:0:0", "1m")
                }
            } else {
                // Blend: Play both (simplified trigger)
                if (step % 4 === 0) {
                    player1.current?.start(time, "0:0:0", "1m")
                    player2.current?.start(time, "0:0:0", "1m")
                }
            }

        }, "16n") // 16th note resolution

        setIsLoading(false)
        setIsReady(true)
    }

    // Playback control
    const togglePlay = () => {
        if (!isReady) {
            initAudio().then(() => {
                Tone.Transport.start()
                loop.current?.start(0)
                setIsPlaying(true)
            })
            return
        }

        if (isPlaying) {
            Tone.Transport.stop()
            setIsPlaying(false)
            setActiveSlice(null)
        } else {
            Tone.Transport.start()
            setIsPlaying(true)
        }
    }

    // Animation Loop for Visualizer
    useEffect(() => {
        let animationId: number

        const draw = () => {
            if (!visualizerRef.current || !analyzer.current || !isPlaying) return;

            const canvas = visualizerRef.current
            const ctx = canvas.getContext("2d")
            if (!ctx) return

            const buffer = analyzer.current.getValue()

            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.lineWidth = 2
            ctx.strokeStyle = "#a78bfa" // violet-400
            ctx.beginPath()

            const sliceWidth = canvas.width / buffer.length
            let x = 0

            for (let i = 0; i < buffer.length; i++) {
                const v = (buffer[i] as number) * 0.5 // Scale amplitude
                const y = (canvas.height / 2) + (v * canvas.height / 2)

                if (i === 0) {
                    ctx.moveTo(x, y)
                } else {
                    ctx.lineTo(x, y)
                }
                x += sliceWidth
            }

            ctx.stroke()
            animationId = requestAnimationFrame(draw)
        }

        if (isPlaying) {
            draw()
        }

        return () => cancelAnimationFrame(animationId)
    }, [isPlaying])


    return (
        <Card className="w-full max-w-2xl bg-zinc-950 border-zinc-800 overflow-hidden shadow-2xl relative group">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />

            <div className="p-6 relative z-10 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-purple-900/20">
                            <Sparkles className="w-5 h-5 text-white animate-pulse" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg tracking-tight">AI Hook Generator</h3>
                            <p className="text-xs text-zinc-400 flex items-center gap-1">
                                Powered by <span className="text-indigo-400 font-mono">AutoMash™ Engine</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex bg-zinc-900 rounded-full p-1 border border-zinc-800">
                        {(["chop", "blend", "switch"] as const).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setMashupMode(mode)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-xs font-medium transition-all capitalize",
                                    mashupMode === mode ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Visualizer Area */}
                <div className="relative h-48 bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden flex flex-col justify-center items-center">

                    {/* Track Labels - Left/Right split */}
                    <div className="absolute inset-0 flex">
                        <div className={cn("flex-1 bg-gradient-to-br opacity-10 transition-opacity duration-300", DEMO_TRACKS[0].color, activeSlice !== null && activeSlice % 4 < 2 ? "opacity-30" : "opacity-5")} />
                        <div className="w-[1px] bg-zinc-800" />
                        <div className={cn("flex-1 bg-gradient-to-bl opacity-10 transition-opacity duration-300", DEMO_TRACKS[1].color, activeSlice !== null && activeSlice % 4 >= 2 ? "opacity-30" : "opacity-5")} />
                    </div>

                    {/* Canvas Visualizer */}
                    <canvas
                        ref={visualizerRef}
                        width={600}
                        height={192}
                        className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen"
                    />

                    {/* Central Controls */}
                    {!isPlaying && !isLoading && (
                        <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={togglePlay}
                            className="relative z-20 w-16 h-16 rounded-full bg-white text-indigo-900 flex items-center justify-center shadow-[0_0_40px_-5px_rgba(99,102,241,0.6)] group-hover:shadow-[0_0_60px_-5px_rgba(99,102,241,0.8)] transition-shadow"
                        >
                            <Play className="w-8 h-8 fill-current translate-x-0.5" />
                        </motion.button>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center gap-3 relative z-20">
                            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                            <span className="text-xs font-medium text-indigo-300 uppercase tracking-widest animate-pulse">Analyzing Audio...</span>
                        </div>
                    )}

                    {isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {/* Beat indicators */}
                            <div className="flex gap-1 mt-32 opacity-50">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-2 h-2 rounded-full transition-all duration-75",
                                            activeSlice !== null && Math.floor(activeSlice / 4) === i ? "bg-white scale-150" : "bg-zinc-700"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Track Info */}
                <div className="grid grid-cols-2 gap-4">
                    {DEMO_TRACKS.map((track, i) => (
                        <div key={track.id} className={cn("p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 transition-colors", activeSlice !== null && ((i === 0 && activeSlice % 4 < 2) || (i === 1 && activeSlice % 4 >= 2)) ? "bg-zinc-800/80 border-zinc-700" : "")}>
                            <div className="flex items-center justify-between mb-1">
                                <Badge variant="outline" className={cn("text-[10px] border-0 text-white h-5 bg-gradient-to-r", track.color)}>
                                    TRACK {i + 1}
                                </Badge>
                                <Volume2 className={cn("w-3 h-3 transition-colors", activeSlice !== null && ((i === 0 && activeSlice % 4 < 2) || (i === 1 && activeSlice % 4 >= 2)) ? "text-green-400" : "text-zinc-600")} />
                            </div>
                            <div className="font-medium text-zinc-200 truncate">{track.name}</div>
                            <div className="text-xs text-zinc-500 truncate">{track.artist}</div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800/50">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        <span>Using browser audio engine (Tone.js)</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            {isPlaying && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900">
                    <motion.div
                        className="h-full bg-indigo-500"
                        animate={{ width: ["0%", "100%"] }}
                        transition={{ duration: 4 * (60 / 120), ease: "linear", repeat: Infinity }}
                    />
                </div>
            )}
        </Card>
    )
}
