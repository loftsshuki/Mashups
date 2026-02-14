"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Shuffle, Drum, Guitar, Mic, Music, Waves, Layers, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { NeonPage, NeonHero, NeonSectionHeader, NeonGrid } from "@/components/marketing/neon-page"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getStemSwapKits,
  getStemSwapJobs,
  STEM_TYPES,
  SWAP_GENRES,
} from "@/lib/data/stem-swap"
import type { StemSwapKit, StemSwapJob } from "@/lib/data/types"

const stemIcons: Record<string, React.ReactNode> = {
  drums: <Drum className="h-6 w-6" />,
  bass: <Waves className="h-6 w-6" />,
  vocals: <Mic className="h-6 w-6" />,
  synths: <Music className="h-6 w-6" />,
  guitar: <Guitar className="h-6 w-6" />,
  other: <Layers className="h-6 w-6" />,
}

const stemColors: Record<string, string> = {
  drums: "border-orange-500/50 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  bass: "border-blue-500/50 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  vocals: "border-pink-500/50 bg-pink-500/10 text-pink-500 hover:bg-pink-500/20",
  synths: "border-purple-500/50 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  guitar: "border-green-500/50 bg-green-500/10 text-green-500 hover:bg-green-500/20",
  other: "border-gray-500/50 bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
}

const stemColorsActive: Record<string, string> = {
  drums: "border-orange-500 bg-orange-500/20 text-orange-400 ring-2 ring-orange-500/30",
  bass: "border-blue-500 bg-blue-500/20 text-blue-400 ring-2 ring-blue-500/30",
  vocals: "border-pink-500 bg-pink-500/20 text-pink-400 ring-2 ring-pink-500/30",
  synths: "border-purple-500 bg-purple-500/20 text-purple-400 ring-2 ring-purple-500/30",
  guitar: "border-green-500 bg-green-500/20 text-green-400 ring-2 ring-green-500/30",
  other: "border-gray-500 bg-gray-500/20 text-gray-400 ring-2 ring-gray-500/30",
}

type ProcessingStage = "idle" | "analyzing" | "transferring" | "done"

