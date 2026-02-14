"use client"

import { useState } from "react"
import { Mic, Upload, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VocalEffectsPanel } from "@/components/ai-vocal/vocal-effects-panel"
import { NeonHero, NeonPage } from "@/components/marketing/neon-page"

export default function VocalToolPage() {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setUploadedFile(URL.createObjectURL(file))
    setIsUploading(false)
  }

  return (
    <NeonPage>
      <Link
        href="/tools"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tools
      </Link>

      <NeonHero
        eyebrow="AI Tools"
        title="AI Vocal Studio"
        description="Auto-tune, harmonize, clone, and transform vocals with AI-powered effects. Upload a vocal track to get started."
      />

      {!uploadedFile ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                id="vocal-upload"
              />
              <label htmlFor="vocal-upload" className="cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 text-primary" />
                  )}
                </div>
                <h3 className="font-semibold text-lg">
                  {isUploading ? "Uploading..." : "Upload Vocal Track"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Support for WAV, MP3, FLAC up to 50MB
                </p>
              </label>
            </div>
          </CardContent>
        </Card>
      ) : (
        <VocalEffectsPanel audioUrl={uploadedFile} />
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <div className="p-4 rounded-lg bg-muted">
          <h3 className="font-medium mb-2">Best Results</h3>
          <p className="text-sm text-muted-foreground">
            Use clean vocal recordings without background music for best effect
          </p>
        </div>
        <div className="p-4 rounded-lg bg-muted">
          <h3 className="font-medium mb-2">Quick Presets</h3>
          <p className="text-sm text-muted-foreground">
            Start with a preset and fine-tune the individual effects
          </p>
        </div>
        <div className="p-4 rounded-lg bg-muted">
          <h3 className="font-medium mb-2">Export</h3>
          <p className="text-sm text-muted-foreground">
            Download processed vocals in high-quality WAV format
          </p>
        </div>
      </div>
    </NeonPage>
  )
}
