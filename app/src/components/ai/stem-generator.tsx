"use client"

import { useState, useCallback } from "react"
import { Wand2, Play, Pause, Plus, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GeneratedStem {
  id: string
  title: string
  instrument: string
  genre: string
  bpm: number
  key: string
  duration_seconds: number
  audio_url: string
}

interface StemGeneratorProps {
  onAddToTimeline?: (stem: GeneratedStem) => void
  onSaveToCrate?: (stem: GeneratedStem) => void
  className?: string
}

const INSTRUMENTS = ["", "drums", "bass", "synth", "guitar", "keys", "strings", "vocal", "texture"]
const KEYS = ["", "C major", "C minor", "D major", "D minor", "E major", "E minor", "F major", "F minor", "G major", "G minor", "A major", "A minor", "B major", "B minor"]
const MOODS = ["", "energetic", "melancholic", "dark", "uplifting", "dreamy", "aggressive", "chill", "mysterious"]

export function StemGenerator({ onAddToTimeline, onSaveToCrate, className }: StemGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [instrument, setInstrument] = useState("")
  const [bpm, setBpm] = useState("")
  const [musicalKey, setMusicalKey] = useState("")
  const [mood, setMood] = useState("")
  const [duration, setDuration] = useState("30")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GeneratedStem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleGenerate = useCallback(async () => {
    // Build full prompt from fields
    const parts = [prompt]
    if (mood && !prompt.includes(mood)) parts.push(mood)
    if (instrument && !prompt.toLowerCase().includes(instrument)) parts.push(instrument)
    if (musicalKey) parts.push(`in ${musicalKey}`)
    if (bpm) parts.push(`at ${bpm} BPM`)

    const fullPrompt = parts.filter(Boolean).join(", ")
    if (!fullPrompt.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/ai/generate-stem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          instrument: instrument || undefined,
          bpm: bpm ? parseInt(bpm) : undefined,
          key: musicalKey || undefined,
          duration: duration ? parseInt(duration) : undefined,
        }),
      })

      if (!response.ok) return

      const data = (await response.json()) as { stem: GeneratedStem }
      setResult(data.stem)
    } finally {
      setLoading(false)
    }
  }, [prompt, instrument, bpm, musicalKey, mood, duration])

  return (
    <div className={cn("rounded-xl border border-border/70 bg-card/70 p-5 space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Wand2 className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Generate with AI</h3>
      </div>

      {/* Prompt */}
      <div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the stem you want... e.g. 'melancholic cello with reverb' or 'punchy 808 trap drums'"
          className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none h-20"
        />
      </div>

      {/* Optional controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <select
          value={instrument}
          onChange={(e) => setInstrument(e.target.value)}
          className="rounded-lg border border-border/50 bg-background px-2 py-1.5 text-xs text-foreground"
        >
          <option value="">Instrument</option>
          {INSTRUMENTS.filter(Boolean).map((i) => (
            <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>
          ))}
        </select>

        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="rounded-lg border border-border/50 bg-background px-2 py-1.5 text-xs text-foreground"
        >
          <option value="">Mood</option>
          {MOODS.filter(Boolean).map((m) => (
            <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
          ))}
        </select>

        <select
          value={musicalKey}
          onChange={(e) => setMusicalKey(e.target.value)}
          className="rounded-lg border border-border/50 bg-background px-2 py-1.5 text-xs text-foreground"
        >
          <option value="">Key</option>
          {KEYS.filter(Boolean).map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            placeholder="BPM"
            min={60}
            max={200}
            className="w-full rounded-lg border border-border/50 bg-background px-2 py-1.5 text-xs text-foreground"
          />
        </div>
      </div>

      {/* Duration slider */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground shrink-0">Duration</label>
        <input
          type="range"
          min={5}
          max={60}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="flex-1 accent-primary"
        />
        <span className="text-xs text-muted-foreground w-8 text-right">{duration}s</span>
      </div>

      {/* Generate button */}
      <Button onClick={handleGenerate} disabled={loading || (!prompt.trim() && !instrument)} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Stem
          </>
        )}
      </Button>

      {/* Result */}
      {result && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{result.title}</p>
              <p className="text-xs text-muted-foreground">
                {result.instrument} · {result.genre} · {result.bpm} BPM · {result.key} · {result.duration_seconds}s
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>

          {/* Placeholder waveform */}
          <div className="h-8 rounded bg-primary/10 flex items-center justify-center">
            <div className="flex gap-[2px] items-center h-6">
              {Array.from({ length: 40 }, (_, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full bg-primary/40"
                  style={{ height: `${20 + Math.sin(i * 0.5) * 60 + Math.random() * 20}%` }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onAddToTimeline?.(result)}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add to Timeline
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onSaveToCrate?.(result)}
            >
              <Save className="mr-1 h-3 w-3" />
              Save to Crate
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
