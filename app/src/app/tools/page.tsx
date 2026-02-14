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
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full bg-zinc-900/50">
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

          <Link href="/tools/stem-swapper">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full border-indigo-500/20 bg-indigo-900/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <Wand2 className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Smart Stem Swapper</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Change the sound (timbre) of a loop while keeping the rhythm.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tools/harmony">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full border-purple-500/20 bg-purple-900/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Wand2 className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">AI Harmony Engine</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate 4-part vocal harmonies instantly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tools/lyrics">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full border-blue-500/20 bg-blue-900/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Wand2 className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Lyrics Studio</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Auto-transcription and translation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tools/mastering">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full border-green-500/20 bg-green-900/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Wand2 className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">AI Mastering</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Finalize your track with AI-driven compression.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tools/style">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full border-pink-500/20 bg-pink-900/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                    <Wand2 className="h-6 w-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Style Transfer</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Apply artist styles (Daft Punk, Skrillex) to your stems.
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
