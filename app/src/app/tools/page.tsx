"use client"

import { useState } from "react"
import { Mic, Wand2, Upload, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VocalEffectsPanel } from "@/components/ai-vocal/vocal-effects-panel"
import { NeonHero, NeonPage } from "@/components/marketing/neon-page"

export default function ToolsPage() {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500))
    setUploadedFile(URL.createObjectURL(file))
    setIsUploading(false)
  }

  return (
    <NeonPage>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-primary" />
              AI Tools
            </h1>
            <p className="text-muted-foreground">
              Advanced AI-powered audio processing tools
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/create/ai">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Wand2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Auto-Mashup AI</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload 2+ tracks and let AI create a complete mashup automatically
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tools/vocal">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full border-primary">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mic className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">AI Vocal Studio</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Auto-tune, harmonize, and transform vocals with AI
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Access to Vocal Studio */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">AI Vocal Studio</h2>
          
          {!uploadedFile ? (
            <Card>
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
                    <h3 className="font-semibold">
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
        </div>

        {/* Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted">
            <h3 className="font-medium mb-2">🎵 Best Results</h3>
            <p className="text-sm text-muted-foreground">
              Use clean vocal recordings without background music for best effect
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <h3 className="font-medium mb-2">⚡ Quick Presets</h3>
            <p className="text-sm text-muted-foreground">
              Start with a preset and fine-tune the individual effects
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <h3 className="font-medium mb-2">💾 Export</h3>
            <p className="text-sm text-muted-foreground">
              Download processed vocals in high-quality WAV format
            </p>
          </div>
        </div>
      </div>
    </NeonPage>
  )
}
