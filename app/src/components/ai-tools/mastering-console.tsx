"use client"

import { useState } from "react"
import { Activity, Radio, Volume2, Save, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

export function MasteringConsole() {
    const [mastering, setMastering] = useState(false)
    const [processed, setProcessed] = useState(false)

    const process = () => {
        setMastering(true)
        setTimeout(() => {
            setMastering(false)
            setProcessed(true)
        }, 2500)
    }

    return (
        <Card className="w-full bg-zinc-950 border-zinc-800 p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Activity className="text-green-500" />
                        AI Mastering Agent
                    </h2>
                    <p className="text-zinc-400">Target: -14 LUFS (Spotify Standard)</p>
                </div>
                {processed && (
                    <Button className="bg-green-600 hover:bg-green-700">
                        <Download className="mr-2 h-4 w-4" />
                        Export WAV (24-bit)
                    </Button>
                )}
            </div>

            {/* Visualizer Mock */}
            <div className="h-48 rounded-xl bg-zinc-900 border border-zinc-800 relative overflow-hidden flex items-end gap-1 px-4 py-8">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div
                        key={i}
                        className={`flex-1 rounded-t-sm transition-all duration-500 ${processed ? 'bg-green-500' : 'bg-zinc-700'}`}
                        style={{ height: `${Math.random() * 100}%` }}
                    />
                ))}
                {/* Overlay text */}
                {!processed && !mastering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <Button size="lg" onClick={process} className="rounded-full px-8">
                            Master Track
                        </Button>
                    </div>
                )}
                {mastering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-4 text-green-400 font-mono">
                            <RefreshCw className="w-8 h-8 animate-spin" />
                            ANALYZING DYNAMICS...
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                    <label className="text-sm font-bold uppercase text-zinc-500">Loudness Target</label>
                    <div className="flex items-center gap-4">
                        <Volume2 className="w-5 h-5 text-zinc-400" />
                        <Slider defaultValue={[14]} max={20} step={1} className="flex-1" />
                        <span className="font-mono text-zinc-300">-14 LUFS</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-bold uppercase text-zinc-500">EQ Profile</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['Club', 'Streaming', 'Vinyl', 'Car test'].map(preset => (
                            <Button key={preset} variant="outline" size="sm" className="text-xs">
                                {preset}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-bold uppercase text-zinc-500">Enhancements</label>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Stereo Widen</span>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Bass Mono</span>
                            <Switch defaultChecked />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}
