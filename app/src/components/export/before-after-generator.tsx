"use client"

import { useState, useRef, useCallback } from "react"
import { Download, Smartphone, Monitor, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ExportFormat = "9:16" | "16:9" | "1:1"

interface SourceTrack {
  title: string
  artist: string
}

interface BeforeAfterGeneratorProps {
  mashupTitle: string
  creatorName: string
  sourceTracks: SourceTrack[]
  coverUrl?: string
  className?: string
}

const FORMAT_SIZES: Record<ExportFormat, { w: number; h: number; label: string }> = {
  "9:16": { w: 1080, h: 1920, label: "TikTok / Reels" },
  "16:9": { w: 1920, h: 1080, label: "YouTube" },
  "1:1": { w: 1080, h: 1080, label: "Twitter / X" },
}

export function BeforeAfterGenerator({
  mashupTitle,
  creatorName,
  sourceTracks,
  coverUrl,
  className,
}: BeforeAfterGeneratorProps) {
  const [format, setFormat] = useState<ExportFormat>("9:16")
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateImage = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsGenerating(true)

    const size = FORMAT_SIZES[format]
    canvas.width = size.w
    canvas.height = size.h
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, size.h)
    gradient.addColorStop(0, "#0f0f1a")
    gradient.addColorStop(0.5, "#1a1025")
    gradient.addColorStop(1, "#0f0f1a")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size.w, size.h)

    const centerX = size.w / 2
    const padding = size.w * 0.08
    const scale = size.w / 1080

    // "BEFORE" label
    ctx.font = `bold ${14 * scale}px system-ui, sans-serif`
    ctx.fillStyle = "#888888"
    ctx.textAlign = "center"
    const beforeY = size.h * 0.12
    ctx.fillText("BEFORE", centerX, beforeY)

    // Source tracks section
    ctx.font = `${16 * scale}px system-ui, sans-serif`
    ctx.fillStyle = "#ffffff"
    const trackStartY = beforeY + 30 * scale
    sourceTracks.forEach((track, i) => {
      const y = trackStartY + i * 50 * scale

      // Track pill
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)"
      const pillW = size.w - padding * 2
      const pillH = 40 * scale
      const pillX = padding
      roundRect(ctx, pillX, y - 14 * scale, pillW, pillH, 8 * scale)
      ctx.fill()

      // Track text
      ctx.fillStyle = "#ffffff"
      ctx.font = `${14 * scale}px system-ui, sans-serif`
      ctx.textAlign = "left"
      ctx.fillText(track.title, padding + 16 * scale, y + 6 * scale)
      ctx.fillStyle = "#888888"
      ctx.font = `${12 * scale}px system-ui, sans-serif`
      ctx.fillText(track.artist, padding + 16 * scale, y + 22 * scale)
    })

    // Arrow / divider
    const dividerY = trackStartY + sourceTracks.length * 50 * scale + 30 * scale
    ctx.fillStyle = "#7c3aed"
    ctx.textAlign = "center"
    ctx.font = `bold ${24 * scale}px system-ui, sans-serif`
    ctx.fillText("↓", centerX, dividerY)

    // "AFTER" label
    const afterY = dividerY + 40 * scale
    ctx.font = `bold ${14 * scale}px system-ui, sans-serif`
    ctx.fillStyle = "#888888"
    ctx.fillText("AFTER", centerX, afterY)

    // Mashup title
    ctx.font = `bold ${22 * scale}px system-ui, sans-serif`
    ctx.fillStyle = "#ffffff"
    ctx.fillText(mashupTitle, centerX, afterY + 36 * scale)

    // Faux waveform
    const waveY = afterY + 60 * scale
    const waveW = size.w - padding * 2
    const waveH = 60 * scale
    const barCount = 60
    const barWidth = waveW / barCount - 2

    for (let i = 0; i < barCount; i++) {
      const barH = (Math.sin(i * 0.3) * 0.5 + 0.5) * waveH * 0.8 + waveH * 0.1
      const x = padding + i * (barWidth + 2)
      const barGrad = ctx.createLinearGradient(0, waveY, 0, waveY + waveH)
      barGrad.addColorStop(0, "#7c3aed")
      barGrad.addColorStop(1, "#ec4899")
      ctx.fillStyle = barGrad
      roundRect(ctx, x, waveY + (waveH - barH) / 2, barWidth, barH, 2)
      ctx.fill()
    }

    // Creator credit
    ctx.font = `${14 * scale}px system-ui, sans-serif`
    ctx.fillStyle = "#aaaaaa"
    ctx.textAlign = "center"
    ctx.fillText(`by ${creatorName}`, centerX, waveY + waveH + 30 * scale)

    // Watermark
    ctx.font = `bold ${12 * scale}px system-ui, sans-serif`
    ctx.fillStyle = "rgba(124, 58, 237, 0.6)"
    ctx.fillText("Made on Mashups.com", centerX, size.h - 30 * scale)

    setIsGenerating(false)
  }, [format, mashupTitle, creatorName, sourceTracks])

  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `${mashupTitle.replace(/\s+/g, "-")}-before-after.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }, [mashupTitle])

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        {(["9:16", "16:9", "1:1"] as ExportFormat[]).map((f) => (
          <Button
            key={f}
            variant={format === f ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setFormat(f)}
          >
            {f === "9:16" && <Smartphone className="mr-1 h-3 w-3" />}
            {f === "16:9" && <Monitor className="mr-1 h-3 w-3" />}
            {f === "1:1" && <Square className="mr-1 h-3 w-3" />}
            {FORMAT_SIZES[f].label}
          </Button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button onClick={generateImage} disabled={isGenerating} size="sm">
          {isGenerating ? "Generating..." : "Generate Preview"}
        </Button>
        <Button onClick={downloadImage} variant="outline" size="sm">
          <Download className="mr-1 h-3.5 w-3.5" />
          Download PNG
        </Button>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full max-w-sm rounded-lg border border-border/50 bg-black"
        style={{ aspectRatio: format === "9:16" ? "9/16" : format === "16:9" ? "16/9" : "1/1" }}
      />
    </div>
  )
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
