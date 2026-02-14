"use client"

import { useState } from "react"
import { Type, Languages, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export function LyricsStudio() {
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<string | null>(null)

    const transcribe = () => {
        setAnalyzing(true)
        setTimeout(() => {
            setAnalyzing(false)
            setResult("[00:12.4] Yeah, looking back at the skyline\n[00:15.2] We didn't know what we had\n[00:18.5] Just chasing lights in the nighttime\n[00:22.0] Never looking back...")
        }, 1500)
    }

    return (
        <Card className="w-full max-w-4xl bg-black/40 border-primary/20 backdrop-blur-md overflow-hidden flex flex-col md:flex-row h-[500px]">
            {/* Left: Controls */}
            <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-white/10 space-y-6">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Type className="w-5 h-5 text-blue-400" />
                        Lyrics AI
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">Transcribe & Translate</p>
                </div>

                <div className="space-y-4">
                    <Button
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={transcribe}
                        disabled={analyzing}
                    >
                        {analyzing ? "Transcribing..." : "Auto-Transcribe Track"}
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="text-xs">
                            <Languages className="mr-2 h-3 w-3" />
                            Translate
                        </Button>
                        <Button variant="outline" className="text-xs">
                            <Search className="mr-2 h-3 w-3" />
                            Find Hook
                        </Button>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
                        <strong>Pro Tip:</strong> Export as .LRC file for karaoke sync on Spotify/Apple Music.
                    </div>
                </div>
            </div>

            {/* Right: Editor */}
            <div className="flex-1 flex flex-col bg-white/5">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <div className="flex gap-2">
                        <Badge variant="secondary">English (Detected)</Badge>
                        <Badge variant="outline">98% Confidence</Badge>
                    </div>
                    <Button variant="ghost" size="icon">
                        <SlidersHorizontal className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex-1 p-0 relative">
                    <Textarea
                        className="w-full h-full resize-none bg-transparent border-0 focus-visible:ring-0 p-6 font-mono text-sm leading-relaxed"
                        placeholder="Lyrics will appear here..."
                        value={result || ""}
                        readOnly
                    />
                    {!result && !analyzing && (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
                            Waiting for audio...
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}
