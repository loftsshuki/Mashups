"use client"

import { useEffect, useRef, useState } from "react"

interface MapDot {
  id: string
  x: number // 0-1 normalized longitude
  y: number // 0-1 normalized latitude
  genre: string
  creator: string
  title: string
  size: number
  opacity: number
  createdAt: number
}

const genreColors: Record<string, string> = {
  Electronic: "#8b5cf6",
  "Hip-Hop": "#ef4444",
  Pop: "#ec4899",
  Jazz: "#f59e0b",
  "Lo-fi": "#06b6d4",
  Classical: "#10b981",
  Rock: "#f97316",
  Bass: "#6366f1",
}

// Generate mock dots distributed roughly like world population
function generateMockDots(): MapDot[] {
  const regions: [number, number, number][] = [
    [0.52, 0.32, 20], // Europe
    [0.18, 0.38, 18], // North America
    [0.68, 0.42, 15], // East Asia
    [0.62, 0.35, 8],  // India
    [0.28, 0.55, 6],  // South America
    [0.48, 0.52, 5],  // Africa
    [0.82, 0.62, 4],  // Australia
  ]

  const genres = Object.keys(genreColors)
  const creators = ["BeatAlchemist", "SynthWitch", "NeonDreamer", "VinylWhisper", "BassArchitect", "CrystalBeats"]
  const titles = ["Midnight Fusion", "Sunrise Remix", "Deep Cut", "Analog Dreams", "Digital Rain", "Cosmic Blend"]

  const dots: MapDot[] = []
  regions.forEach(([cx, cy, count]) => {
    for (let i = 0; i < count; i++) {
      dots.push({
        id: `dot-${dots.length}`,
        x: cx + (Math.random() - 0.5) * 0.12,
        y: cy + (Math.random() - 0.5) * 0.1,
        genre: genres[Math.floor(Math.random() * genres.length)],
        creator: creators[Math.floor(Math.random() * creators.length)],
        title: titles[Math.floor(Math.random() * titles.length)],
        size: 3 + Math.random() * 4,
        opacity: 0.5 + Math.random() * 0.5,
        createdAt: Date.now() - Math.floor(Math.random() * 3600000),
      })
    }
  })
  return dots
}

export function GlobalMashupMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dots] = useState(generateMockDots)
  const [hoveredDot, setHoveredDot] = useState<MapDot | null>(null)
  const [counter, setCounter] = useState(76)

  // Animate counter
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((c) => c + Math.floor(Math.random() * 3))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener("resize", resize)

    function draw() {
      if (!canvas || !ctx) return
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight

      // Dark background
      ctx.fillStyle = "#0a0a0f"
      ctx.fillRect(0, 0, w, h)

      // Grid lines
      ctx.strokeStyle = "#ffffff08"
      ctx.lineWidth = 1
      for (let i = 0; i < 20; i++) {
        ctx.beginPath()
        ctx.moveTo((i / 20) * w, 0)
        ctx.lineTo((i / 20) * w, h)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, (i / 20) * h)
        ctx.lineTo(w, (i / 20) * h)
        ctx.stroke()
      }

      // Draw dots
      dots.forEach((dot) => {
        const x = dot.x * w
        const y = dot.y * h
        const color = genreColors[dot.genre] ?? "#8b5cf6"

        // Glow
        const grad = ctx.createRadialGradient(x, y, 0, x, y, dot.size * 3)
        grad.addColorStop(0, color + "44")
        grad.addColorStop(1, color + "00")
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, dot.size * 3, 0, Math.PI * 2)
        ctx.fill()

        // Core dot
        ctx.fillStyle = color
        ctx.globalAlpha = dot.opacity
        ctx.beginPath()
        ctx.arc(x, y, dot.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      })
    }

    draw()

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left) / rect.width
      const my = (e.clientY - rect.top) / rect.height

      const found = dots.find((d) => {
        const dx = d.x - mx
        const dy = d.y - my
        return Math.sqrt(dx * dx + dy * dy) < 0.02
      })
      setHoveredDot(found ?? null)
    }

    canvas.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("mousemove", handleMouseMove)
    }
  }, [dots])

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />

      {/* Counter */}
      <div className="absolute bottom-4 right-4 z-10 rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm px-3 py-2">
        <p className="text-[10px] text-muted-foreground">Last hour</p>
        <p className="text-lg font-bold text-foreground">{counter} mashups</p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm px-3 py-2">
        <div className="flex flex-wrap gap-2">
          {Object.entries(genreColors).map(([genre, color]) => (
            <span key={genre} className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ background: color }} />
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDot && (
        <div className="absolute top-4 right-4 z-10 rounded-lg border border-border/50 bg-background/90 backdrop-blur-sm px-3 py-2 space-y-0.5">
          <p className="text-xs font-medium text-foreground">{hoveredDot.title}</p>
          <p className="text-[10px] text-muted-foreground">by {hoveredDot.creator}</p>
          <p className="text-[10px] text-primary">{hoveredDot.genre}</p>
        </div>
      )}
    </div>
  )
}
