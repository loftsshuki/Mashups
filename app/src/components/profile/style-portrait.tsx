"use client"

import { useEffect, useRef, useState } from "react"
import { Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface StylePortraitData {
  username: string
  archetype: string
  genres: { name: string; weight: number }[]
  avgBpmRange: [number, number]
  harmonicPreference: "major" | "minor" | "mixed"
  colorPalette: string[]
  stats: {
    totalMashups: number
    totalPlays: number
    avgDuration: number
    favInstrument: string
  }
}

interface StylePortraitProps {
  username: string
  className?: string
}

export function StylePortrait({ username, className }: StylePortraitProps) {
  const [portrait, setPortrait] = useState<StylePortraitData | null>(null)
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/profile/style-portrait?username=${username}`)
        if (response.ok) {
          const data = (await response.json()) as { portrait: StylePortraitData }
          setPortrait(data.portrait)
        }
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [username])

  useEffect(() => {
    if (!portrait || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const w = 600
    const h = 340
    canvas.width = w
    canvas.height = h

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, portrait.colorPalette[0] + "33")
    grad.addColorStop(0.5, portrait.colorPalette[1] + "22")
    grad.addColorStop(1, portrait.colorPalette[2] + "33")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Border
    ctx.strokeStyle = portrait.colorPalette[0] + "66"
    ctx.lineWidth = 2
    ctx.roundRect(1, 1, w - 2, h - 2, 16)
    ctx.stroke()

    // Archetype label
    ctx.fillStyle = portrait.colorPalette[0]
    ctx.font = "bold 11px system-ui"
    ctx.textAlign = "left"
    ctx.fillText("CREATIVE ARCHETYPE", 32, 40)

    // Archetype name
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 28px system-ui"
    ctx.fillText(portrait.archetype, 32, 75)

    // Username
    ctx.fillStyle = "#999999"
    ctx.font = "14px system-ui"
    ctx.fillText(`@${portrait.username}`, 32, 100)

    // Radar chart (simplified as bars)
    const maxWeight = Math.max(...portrait.genres.map((g) => g.weight))
    const barX = 32
    const barY = 125
    portrait.genres.forEach((genre, i) => {
      const barW = (genre.weight / maxWeight) * 250
      const y = barY + i * 28

      ctx.fillStyle = portrait.colorPalette[i % portrait.colorPalette.length] + "44"
      ctx.beginPath()
      ctx.roundRect(barX, y, barW, 18, 4)
      ctx.fill()

      ctx.fillStyle = portrait.colorPalette[i % portrait.colorPalette.length]
      ctx.font = "bold 10px system-ui"
      ctx.textAlign = "left"
      ctx.fillText(genre.name.toUpperCase(), barX + 8, y + 13)

      ctx.fillStyle = "#cccccc"
      ctx.font = "10px system-ui"
      ctx.textAlign = "right"
      ctx.fillText(genre.weight.toString(), barX + barW - 8, y + 13)
    })

    // Stats column
    const statsX = 400
    ctx.textAlign = "left"

    const stats = [
      { label: "BPM Range", value: `${portrait.avgBpmRange[0]}-${portrait.avgBpmRange[1]}` },
      { label: "Harmonic", value: portrait.harmonicPreference },
      { label: "Mashups", value: portrait.stats.totalMashups.toString() },
      { label: "Total Plays", value: portrait.stats.totalPlays.toLocaleString() },
      { label: "Fav Instrument", value: portrait.stats.favInstrument },
    ]

    stats.forEach((stat, i) => {
      const y = 140 + i * 34
      ctx.fillStyle = "#666666"
      ctx.font = "10px system-ui"
      ctx.fillText(stat.label, statsX, y)
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 14px system-ui"
      ctx.fillText(stat.value, statsX, y + 18)
    })

    // Footer
    ctx.fillStyle = "#444444"
    ctx.font = "10px system-ui"
    ctx.textAlign = "center"
    ctx.fillText("mashups.com/portrait", w / 2, h - 16)
  }, [portrait])

  function handleDownload() {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = `${username}-style-portrait.png`
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  async function handleShare() {
    if (!canvasRef.current) return
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current!.toBlob(resolve, "image/png")
      )
      if (blob && navigator.share) {
        await navigator.share({
          title: `${username}'s Style Portrait`,
          files: [new File([blob], `${username}-portrait.png`, { type: "image/png" })],
        })
      }
    } catch {
      // Fallback: copy link
      await navigator.clipboard.writeText(
        `${window.location.origin}/portrait/${username}`
      )
    }
  }

  if (loading) {
    return (
      <div className={cn("rounded-xl border border-border/70 bg-card/70 p-6", className)}>
        <p className="text-sm text-muted-foreground">Generating style portrait...</p>
      </div>
    )
  }

  if (!portrait) return null

  return (
    <div className={cn("space-y-3", className)}>
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl border border-border/50"
        style={{ maxWidth: 600, aspectRatio: "600/340" }}
      />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-3 w-3" />
          Download
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="mr-2 h-3 w-3" />
          Share
        </Button>
      </div>
    </div>
  )
}
