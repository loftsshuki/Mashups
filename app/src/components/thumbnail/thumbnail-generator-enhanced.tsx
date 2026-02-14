"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { 
  ImageIcon, 
  Wand2, 
  RefreshCw, 
  Download, 
  Palette,
  Type,
  Layout,
  Sparkles,
  Check,
  Upload,
  Crop
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Phase 2: AI Thumbnail Generator with templates and customization

type AspectRatio = "1:1" | "9:16" | "16:9"
type TemplateStyle = "minimal" | "bold" | "gradient" | "waveform" | "split"

interface ThumbnailTemplate {
  id: string
  name: string
  style: TemplateStyle
  bgColor: string
  accentColor: string
  fontFamily: string
  layout: "center" | "split" | "overlay"
}

interface ThumbnailConfig {
  template: ThumbnailTemplate
  title: string
  subtitle?: string
  showWaveform: boolean
  waveformColor: string
  textColor: string
  fontSize: number
  blur: number
  overlayOpacity: number
}

const TEMPLATES: ThumbnailTemplate[] = [
  {
    id: "minimal",
    name: "Minimal",
    style: "minimal",
    bgColor: "#000000",
    accentColor: "#ffffff",
    fontFamily: "Inter, sans-serif",
    layout: "center",
  },
  {
    id: "neon",
    name: "Neon Nights",
    style: "bold",
    bgColor: "#0a0a0a",
    accentColor: "#00ff88",
    fontFamily: "Impact, sans-serif",
    layout: "center",
  },
  {
    id: "sunset",
    name: "Sunset Vibes",
    style: "gradient",
    bgColor: "linear-gradient(135deg, #ff6b6b, #feca57)",
    accentColor: "#ffffff",
    fontFamily: "Georgia, serif",
    layout: "overlay",
  },
  {
    id: "ocean",
    name: "Deep Ocean",
    style: "gradient",
    bgColor: "linear-gradient(180deg, #0c3483, #a2b6df)",
    accentColor: "#ffffff",
    fontFamily: "Inter, sans-serif",
    layout: "split",
  },
  {
    id: "cyber",
    name: "Cyberpunk",
    style: "bold",
    bgColor: "#1a0b2e",
    accentColor: "#ff00ff",
    fontFamily: "Courier New, monospace",
    layout: "center",
  },
  {
    id: "waveform",
    name: "Waveform",
    style: "waveform",
    bgColor: "#0d1117",
    accentColor: "#58a6ff",
    fontFamily: "Inter, sans-serif",
    layout: "overlay",
  },
]

const ASPECT_RATIOS: { value: AspectRatio; label: string; dimensions: string }[] = [
  { value: "1:1", label: "Square", dimensions: "1080x1080" },
  { value: "9:16", label: "Vertical", dimensions: "1080x1920" },
  { value: "16:9", label: "Landscape", dimensions: "1920x1080" },
]

interface ThumbnailGeneratorEnhancedProps {
  mashupTitle?: string
  audioWaveform?: number[]
  coverArt?: string
  onThumbnailGenerated?: (dataUrl: string) => void
  className?: string
}

