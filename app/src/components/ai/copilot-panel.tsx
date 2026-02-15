"use client"

import { useState, useCallback } from "react"
import { Sparkles, Play, RefreshCw, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SuggestedStem {
  instrument: string
  description: string
}

interface CompletionOption {
  id: string
  label: string
  description: string
  style: string
  confidence: number
  suggestedStems: SuggestedStem[]
}

interface CopilotPanelProps {
  isOpen: boolean
  onClose: () => void
  onApply?: (option: CompletionOption) => void
  currentStems?: { instrument?: string; title?: string }[]
  bpm?: number | null
  musicalKey?: string | null
}

const styleColors: Record<string, string> = {
  "high-energy": "from-orange-500/20 to-red-500/20 border-orange-500/30",
  ambient: "from-blue-500/20 to-purple-500/20 border-blue-500/30",
  drop: "from-pink-500/20 to-violet-500/20 border-pink-500/30",
}

const styleEmoji: Record<string, string> = {
  "high-energy": "🔥",
  ambient: "🌊",
  drop: "💥",
}

export function CopilotPanel({
  isOpen,
  onClose,
  onApply,
  currentStems = [],
  bpm,
  musicalKey,
}: CopilotPanelProps) {
  const [options, setOptions] = useState<CompletionOption[]>([])
  const [loading, setLoading] = useState(false)
  const [previewingId, setPreviewingId] = useState<string | null>(null)

  const generate = useCallback(async () => {
    setLoading(true)
    setOptions([])

    try {
      const response = await fetch("/api/ai/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stems: currentStems,
          bpm: bpm ?? null,
          key: musicalKey ?? null,
        }),
      })

      if (!response.ok) return

      const data = (await response.json()) as { completions: CompletionOption[] }
      setOptions(data.completions)
    } finally {
      setLoading(false)
    }
  }, [currentStems, bpm, musicalKey])

  if (!isOpen) return null

  return (
    <div className="fixed right-4 top-20 bottom-24 w-80 z-40 flex flex-col rounded-xl border border-border/70 bg-card/95 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">AI Copilot</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {options.length === 0 && !loading && (
          <div className="text-center py-8 space-y-3">
            <Sparkles className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Add some stems to your timeline, then ask the AI to finish it for you.
            </p>
            <Button onClick={generate} disabled={loading}>
              <Sparkles className="mr-2 h-4 w-4" />
              Finish This For Me
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-border/50 p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                <div className="h-3 bg-muted rounded w-full mb-1" />
                <div className="h-3 bg-muted rounded w-4/5" />
              </div>
            ))}
          </div>
        )}

        {options.map((option) => (
          <div
            key={option.id}
            className={cn(
              "rounded-lg border p-4 space-y-3 bg-gradient-to-br transition-all hover:scale-[1.01]",
              styleColors[option.style] ?? "from-muted/20 to-muted/10 border-border/50"
            )}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">
                {styleEmoji[option.style] ?? "✨"} {option.label}
              </h4>
              <span className="text-[10px] text-muted-foreground">
                {Math.round(option.confidence * 100)}% match
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {option.description}
            </p>

            {/* Suggested stems */}
            <div className="space-y-1.5">
              {option.suggestedStems.map((stem, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-2 py-1.5 rounded bg-background/50 text-xs"
                >
                  <span className="font-medium text-foreground capitalize shrink-0">
                    {stem.instrument}
                  </span>
                  <span className="text-muted-foreground truncate">
                    {stem.description}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs flex-1"
                onClick={() =>
                  setPreviewingId(previewingId === option.id ? null : option.id)
                }
              >
                <Play className="mr-1 h-3 w-3" />
                {previewingId === option.id ? "Stop" : "Preview"}
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={() => onApply?.(option)}
              >
                <Plus className="mr-1 h-3 w-3" />
                Apply
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {options.length > 0 && (
        <div className="px-4 py-3 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={generate}
            disabled={loading}
          >
            <RefreshCw className={cn("mr-2 h-3 w-3", loading && "animate-spin")} />
            Regenerate
          </Button>
        </div>
      )}
    </div>
  )
}
