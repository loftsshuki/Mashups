"use client"

import { useState } from "react"
import {
  Mic,
  Wand2,
  Upload,
  Music2,
  Headphones,
  Disc3,
  Palette,
  Shuffle,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VocalEffectsPanel } from "@/components/ai-vocal/vocal-effects-panel"
import { NeonHero, NeonPage, NeonGrid } from "@/components/marketing/neon-page"

const tools = [
  {
    href: "/create/ai",
    icon: Wand2,
    title: "Auto-Mashup AI",
    description: "Upload 2+ tracks and let AI create a complete mashup automatically",
    badge: null,
  },
  {
    href: "/tools/vocal",
    icon: Mic,
    title: "AI Vocal Studio",
    description: "Auto-tune, harmonize, and transform vocals with AI effects",
    badge: null,
  },
  {
    href: "/tools/mastering",
    icon: Disc3,
    title: "AI Mastering",
    description: "Professional mastering with LUFS targeting, EQ, compression, and stereo width",
    badge: "New",
  },
  {
    href: "/tools/style-transfer",
    icon: Palette,
    title: "Style Transfer",
    description: "Apply the sound of artists like Daft Punk, Billie Eilish, or Travis Scott",
    badge: "New",
  },
  {
    href: "/tools/stem-swap",
    icon: Shuffle,
    title: "Smart Stem Swapping",
    description: "Swap drum kits, bass lines, or synths across genres instantly",
    badge: "New",
  },
  {
    href: "/tools/lyrics",
    icon: FileText,
    title: "Lyrics & Transcription",
    description: "Auto-transcribe with karaoke mode, word-level timing, and multi-format export",
    badge: "New",
  },
] as const

export default function ToolsPage() {
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
      <NeonHero
        eyebrow="AI Tools"
        title="AI-Powered Audio Processing"
        description="Professional-grade tools for mastering, style transfer, vocal effects, stem swapping, lyrics transcription, and more."
      />

      {/* Tools Grid */}
      <NeonGrid className="sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <tool.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{tool.title}</h3>
                      {tool.badge && (
                        <Badge variant="secondary" className="text-[10px]">
                          {tool.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </NeonGrid>

      {/* Quick Access Vocal Studio */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-xl font-semibold">Quick Access: AI Vocal Studio</h2>

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
    </NeonPage>
  )
}
