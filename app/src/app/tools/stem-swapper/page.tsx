"use client"

import { StemSwapper } from "@/components/features/stem-swapper"
import { NeonPage, NeonSectionHeader } from "@/components/marketing/neon-page"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function StemSwapperPage() {
    return (
        <NeonPage>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/tools">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">Smart Stem Swapper</h1>
                            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-500">
                                BETA
                            </span>
                        </div>
                        <p className="text-muted-foreground">
                            Generative Timbre Transfer (Phase 5 Feature)
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    <div className="space-y-6">
                        <NeonSectionHeader
                            title="Genre Bending AI"
                            description="Transform your loops instantly. Keep the groove, change the mood."
                        />
                        <div className="text-zinc-400 space-y-4">
                            <p>
                                Our AI analyzes the transient markers in your audio and resynthesizes them using a different timbral model.
                            </p>
                            <ul className="space-y-2 list-disc list-inside text-sm">
                                <li>Turn Acoustic Drums into Techno rumbles.</li>
                                <li>Make a Piano riff sound like a 80s Synth.</li>
                                <li>Zero latency preview.</li>
                            </ul>
                            <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-200/80 text-sm">
                                ⚠️ <strong>Note:</strong> This feature is in active development. Results may vary.
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full opacity-50" />
                            <StemSwapper />
                        </div>
                    </div>
                </div>
            </div>
        </NeonPage>
    )
}
