"use client"

import { Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AutoMashupGenerator } from "@/components/ai-mashup/auto-mashup"
import { NeonPage } from "@/components/marketing/neon-page"

export default function AIMashupPage() {
  return (
    <NeonPage>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/create">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              AI Mashup Generator
            </h1>
            <p className="text-muted-foreground">
              Upload tracks and let AI create a complete mashup for you
            </p>
          </div>
        </div>

        {/* AI Generator */}
        <AutoMashupGenerator
          onComplete={(result) => {
            console.log("AI Mashup complete:", result)
            // Could redirect to editor with the result
          }}
        />

        {/* Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted">
            <h3 className="font-medium mb-2">⚡ Best Results</h3>
            <p className="text-sm text-muted-foreground">
              Upload 2-4 tracks with similar BPM ranges for best compatibility
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <h3 className="font-medium mb-2">🎵 Vibe Presets</h3>
            <p className="text-sm text-muted-foreground">
              Choose from 6 different vibes to match your desired style
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <h3 className="font-medium mb-2">✏️ Editable</h3>
            <p className="text-sm text-muted-foreground">
              AI results can be refined and edited in the full editor
            </p>
          </div>
        </div>
      </div>
    </NeonPage>
  )
}
