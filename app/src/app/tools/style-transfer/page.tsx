"use client"

import { useState, useEffect } from "react"
import { Palette, Wand2, Music, Layers, Sparkles, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { NeonPage, NeonHero, NeonSectionHeader, NeonGrid } from "@/components/marketing/neon-page"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getStylePresets,
  getStyleTransferJobs,
  startStyleTransfer,
  STYLE_TARGET_STEMS,
  STYLE_INTENSITY_LEVELS,
} from "@/lib/data/style-transfer"
import type { StylePreset, StyleTransferJob } from "@/lib/data/types"

const GENRE_COLORS: Record<string, string> = {
  Electronic: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  Pop: "text-pink-400 bg-pink-400/10 border-pink-400/20",
  "Hip-Hop": "text-orange-400 bg-orange-400/10 border-orange-400/20",
  Psychedelic: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  IDM: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "R&B": "text-rose-400 bg-rose-400/10 border-rose-400/20",
  "UK Garage": "text-slate-400 bg-slate-400/10 border-slate-400/20",
  "Future Bass": "text-sky-400 bg-sky-400/10 border-sky-400/20",
}

function StyleTransferContent() {
  const [presets, setPresets] = useState<StylePreset[]>([])
  const [jobs, setJobs] = useState<StyleTransferJob[]>([])
  const [selectedPreset, setSelectedPreset] = useState<StylePreset | null>(null)
  const [targetStem, setTargetStem] = useState<string>("full_mix")
  const [intensity, setIntensity] = useState<number>(0.75)
  const [processing, setProcessing] = useState(false)
  const [compareMode, setCompareMode] = useState<"original" | "styled">("original")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [p, j] = await Promise.all([
        getStylePresets(),
        getStyleTransferJobs("mock-user"),
      ])
      setPresets(p)
      setJobs(j)
      setLoading(false)
    }
    load()
  }, [])

  const handleApplyStyle = async () => {
    if (!selectedPreset) return
    setProcessing(true)

    const { job } = await startStyleTransfer("mashup-demo", selectedPreset.id, targetStem)

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2500))

    if (job) {
      const completedJob: StyleTransferJob = {
        ...job,
        status: "completed",
        output_url: `/audio/mashup-demo-${selectedPreset.id}.mp3`,
        completed_at: new Date().toISOString(),
      }
      setJobs((prev) => [completedJob, ...prev])
      setCompareMode("styled")
    }

    setProcessing(false)
  }

  if (loading) {
    return (
      <NeonPage>
        <Skeleton className="h-64 rounded-xl" />
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </NeonPage>
    )
  }

  return (
    <NeonPage>
      <NeonHero
        eyebrow="Style Transfer"
        title="Style Transfer"
        description="Apply the sonic signature of legendary artists to your mashup"
      />

      {/* Preset Grid */}
      <NeonSectionHeader title="Style Presets" description="Choose an artist signature to apply" />
      <NeonGrid className="sm:grid-cols-2 lg:grid-cols-4">
        {presets.map((preset) => {
          const isSelected = selectedPreset?.id === preset.id
          const genreColor = GENRE_COLORS[preset.genre ?? ""] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"
          return (
            <Card
              key={preset.id}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/40",
                isSelected && "border-primary ring-2 ring-primary/20",
              )}
              onClick={() => setSelectedPreset(preset)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <p className="font-semibold text-sm">{preset.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{preset.description}</p>
                </div>
                <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider border", genreColor)}>
                  {preset.genre}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
      </NeonGrid>

      {/* Selected Style Detail Panel */}
      {selectedPreset && (
        <div className="mt-8 space-y-6">
          <NeonSectionHeader
            title={`Configure: ${selectedPreset.name}`}
            description={`${selectedPreset.genre} - ${selectedPreset.description}`}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Target Stem Selector */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Target Stem</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {STYLE_TARGET_STEMS.map((stem) => (
                    <Badge
                      key={stem}
                      variant={targetStem === stem ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-colors capitalize",
                        targetStem === stem
                          ? "bg-primary text-primary-foreground"
                          : "hover:border-primary/40",
                      )}
                      onClick={() => setTargetStem(stem)}
                    >
                      {stem.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Intensity Selector */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Intensity</p>
                </div>
                <div className="flex gap-2">
                  {STYLE_INTENSITY_LEVELS.map((level) => (
                    <Button
                      key={level.value}
                      size="sm"
                      variant={intensity === level.value ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setIntensity(level.value)}
                    >
                      {level.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Apply Button */}
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              className="gap-2"
              disabled={processing}
              onClick={handleApplyStyle}
            >
              {processing ? (
                <>
                  <Wand2 className="h-5 w-5 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" /> Apply Style
                </>
              )}
            </Button>
          </div>

          {/* Before/After Comparison */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Preview Comparison</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={compareMode === "original" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setCompareMode("original")}
                >
                  ORIG
                </Button>
                <Button
                  size="sm"
                  variant={compareMode === "styled" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setCompareMode("styled")}
                >
                  STYLED
                </Button>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {compareMode === "original"
                    ? "Original mashup audio"
                    : `Styled with ${selectedPreset.name} signature`}
                </p>
                <div className="mt-2 h-12 rounded-md bg-muted/30 flex items-center justify-center">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1 rounded-full transition-all",
                          compareMode === "styled" ? "bg-primary" : "bg-muted-foreground/30",
                        )}
                        style={{ height: `${8 + Math.random() * 28}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Job History */}
      <div className="mt-10">
        <NeonSectionHeader title="Job History" description="Your recent style transfer jobs" />
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Palette className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No style transfers yet. Select a preset above to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {job.preset?.name ?? "Unknown Preset"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {job.target_stem?.replace("_", " ") ?? "full mix"} &middot;{" "}
                      {job.completed_at
                        ? new Date(job.completed_at).toLocaleDateString()
                        : "In progress"}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] uppercase tracking-wider",
                      job.status === "completed"
                        ? "text-green-400 border-green-400/30 bg-green-400/10"
                        : job.status === "processing"
                          ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                          : job.status === "failed"
                            ? "text-red-400 border-red-400/30 bg-red-400/10"
                            : "text-muted-foreground",
                    )}
                  >
                    {job.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </NeonPage>
  )
}

export default function StyleTransferPage() {
  return (
    <AuthGuard>
      <StyleTransferContent />
    </AuthGuard>
  )
}
