"use client"

import { useState, useCallback } from "react"
import { Send, Copy, Check, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface StemForDrop {
  id: string
  title: string
  instrument: string
}

interface StemDropCreatorProps {
  availableStems: StemForDrop[]
  className?: string
}

export function StemDropCreator({ availableStems, className }: StemDropCreatorProps) {
  const [selectedStems, setSelectedStems] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState("")
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const toggleStem = useCallback((id: string) => {
    setSelectedStems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleDrop = useCallback(async () => {
    if (selectedStems.size === 0) return
    setLoading(true)

    try {
      const stems = availableStems
        .filter((s) => selectedStems.has(s.id))
        .map((s) => ({ id: s.id, title: s.title, instrument: s.instrument }))

      const response = await fetch("/api/drops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stems, message }),
      })

      if (!response.ok) return

      const data = (await response.json()) as { drop: { id: string } }
      setShareUrl(`${window.location.origin}/drop/${data.drop.id}`)
    } finally {
      setLoading(false)
    }
  }, [selectedStems, availableStems, message])

  const handleCopy = useCallback(() => {
    if (!shareUrl) return
    void navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [shareUrl])

  const instrumentColors: Record<string, string> = {
    vocal: "border-pink-500/30 bg-pink-500/10",
    vocals: "border-pink-500/30 bg-pink-500/10",
    drums: "border-amber-500/30 bg-amber-500/10",
    bass: "border-emerald-500/30 bg-emerald-500/10",
    synth: "border-violet-500/30 bg-violet-500/10",
    guitar: "border-red-500/30 bg-red-500/10",
    other: "border-slate-500/30 bg-slate-500/10",
  }

  return (
    <div className={cn("rounded-xl border border-border/70 bg-card/70 p-5 space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Send className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Drop Stems</h3>
      </div>

      <p className="text-xs text-muted-foreground">
        Select stems to share as a challenge to other creators.
      </p>

      {/* Stem selector */}
      <div className="space-y-1.5">
        {availableStems.map((stem) => {
          const isSelected = selectedStems.has(stem.id)
          return (
            <button
              key={stem.id}
              onClick={() => toggleStem(stem.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                isSelected
                  ? instrumentColors[stem.instrument] ?? instrumentColors.other
                  : "border-border/50 bg-background/50 hover:bg-muted/30"
              )}
            >
              <Music className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs font-medium text-foreground flex-1 truncate">
                {stem.title}
              </span>
              <span className="text-[10px] text-muted-foreground capitalize">
                {stem.instrument}
              </span>
            </button>
          )
        })}
      </div>

      {/* Message */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Add a message... &quot;I dare you to make something with these!&quot;"
        className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none h-16"
      />

      {!shareUrl ? (
        <Button
          onClick={handleDrop}
          disabled={selectedStems.size === 0 || loading}
          className="w-full"
        >
          <Send className="mr-2 h-4 w-4" />
          {loading ? "Creating..." : `Drop ${selectedStems.size} Stem${selectedStems.size !== 1 ? "s" : ""}`}
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-xs text-foreground outline-none"
            />
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Share this link to challenge someone!
          </p>
        </div>
      )}
    </div>
  )
}
