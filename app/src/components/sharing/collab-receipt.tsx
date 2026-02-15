"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Creator {
  name: string
  avatarUrl: string
  role: string
}

interface CollabReceiptProps {
  mashupId: string
  className?: string
}

interface ReceiptData {
  title: string
  creators: Creator[]
  duration: number
  playCount: number
  createdAt: string
  genre: string
}

export function CollabReceipt({ mashupId, className }: CollabReceiptProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetch(`/api/receipts/generate?mashupId=${encodeURIComponent(mashupId)}`)
        if (!response.ok) return
        const data = (await response.json()) as { receipt: ReceiptData }
        if (!cancelled) setReceipt(data.receipt)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [mashupId])

  // Render receipt to canvas
  useEffect(() => {
    if (!receipt) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const w = 600
    const h = 400
    canvas.width = w
    canvas.height = h

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, "#1a1a2e")
    grad.addColorStop(1, "#16213e")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Border
    ctx.strokeStyle = "rgba(99, 102, 241, 0.3)"
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, w - 20, h - 20)

    // Title
    ctx.fillStyle = "#e2e8f0"
    ctx.font = "bold 24px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(receipt.title, w / 2, 60)

    // Collab receipt label
    ctx.fillStyle = "rgba(99, 102, 241, 0.8)"
    ctx.font = "bold 11px sans-serif"
    ctx.fillText("COLLAB RECEIPT", w / 2, 85)

    // Creators
    const startY = 120
    receipt.creators.forEach((creator, i) => {
      const y = startY + i * 50

      // Avatar circle placeholder
      ctx.beginPath()
      ctx.arc(w / 2 - 80, y + 10, 16, 0, Math.PI * 2)
      ctx.fillStyle = i === 0 ? "#6366f1" : "#ec4899"
      ctx.fill()

      // Initial
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(creator.name.charAt(0).toUpperCase(), w / 2 - 80, y + 14)

      // Name
      ctx.fillStyle = "#e2e8f0"
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(creator.name, w / 2 - 55, y + 8)

      // Role
      ctx.fillStyle = "#94a3b8"
      ctx.font = "12px sans-serif"
      ctx.fillText(creator.role, w / 2 - 55, y + 24)
    })

    // Divider
    const divY = startY + receipt.creators.length * 50 + 10
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(60, divY)
    ctx.lineTo(w - 60, divY)
    ctx.stroke()

    // Stats
    const statsY = divY + 30
    ctx.fillStyle = "#94a3b8"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"

    const formatDuration = (s: number) => {
      const m = Math.floor(s / 60)
      const sec = Math.floor(s % 60)
      return `${m}:${sec.toString().padStart(2, "0")}`
    }

    ctx.fillText(
      `${receipt.genre}  ·  ${formatDuration(receipt.duration)}  ·  ${receipt.playCount.toLocaleString()} plays`,
      w / 2,
      statsY
    )

    ctx.fillText(
      new Date(receipt.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      w / 2,
      statsY + 20
    )

    // Footer
    ctx.fillStyle = "rgba(99, 102, 241, 0.5)"
    ctx.font = "10px sans-serif"
    ctx.fillText("Made on Mashups.com", w / 2, h - 25)
  }, [receipt])

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = `collab-receipt-${mashupId}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }, [mashupId])

  if (loading) return null
  if (!receipt || receipt.creators.length < 2) return null

  return (
    <div className={cn("space-y-3", className)}>
      <canvas
        ref={canvasRef}
        className="w-full max-w-[600px] rounded-xl border border-border/50"
        style={{ imageRendering: "auto" }}
      />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-3 w-3" />
          Save as PNG
        </Button>
      </div>
    </div>
  )
}
