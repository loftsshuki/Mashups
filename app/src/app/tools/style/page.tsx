"use client"

import { StyleTransfer } from "@/components/ai-tools/style-transfer"
import { NeonPage, NeonSectionHeader } from "@/components/marketing/neon-page"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function StylePage() {
    return (
        <NeonPage>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/tools">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Style Transfer</h1>
                </div>

                <NeonSectionHeader
                    title="Steal the Vibe"
                    description="Apply the production characteristics of famous artists to your own stems."
                />

                <div className="flex justify-center">
                    <StyleTransfer />
                </div>
            </div>
        </NeonPage>
    )
}