function StemSwapContent() {
  const [kits, setKits] = useState<StemSwapKit[]>([])
  const [jobs, setJobs] = useState<StemSwapJob[]>([])
  const [selectedStem, setSelectedStem] = useState<string | null>(null)
  const [genreFilter, setGenreFilter] = useState<string | null>(null)
  const [processing, setProcessing] = useState<ProcessingStage>("idle")
  const [activeKit, setActiveKit] = useState<StemSwapKit | null>(null)
  const [previewMode, setPreviewMode] = useState<"original" | "swapped">("original")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [allKits, allJobs] = await Promise.all([
        getStemSwapKits(),
        getStemSwapJobs("mock-user"),
      ])
      setKits(allKits)
      setJobs(allJobs)
      setLoading(false)
    }
    load()
  }, [])

  const filteredKits = kits.filter((kit) => {
    if (selectedStem && kit.stem_type !== selectedStem) return false
    if (genreFilter && kit.genre !== genreFilter) return false
    return true
  })

  const handleSwap = async (kit: StemSwapKit) => {
    setActiveKit(kit)
    setProcessing("analyzing")

    await new Promise((resolve) => setTimeout(resolve, 800))
    setProcessing("transferring")

    await new Promise((resolve) => setTimeout(resolve, 1700))
    setProcessing("done")
    setPreviewMode("swapped")
  }

  const handleReset = () => {
    setProcessing("idle")
    setActiveKit(null)
    setPreviewMode("original")
  }

  if (loading) {
    return (
      <NeonPage>
        <Skeleton className="h-48 rounded-xl" />
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </NeonPage>
    )
  }

  return (
    <NeonPage>
      <Link
        href="/tools"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tools
      </Link>
      <NeonHero
        eyebrow="AI Tools"
        title="Smart Stem Swapping"
        description="Replace any stem with genre-matched alternatives powered by AI"
      />

      {/* Processing overlay */}
      {processing !== "idle" && processing !== "done" && (
        <div className="mb-8 rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shuffle className="h-8 w-8 text-primary animate-spin" style={{ animationDuration: "2s" }} />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {processing === "analyzing" ? "Analyzing stem patterns..." : "Transferring style..."}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {processing === "analyzing"
              ? "Extracting timing, dynamics, and tonal characteristics"
              : `Applying ${activeKit?.name} to your track`}
          </p>
          <div className="mx-auto max-w-xs">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: processing === "analyzing" ? "35%" : "80%" }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span className={cn(processing === "analyzing" ? "text-primary font-medium" : "text-muted-foreground")}>
                Analyzing
              </span>
              <span className={cn(processing === "transferring" ? "text-primary font-medium" : "text-muted-foreground")}>
                Transferring
              </span>
              <span className="text-muted-foreground">Done</span>
            </div>
          </div>
        </div>
      )}

      {/* Done state with before/after toggle */}
      {processing === "done" && activeKit && (
        <div className="mb-8 rounded-2xl border border-green-500/30 bg-green-500/5 p-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h3 className="text-lg font-semibold text-green-500">Swap Complete</h3>
          </div>
          <p className="text-center text-sm text-muted-foreground mb-6">
            Successfully swapped {selectedStem} with {activeKit.name}
          </p>

          {/* Before/After toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-full border border-border p-1">
              <button
                onClick={() => setPreviewMode("original")}
                className={cn(
                  "rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
                  previewMode === "original"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                ORIGINAL
              </button>
              <button
                onClick={() => setPreviewMode("swapped")}
                className={cn(
                  "rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
                  previewMode === "swapped"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                SWAPPED
              </button>
            </div>
          </div>

          {/* Audio preview placeholder */}
          <div className="mx-auto max-w-md rounded-xl border border-border/50 bg-background/50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                {previewMode === "original" ? (
                  <Music className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Shuffle className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {previewMode === "original" ? "Original" : activeKit.name}
                </p>
                <div className="mt-1 h-1.5 rounded-full bg-muted">
                  <div className="h-full w-1/3 rounded-full bg-primary/60" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <Button variant="outline" onClick={handleReset}>
              Try Another
            </Button>
            <Button>Download Swapped Stem</Button>
          </div>
        </div>
      )}

      {/* Step 1: Select target stem */}
      {processing === "idle" && (
        <>
          <NeonSectionHeader
            title="1. Select Target Stem"
            description="Choose which stem you want to replace"
          />

          <NeonGrid className="grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-10">
            {STEM_TYPES.map((stem) => (
              <button
                key={stem}
                onClick={() => setSelectedStem(selectedStem === stem ? null : stem)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-5 transition-all cursor-pointer",
                  selectedStem === stem
                    ? stemColorsActive[stem]
                    : stemColors[stem],
                )}
              >
                {stemIcons[stem]}
                <span className="text-sm font-medium capitalize">{stem}</span>
              </button>
            ))}
          </NeonGrid>
        </>
      )}

      {/* Step 2: Browse kits */}
      {processing === "idle" && selectedStem && (
        <>
          <NeonSectionHeader
            title="2. Choose a Kit"
            description={`Browse ${selectedStem} replacement kits`}
          />

          {/* Genre filter bar */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge
              variant={genreFilter === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setGenreFilter(null)}
            >
              All Genres
            </Badge>
            {SWAP_GENRES.map((genre) => (
              <Badge
                key={genre}
                variant={genreFilter === genre ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setGenreFilter(genreFilter === genre ? null : genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>

          {filteredKits.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-muted/30 p-8 text-center">
              <Layers className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No kits found for this combination. Try a different genre or stem type.
              </p>
            </div>
          ) : (
            <NeonGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-10">
              {filteredKits.map((kit) => (
                <Card key={kit.id} className="overflow-hidden hover:border-primary/40 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{kit.name}</h3>
                        <Badge variant="outline" className="mt-1 text-[10px] uppercase tracking-wider">
                          {kit.genre}
                        </Badge>
                      </div>
                      <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", stemColors[kit.stem_type])}>
                        {stemIcons[kit.stem_type]}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {kit.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {kit.bpm_range_min}&ndash;{kit.bpm_range_max} BPM
                      </span>
                      <Button size="sm" className="gap-1.5" onClick={() => handleSwap(kit)}>
                        <Shuffle className="h-3.5 w-3.5" />
                        Swap
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </NeonGrid>
          )}
        </>
      )}

      {/* Job history */}
      {processing === "idle" && (
        <>
          <NeonSectionHeader
            title="Swap History"
            description="Your recent stem swap jobs"
          />

          {jobs.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-muted/30 p-8 text-center">
              <Shuffle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No swap jobs yet. Select a stem and kit above to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center gap-4 rounded-xl border border-border/70 bg-background/50 px-4 py-3"
                >
                  <div className={cn("h-10 w-10 shrink-0 rounded-lg flex items-center justify-center", stemColors[job.target_stem])}>
                    {stemIcons[job.target_stem]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {job.kit?.name ?? "Unknown Kit"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {job.target_stem} swap &middot;{" "}
                      {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={job.status === "completed" ? "default" : "outline"}
                      className={cn(
                        "text-[10px] uppercase tracking-wider",
                        job.status === "completed" && "bg-green-500/10 text-green-500 border-green-500/30",
                      )}
                    >
                      {job.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {job.status}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </NeonPage>
  )
}

export default function StemSwapPage() {
  return (
    <AuthGuard>
      <StemSwapContent />
    </AuthGuard>
  )
}
