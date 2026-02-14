"use client"

import { MasteringConsole } from "@/components/ai-tools/mastering-console"
import { NeonPage, NeonSectionHeader } from "@/components/marketing/neon-page"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function MasteringPage() {
    return (
        <NeonPage>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/tools">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">AI Mastering Agent</h1>
                </div>

                <NeonSectionHeader
                    title="Finalize Your Track"
                    description="Intelligent multi-band compression and limiting for streaming-ready loudness."
                />

                <div className="flex justify-center">
                    <MasteringConsole />
                </div>
            </div>
        </NeonPage>
    )
}
