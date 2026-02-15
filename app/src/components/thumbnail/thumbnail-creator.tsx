"use client"

import { useState, useRef } from "react"
import { generateThumbnail, thumbnailTemplates, socialMediaSizes, downloadThumbnail, mockWaveformData, ThumbnailOptions } from "@/lib/data/thumbnail-generator"
import { GeneratedThumbnail } from "@/lib/data/thumbnail-generator"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, RefreshCw, ImageIcon, Check, Sparkles } from "lucide-react"

interface ThumbnailCreatorProps {
  mashupTitle?: string
  artistName?: string
  genre?: string
  audioBuffer?: AudioBuffer
  onThumbnailGenerated?: (thumbnail: GeneratedThumbnail) => void
  className?: string
}

export function ThumbnailCreator({
  mashupTitle = "Untitled Mashup",
  artistName,
  genre,
  audioBuffer,
  onThumbnailGenerated,
  className,
}: ThumbnailCreatorProps) {
  const [title, setTitle] = useState(mashupTitle)
  const [artist, setArtist] = useState(artistName || "")
  const [selectedTemplate, setSelectedTemplate] = useState(thumbnailTemplates[0])
  const [selectedPlatform, setSelectedPlatform] = useState<keyof typeof socialMediaSizes>("youtube")
  const [generatedThumbnail, setGeneratedThumbnail] = useState<GeneratedThumbnail | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [mode, setMode] = useState<"waveform" | "ai">("waveform")
  const [aiError, setAiError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setAiError(null)

    try {
      if (mode === "ai") {
        const res = await fetch("/api/ai/thumbnail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, genre }),
        })

        if (!res.ok) {
          const err = await res.json()
          setAiError(err.error || "AI generation failed")
          setIsGenerating(false)
          return
        }

        const { url } = await res.json()

        // Fetch the image and convert to blob/dataUrl
        const imgRes = await fetch(url)
        const blob = await imgRes.blob()
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })

        const thumbnail: GeneratedThumbnail = {
          id: `thumb_ai_${Date.now()}`,
          dataUrl,
          blob,
          width: 1024,
          height: 1024,
          createdAt: new Date().toISOString(),
        }

        setGeneratedThumbnail(thumbnail)
        onThumbnailGenerated?.(thumbnail)
      } else {
        const size = socialMediaSizes[selectedPlatform]

        const options: ThumbnailOptions = {
          width: size.width,
          height: size.height,
          title,
          artist: artist || undefined,
          waveformData: mockWaveformData,
          template: selectedTemplate,
        }

        const thumbnail = await generateThumbnail(options)
        setGeneratedThumbnail(thumbnail)
        onThumbnailGenerated?.(thumbnail)
      }
    } catch (error) {
      console.error("Failed to generate thumbnail:", error)
      if (mode === "ai") setAiError("Failed to generate AI thumbnail")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedThumbnail) {
      downloadThumbnail(generatedThumbnail, `${title.replace(/\s+/g, "-")}-cover.png`)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Preview */}
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
        {generatedThumbnail ? (
          <img
            src={generatedThumbnail.dataUrl}
            alt="Generated thumbnail"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Click Generate to create thumbnail</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-2">
          <Button
            variant={mode === "waveform" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setMode("waveform")}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Waveform
          </Button>
          <Button
            variant={mode === "ai" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setMode("ai")}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Art
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mashup title"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="artist">Artist (optional)</Label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Your name"
            />
          </div>
        </div>

        {mode === "waveform" && (
          <>
            <Tabs value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as keyof typeof socialMediaSizes)}>
              <TabsList className="grid grid-cols-3 h-8">
                <TabsTrigger value="youtube" className="text-xs">YouTube</TabsTrigger>
                <TabsTrigger value="soundcloud" className="text-xs">SoundCloud</TabsTrigger>
                <TabsTrigger value="spotify" className="text-xs">Spotify</TabsTrigger>
              </TabsList>

              <TabsList className="grid grid-cols-3 h-8 mt-1">
                <TabsTrigger value="instagram" className="text-xs">Instagram</TabsTrigger>
                <TabsTrigger value="twitter" className="text-xs">Twitter</TabsTrigger>
                <TabsTrigger value="tiktok" className="text-xs">TikTok</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Template Selection */}
            <div className="space-y-2">
              <Label>Template</Label>
              <div className="grid grid-cols-2 gap-2">
                {thumbnailTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={cn(
                      "relative p-3 rounded-lg border-2 text-left transition-all",
                      selectedTemplate.id === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-8 w-8 rounded"
                        style={{
                          background: template.gradientColors
                            ? `linear-gradient(135deg, ${template.gradientColors.join(", ")})`
                            : template.backgroundColor,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{template.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {template.waveformStyle} style
                        </p>
                      </div>
                      {selectedTemplate.id === template.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {mode === "ai" && (
          <p className="text-xs text-muted-foreground">
            Generates unique album art using DALL-E based on your mashup title and genre. Output is 1024x1024.
          </p>
        )}

        {aiError && (
          <p className="text-sm text-destructive">{aiError}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 gap-1.5"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : mode === "ai" ? (
              <Sparkles className="h-4 w-4" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            {isGenerating ? "Generating..." : "Generate"}
          </Button>

          {generatedThumbnail && (
            <Button variant="outline" onClick={handleDownload} className="gap-1.5">
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

// Quick thumbnail button for use in other components
interface QuickThumbnailButtonProps {
  mashupTitle: string
  onGenerated: (thumbnail: GeneratedThumbnail) => void
}

export function QuickThumbnailButton({ mashupTitle, onGenerated }: QuickThumbnailButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      const thumbnail = await generateThumbnail({
        width: 1280,
        height: 720,
        title: mashupTitle,
        waveformData: mockWaveformData,
        template: thumbnailTemplates[0],
      })

      onGenerated(thumbnail)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={isGenerating}
      className="gap-1.5"
    >
      {isGenerating ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <ImageIcon className="h-4 w-4" />
      )}
      Generate Cover
    </Button>
  )
}
