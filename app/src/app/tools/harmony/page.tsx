"use client"

import { HarmonyEngine } from "@/components/ai-tools/harmony-engine"
import { NeonPage, NeonSectionHeader } from "@/components/marketing/neon-page"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function HarmonyPage() {
    return (
        <NeonPage>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/tools">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">AI Harmony Engine</h1>
                </div>

                <NeonSectionHeader
                    title="Instant Vocal Stacks"
                    description="Turn a single vocal line into a rich, professional choir using generative harmony modeling."
                />

                <div className="flex justify-center">
                    <HarmonyEngine />
                </div>
            </div>
        </NeonPage>
    )
}