export function ThumbnailGeneratorEnhanced({
  mashupTitle = "Untitled Mashup",
  audioWaveform,
  coverArt,
  onThumbnailGenerated,
  className,
}: ThumbnailGeneratorEnhancedProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ThumbnailTemplate>(TEMPLATES[0])
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1")
  const [title, setTitle] = useState(mashupTitle)
  const [subtitle, setSubtitle] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedThumbnails, setGeneratedThumbnails] = useState<string[]>([])
  const [selectedThumbnail, setSelectedThumbnail] = useState<number | null>(null)
  
  // Customization options
  const [showWaveform, setShowWaveform] = useState(true)
  const [fontSize, setFontSize] = useState(48)
  const [blur, setBlur] = useState(0)
  const [overlayOpacity, setOverlayOpacity] = useState(50)
  const [customColor, setCustomColor] = useState("")
  
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generate waveform data if not provided
  const generateWaveform = useCallback(() => {
    if (audioWaveform) return audioWaveform
    return Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.2)
  }, [audioWaveform])

  // Draw thumbnail on canvas
  const drawThumbnail = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dimensions = ASPECT_RATIOS.find((r) => r.value === aspectRatio)!
    const [width, height] = dimensions.dimensions.split("x").map(Number)
    canvas.width = width
    canvas.height = height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw background
    if (selectedTemplate.style === "gradient" && selectedTemplate.bgColor.includes("gradient")) {
      // Parse and create gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, "#ff6b6b")
      gradient.addColorStop(1, "#feca57")
      ctx.fillStyle = gradient
    } else {
      ctx.fillStyle = customColor || selectedTemplate.bgColor
    }
    ctx.fillRect(0, 0, width, height)

    // Draw cover art if available
    if (coverArt) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        // Draw with blur effect
        ctx.filter = `blur(${blur}px)`
        ctx.drawImage(img, 0, 0, width, height)
        ctx.filter = "none"
        
        // Draw overlay
        ctx.fillStyle = `rgba(0,0,0,${overlayOpacity / 100})`
        ctx.fillRect(0, 0, width, height)
        
        drawTextAndWaveform(ctx, width, height)
      }
      img.src = coverArt
    } else {
      drawTextAndWaveform(ctx, width, height)
    }
  }, [selectedTemplate, aspectRatio, customColor, coverArt, blur, overlayOpacity, title, subtitle, fontSize, showWaveform])

  const drawTextAndWaveform = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw waveform
    if (showWaveform) {
      const waveform = generateWaveform()
      const barWidth = width / waveform.length
      const barHeight = height * 0.3
      
      ctx.fillStyle = selectedTemplate.accentColor + "40" // Add transparency
      
      waveform.forEach((value, i) => {
        const h = value * barHeight
        const x = i * barWidth
        const y = (height - h) / 2
        
        ctx.fillRect(x, y, barWidth - 1, h)
      })
    }

    // Draw title
    ctx.font = `bold ${fontSize}px ${selectedTemplate.fontFamily}`
    ctx.fillStyle = selectedTemplate.textColor || "#ffffff"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    
    // Word wrap title
    const maxWidth = width * 0.8
    const words = title.split(" ")
    let line = ""
    const lines: string[] = []
    
    for (const word of words) {
      const testLine = line + word + " "
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && line !== "") {
        lines.push(line)
        line = word + " "
      } else {
        line = testLine
      }
    }
    lines.push(line)
    
    const lineHeight = fontSize * 1.2
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2
    
    lines.forEach((line, i) => {
      ctx.fillText(line.trim(), width / 2, startY + i * lineHeight)
    })
    
    // Draw subtitle
    if (subtitle) {
      ctx.font = `${fontSize * 0.5}px ${selectedTemplate.fontFamily}`
      ctx.fillStyle = (selectedTemplate.textColor || "#ffffff") + "cc"
      ctx.fillText(subtitle, width / 2, startY + lines.length * lineHeight + 20)
    }

    // Draw accent elements based on template
    if (selectedTemplate.style === "bold") {
      // Draw border
      ctx.strokeStyle = selectedTemplate.accentColor
      ctx.lineWidth = 8
      ctx.strokeRect(20, 20, width - 40, height - 40)
    }
  }

  // Generate multiple thumbnail variations
  const generateThumbnails = useCallback(async () => {
    setIsGenerating(true)
    setGeneratedThumbnails([])
    setSelectedThumbnail(null)

    const thumbnails: string[] = []
    
    // Generate 4 variations with different templates
    const variations = TEMPLATES.slice(0, 4)
    
    for (const template of variations) {
      setSelectedTemplate(template)
      await new Promise((resolve) => setTimeout(resolve, 100))
      
      const canvas = canvasRef.current
      if (canvas) {
        thumbnails.push(canvas.toDataURL("image/png"))
      }
    }
    
    setGeneratedThumbnails(thumbnails)
    setIsGenerating(false)
  }, [title, aspectRatio])

  // Export selected thumbnail
  const exportThumbnail = () => {
    if (selectedThumbnail === null) return
    
    const dataUrl = generatedThumbnails[selectedThumbnail]
    const link = document.createElement("a")
    link.download = `mashup-thumbnail-${Date.now()}.png`
    link.href = dataUrl
    link.click()
    
    onThumbnailGenerated?.(dataUrl)
  }

  // Redraw when settings change
  useEffect(() => {
    drawThumbnail()
  }, [drawThumbnail])

  const dimensions = ASPECT_RATIOS.find((r) => r.value === aspectRatio)!

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ImageIcon className="h-4 w-4 text-primary" />
          AI Thumbnail Generator
          {generatedThumbnails.length > 0 && (
            <Badge variant="secondary" className="text-[10px] ml-auto">
              {generatedThumbnails.length} generated
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {generatedThumbnails.length === 0 ? (
          <>
            {/* Canvas Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Preview</label>
                <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as AspectRatio)}>
                  <SelectTrigger className="w-28 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASPECT_RATIOS.map((ratio) => (
                      <SelectItem key={ratio.value} value={ratio.value} className="text-xs">
                        {ratio.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative aspect-square max-w-[300px] mx-auto">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full rounded-lg border object-contain"
                />
                <Badge variant="outline" className="absolute bottom-2 right-2 text-[10px]">
                  {dimensions.dimensions}
                </Badge>
              </div>
            </div>

            {/* Template Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Template</label>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={cn(
                      "h-16 rounded-lg border-2 transition-all",
                      selectedTemplate.id === template.id
                        ? "border-primary"
                        : "border-transparent hover:border-muted"
                    )}
                    style={{
                      background: template.bgColor.includes("gradient")
                        ? template.bgColor
                        : template.bgColor,
                    }}
                  >
                    <span
                      className="text-[10px] font-medium px-2"
                      style={{ color: template.accentColor }}
                    >
                      {template.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Inputs */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1">
                <Type className="h-3 w-3" />
                Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-sm"
                placeholder="Enter mashup title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Subtitle (optional)</label>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="text-sm"
                placeholder="Artist names, mashup info"
              />
            </div>

            {/* Customization */}
            <div className="space-y-3 pt-2 border-t">
              <label className="text-xs font-medium flex items-center gap-1">
                <Palette className="h-3 w-3" />
                Customization
              </label>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Font Size</span>
                  <span>{fontSize}px</span>
                </div>
                <Slider
                  value={[fontSize]}
                  min={24}
                  max={72}
                  step={4}
                  onValueChange={(v) => setFontSize(v[0])}
                />
              </div>

              {coverArt && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Background Blur</span>
                      <span>{blur}px</span>
                    </div>
                    <Slider
                      value={[blur]}
                      min={0}
                      max={20}
                      step={1}
                      onValueChange={(v) => setBlur(v[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Overlay Opacity</span>
                      <span>{overlayOpacity}%</span>
                    </div>
                    <Slider
                      value={[overlayOpacity]}
                      min={0}
                      max={80}
                      step={5}
                      onValueChange={(v) => setOverlayOpacity(v[0])}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Generate Button */}
            <Button onClick={generateThumbnails} className="w-full" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating variations...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Thumbnails
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {/* Generated Thumbnails Grid */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Select a thumbnail</label>
              <div className="grid grid-cols-2 gap-2">
                {generatedThumbnails.map((thumb, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedThumbnail(index)}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                      selectedThumbnail === index
                        ? "border-primary ring-2 ring-primary"
                        : "border-transparent hover:border-muted"
                    )}
                  >
                    <img
                      src={thumb}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedThumbnail === index && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setGeneratedThumbnails([])
                  setSelectedThumbnail(null)
                }}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Regenerate
              </Button>
              <Button
                className="flex-1"
                onClick={exportThumbnail}
                disabled={selectedThumbnail === null}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
