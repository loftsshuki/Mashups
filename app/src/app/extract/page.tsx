"use client"

import { useState, useRef } from "react"
import { Upload, Wand2, Save, Play, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ExtractedSound {
  id: string
  title: string
  instrument: string
  bpm: number
  key: string
  duration: number
  confidence: number
  description: string
}

export default function ExtractPage() {
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const [result, setResult] = useState<ExtractedSound | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleExtract() {
    if (!description.trim()) return
    setLoading(true)
    setSaved(false)
    try {
      const formData = new FormData()
      formData.append("description", description)
      if (file) formData.append("audio", file)

      const response = await fetch("/api/ai/extract-sound", {
        method: "POST",
        body: formData,
      })
      if (response.ok) {
        const data = (await response.json()) as { result: ExtractedSound }
        setResult(data.result)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Wand2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Sound DNA Extraction
        </h1>
        <p className="text-muted-foreground">
          Upload any audio clip, describe what you want, and AI extracts and recreates it.
        </p>
      </div>

      <div className="space-y-6">
        {/* Upload zone */}
        <div
          onClick={() => fileRef.current?.click()}
          className="rounded-xl border-2 border-dashed border-border/50 bg-card/30 p-8 text-center cursor-pointer hover:border-primary/30 transition-colors"
        >
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">
            {file ? file.name : "Drop audio file here or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">MP3, WAV, FLAC (optional — can generate from description alone)</p>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            What do you want to extract?
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='e.g. "that snare hit at 0:42" or "the bass riff in the chorus"'
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <Button onClick={handleExtract} disabled={loading || !description.trim()} className="w-full">
          {loading ? "Extracting..." : "Extract Sound DNA"}
          <Wand2 className="ml-2 h-4 w-4" />
        </Button>

        {/* Result */}
        {result && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{result.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{result.description}</p>
              </div>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary capitalize">
                {result.instrument}
              </span>
            </div>

            {/* Mock waveform */}
            <div className="flex items-end gap-px h-12 rounded-lg bg-muted/20 p-2">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-primary/40"
                  style={{ height: `${30 + Math.sin(i * 0.6) * 30 + Math.random() * 20}%` }}
                />
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{result.bpm} BPM</span>
              <span>Key: {result.key}</span>
              <span>{result.duration}s</span>
              <span>Confidence: {Math.round(result.confidence * 100)}%</span>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Play className="mr-2 h-3 w-3" />
                Preview
              </Button>
              <Button size="sm" onClick={() => setSaved(true)} disabled={saved}>
                {saved ? <Check className="mr-2 h-3 w-3" /> : <Save className="mr-2 h-3 w-3" />}
                {saved ? "Saved to Stems" : "Save to Stems"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
