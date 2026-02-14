"use client"

import { useState } from "react"
import { Mic2, Music, Play, Layers, Download, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function HarmonyEngine() {
    const [isProcessing, setIsProcessing] = useState(false)
    const [generated, setGenerated] = useState(false)

    const generate = () => {
        setIsProcessing(true)
        setTimeout(() => {
            setIsProcessing(false)
            setGenerated(true)
        }, 2000)
    }

    return (
        <Card className="w-full max-w-2xl bg-black/40 border-primary/20 backdrop-blur-md p-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">AI Harmony Engine</h3>
                    <p className="text-sm text-muted-foreground">Generate 4-part harmonies from a single vocal track</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Harmony Style</label>
                        <Select defaultValue="gospel">
                            <SelectTrigger>
                                <SelectValue placeholder="Select Style" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gospel">Gospel Choir</SelectItem>
                                <SelectItem value="pop">Pop Stack</SelectItem>
                                <SelectItem value="jazz">Jazz Extensions</SelectItem>
                                <SelectItem value="barbershop">Barbershop Quartet</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Stereo Width</label>
                        <Slider defaultValue={[75]} max={100} step={1} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Narrow</span>
                            <span>Wide</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Humanization</label>
                        <Slider defaultValue={[20]} max={100} step={1} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Robotic</span>
                            <span>Natural</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 flex flex-col justify-center items-center gap-4 border border-white/10">
                    {!generated ? (
                        <>
                            <Mic2 className="w-12 h-12 text-muted-foreground opacity-20" />
                            <p className="text-sm text-muted-foreground text-center">Upload vocal stem to start</p>
                            <Button onClick={generate} disabled={isProcessing} className="w-full">
                                {isProcessing ? (
                                    <>
                                        <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="mr-2 h-4 w-4" />
                                        Generate Harmonies
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <div className="w-full space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-purple-500/30">
                                <div className="flex items-center gap-3">
                                    <Play className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm font-medium">Generated Harmony Stack</span>
                                </div>
                                <Badge variant="outline" className="text-purple-400 border-purple-500/30">4 Stems</Badge>
                            </div>
                            <Button variant="secondary" className="w-full">
                                <Download className="mr-2 h-4 w-4" />
                                Download MIDI + Audio
                            </Button>
                            <Button variant="ghost" onClick={() => setGenerated(false)} className="w-full text-xs text-muted-foreground">
                                Reset
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}
