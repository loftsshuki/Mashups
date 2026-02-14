"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Square, Circle, Mic2, Music2, Drum, Activity, Volume2 } from "lucide-react"
import * as Tone from "tone"

// Defines the 8x8 grid state
interface ClipSlot {
    id: string
    trackId: number
    sceneId: number
    hasClip: boolean
    isPlaying: boolean
    color: string
}

// Global Macro Controls
const MACROS = [
    { id: "filter", label: "FILTER", value: 0 },
    { id: "reverb", label: "REVERB", value: 30 },
    { id: "stutter", label: "STUTTER", value: 0 },
    { id: "crush", label: "CRUSH", value: 0 },
]

export function LivePerformanceDeck() {
    const [grid, setGrid] = useState<ClipSlot[]>([])
    const [activeScene, setActiveScene] = useState<number | null>(null)
    const [audioReady, setAudioReady] = useState(false)
    const [synths, setSynths] = useState<Tone.PolySynth[] | null>(null)

    // Initialize audio engine
    const startEngine = async () => {
        await Tone.start()

        // simple poly synth for melodic elements
        const poly = new Tone.PolySynth(Tone.Synth).toDestination()

        // simple membrane synth for drums
        const membrane = new Tone.MembraneSynth().toDestination()

        setSynths([poly, membrane] as any)
        setAudioReady(true)
        console.log("Audio Engine Started")
    }

    // Initialize grid
    useEffect(() => {
        const newGrid: ClipSlot[] = []
        const trackColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-pink-500"]

        for (let scene = 0; scene < 8; scene++) {
            for (let track = 0; track < 8; track++) {
                // Randomly populate some clips
                const hasClip = Math.random() > 0.4
                newGrid.push({
                    id: `${track}-${scene}`,
                    trackId: track,
                    sceneId: scene,
                    hasClip,
                    isPlaying: false,
                    color: hasClip ? trackColors[track] : "bg-zinc-800/50"
                })
            }
        }
        setGrid(newGrid)
    }, [])

    const triggerClip = (trackId: number, sceneId: number) => {
        // Trigger sound if engine is ready
        if (audioReady && synths) {
            const now = Tone.now()
            // Random note based on track ID to simulate different "clips"
            const notes = ["C4", "E4", "G4", "B4", "C3", "F3", "A3", "C5"]
            const note = notes[trackId % notes.length]

            if (trackId < 4) {
                // First 4 tracks use synth
                // @ts-ignore
                synths[0].triggerAttackRelease(note, "8n", now)
            } else {
                // Last 4 tracks use drums
                // @ts-ignore
                synths[1].triggerAttackRelease(note, "8n", now)
            }
        }

        setGrid(prev => prev.map(slot => {
            // If matches target track
            if (slot.trackId === trackId) {
                // If it's the specific clip we clicked
                if (slot.sceneId === sceneId && slot.hasClip) {
                    return { ...slot, isPlaying: true }
                }
                // Stop other clips on same track
                return { ...slot, isPlaying: false }
            }
            return slot
        }))
    }

    const triggerScene = (sceneId: number) => {
        setActiveScene(sceneId)
        setGrid(prev => prev.map(slot => {
            if (slot.sceneId === sceneId && slot.hasClip) {
                return { ...slot, isPlaying: true }
            }
            // Stop everything else if it belongs to other scenes (simplified logic for demo)
            if (slot.sceneId !== sceneId && slot.trackId < 8) {
                // In reality we check if the new scene has a clip for this track
                // For now, let's just launch the scene row
            }
            return slot
        }))
    }

    return (
        <div className="h-full bg-zinc-950 p-6 flex flex-col gap-6">
            {/* Top Bar: Transport & Status */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-32 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center font-mono text-xl text-green-500">
                        128.00
                        <span className="text-xs text-zinc-500 ml-1">BPM</span>
                    </div>
                    <div className="h-10 w-24 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center font-mono text-xl text-yellow-500">
                        4 / 4
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="destructive" className="animate-pulse">
                        <Circle className="w-3 h-3 mr-2 fill-current" /> REC
                    </Button>
                    <Button variant="outline" size="icon"><Square className="w-4 h-4 fill-current" /></Button>

                    {!audioReady ? (
                        <Button variant="default" onClick={startEngine} className="bg-yellow-500 hover:bg-yellow-600 gap-2">
                            <Volume2 className="w-4 h-4" /> Initialize Audio
                        </Button>
                    ) : (
                        <Button variant="default" size="icon" className="bg-green-500 hover:bg-green-600"><Play className="w-4 h-4 fill-current" /></Button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Main Grid: 8x8 Launchpad */}
                <div className="flex-1 grid grid-cols-[auto_1fr] gap-2 h-full">
                    {/* Scene Launch Buttons (Side) */}
                    <div className="flex flex-col gap-2 justify-between py-1">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                            <button
                                key={i}
                                onClick={() => triggerScene(i)}
                                className={cn(
                                    "w-8 h-full rounded flex items-center justify-center transition-all",
                                    activeScene === i ? "bg-white text-black" : "bg-zinc-900 text-zinc-600 hover:bg-zinc-800"
                                )}
                            >
                                <Play className="w-3 h-3 fill-current" />
                            </button>
                        ))}
                    </div>

                    {/* Clip Grid */}
                    <div className="grid grid-cols-8 grid-rows-8 gap-2">
                        {grid.map((slot) => (
                            <button
                                key={slot.id}
                                onClick={() => triggerClip(slot.trackId, slot.sceneId)}
                                className={cn(
                                    "relative rounded-sm transition-all duration-75 border border-transparent",
                                    !slot.hasClip && "opacity-20 hover:opacity-30",
                                    slot.hasClip && slot.color,
                                    slot.hasClip && !slot.isPlaying && "opacity-60 hover:opacity-100 hover:scale-[1.02]",
                                    slot.isPlaying && "opacity-100 ring-2 ring-white animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                )}
                            >
                                {slot.isPlaying && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Play className="w-4 h-4 text-white fill-current" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Macros & Mixer */}
                <div className="w-64 flex flex-col gap-4">
                    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Master FX</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {MACROS.map(macro => (
                                <div key={macro.id} className="flex flex-col items-center gap-2">
                                    <div className="relative w-16 h-16 rounded-full border-4 border-zinc-800 flex items-center justify-center group cursor-grab active:cursor-grabbing">
                                        <div
                                            className="absolute inset-0 rounded-full border-4 border-b-transparent border-l-transparent border-indigo-500 rotate-45 group-hover:border-indigo-400 transition-colors"
                                            style={{ transform: `rotate(${45 + (macro.value * 2.7)}deg)` }}
                                        />
                                        <span className="text-xs font-mono font-bold text-zinc-300">{macro.value}%</span>
                                    </div>
                                    <span className="text-[10px] text-zinc-500 font-bold">{macro.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 flex-1">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Volume</h3>
                        <div className="flex justify-between h-48 items-end gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="flex-1 bg-zinc-800 rounded-sm relative group">
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-green-400 to-yellow-400 rounded-sm transition-all"
                                        style={{ height: `${Math.random() * 80 + 10}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
