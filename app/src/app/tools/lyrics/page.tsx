"use client"

import { LyricsStudio } from "@/components/ai-tools/lyrics-studio"
import { NeonPage, NeonSectionHeader } from "@/components/marketing/neon-page"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LyricsPage() {
    return (
        <NeonPage>
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/tools">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Lyrics Studio AI</h1>
                </div>

                <NeonSectionHeader
                    title="Transcribe. Translate. Create."
                    description="Automated lyric extraction and translation engine powered by Whisper-large-v3."
                />

                <div className="flex justify-center">
                    <LyricsStudio />
                </div>
            </div>
        </NeonPage>
    )
}
