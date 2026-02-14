"use client"

import { useState } from "react"
import { Palette, Image as ImageIcon, Sparkles, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const STYLES = [
    { id: "daft", name: "French House", artist: "Daft Punk", color: "from-yellow-500 to-red-500" },
    { id: "skrillex", name: "Modern Dubstep", artist: "Skrillex", color: "from-purple-600 to-pink-600" },
    { id: "flume", name: "Wonky Future", artist: "Flume", color: "from-blue-400 to-cyan-300" },
    { id: "hans", name: "Cinematic", artist: "Hans Zimmer", color: "from-amber-700 to-yellow-900" },
]

export function StyleTransfer() {
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)

    const applyStyle = () => {
        if (!selectedStyle) return
        setProcessing(true)
        setTimeout(() => setProcessing(false), 3000)
    }

    return (
        <Card className="w-full bg-zinc-950 border-zinc-800 p-6 space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black italic uppercase flex items-center justify-center gap-3">
                    <Palette className="w-8 h-8 text-pink-500" />
                    Style Transfer
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Transform your track into the style of legendary producers using deep learning style embeddings.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {STYLES.map(style => (
                    <div
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={cn(
                            "relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all border-2",
                            selectedStyle === style.id
                                ? "border-white scale-105 shadow-xl shadow-pink-500/20"
                                : "border-transparent opacity-70 hover:opacity-100 hover:scale-[1.02]"
                        )}
                    >
                        <div className={cn("absolute inset-0 bg-gradient-to-br", style.color)} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                            <span className="font-extrabold text-white text-lg drop-shadow-md">{style.artist}</span>
                            <span className="text-xs font-medium text-white/80">{style.name}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center pt-4">
                <Button
                    size="lg"
                    disabled={!selectedStyle || processing}
                    onClick={applyStyle}
                    className="bg-white text-black hover:bg-zinc-200 rounded-full h-12 px-8 text-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all"
                >
                    {processing ? (
                        <>
                            <RefreshCcw className="mr-2 h-5 w-5 animate-spin" />
                            Resynthesizing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-5 w-5 fill-pink-500 text-pink-500" />
                            Apply Style
                        </>
                    )}
                </Button>
            </div>
        </Card>
    )
}
