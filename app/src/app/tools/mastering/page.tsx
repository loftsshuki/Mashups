"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Wand2, BarChart3, Volume2, Gauge, Radio, CheckCircle, ArrowLeft } from "lucide-react"
import { NeonPage, NeonHero, NeonSectionHeader, NeonGrid } from "@/components/marketing/neon-page"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getSystemPresets,
  getMasteringJobs,
  analyzeAudio,
  TARGET_PLATFORMS,
} from "@/lib/data/ai-mastering"
import type { MasteringPreset, MasteringJob } from "@/lib/data/types"

export default function MasteringPage() {
  const [presets, setPresets] = useState<MasteringPreset[]>([])
  const [selectedPreset, setSelectedPreset] = useState<MasteringPreset | null>(null)
  const [analysis, setAnalysis] = useState<{
    lufs: number
    truePeak: number
    dynamicRange: number
    spectralBalance: Record<string, number>
  } | null>(null)
  const [jobs, setJobs] = useState<MasteringJob[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string>("Spotify")
  const [stereoWidth, setStereoWidth] = useState(100)
  const [masteringComplete, setMasteringComplete] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [presetsData, jobsData, analysisData] = await Promise.all([
          getSystemPresets(),
          getMasteringJobs("mock-user"),
          analyzeAudio("mock"),
        ])
        setPresets(presetsData)
        setJobs(jobsData)
        setAnalysis(analysisData)
        if (presetsData.length > 0) {
          setSelectedPreset(presetsData[0])
          setStereoWidth(presetsData[0].settings.stereoWidth ?? 100)
        }
      } catch {
        // Data functions already handle errors and return mock data
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  function handleSelectPreset(preset: MasteringPreset) {
    setSelectedPreset(preset)
    setStereoWidth(preset.settings.stereoWidth ?? 100)
    setMasteringComplete(false)
  }

  function handleMaster() {
    setIsProcessing(true)
    setMasteringComplete(false)
    setTimeout(() => {
      setIsProcessing(false)
      setMasteringComplete(true)
    }, 2000)
  }

  const outputLufs = selectedPreset?.settings.targetLufs ?? -14

  return (
    <AuthGuard>
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
          title="AI Mastering"
          description="Professional-grade mastering in one click. Optimize your mix for any platform with intelligent loudness targeting, EQ shaping, and dynamic processing."
        />

        {/* Stats Row */}
        <section className="mb-8">
          <NeonGrid className="grid-cols-2 md:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Volume2 className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Input LUFS</p>
                {loading ? (
                  <Skeleton className="mx-auto mt-1 h-7 w-16" />
                ) : (
                  <p className="text-xl font-bold">{analysis?.lufs ?? "--"}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Gauge className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Output LUFS</p>
                {loading ? (
                  <Skeleton className="mx-auto mt-1 h-7 w-16" />
                ) : (
                  <p className="text-xl font-bold">{outputLufs}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">True Peak</p>
                {loading ? (
                  <Skeleton className="mx-auto mt-1 h-7 w-16" />
                ) : (
                  <p className="text-xl font-bold">{analysis?.truePeak ?? "--"} dB</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Radio className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Dynamic Range</p>
                {loading ? (
                  <Skeleton className="mx-auto mt-1 h-7 w-16" />
                ) : (
                  <p className="text-xl font-bold">{analysis?.dynamicRange ?? "--"} dB</p>
                )}
              </CardContent>
            </Card>
          </NeonGrid>
        </section>

        {/* Preset Selector Grid */}
        <section className="mb-8">
          <NeonSectionHeader
            title="Mastering Presets"
            description="Choose a preset that matches your target sound"
          />
          {loading ? (
            <NeonGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </NeonGrid>
          ) : (
            <NeonGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {presets.map((preset) => (
                <Card
                  key={preset.id}
                  className={`cursor-pointer transition-colors hover:border-primary/50 ${
                    selectedPreset?.id === preset.id
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{preset.name}</CardTitle>
                      {selectedPreset?.id === preset.id && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {preset.genre}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {preset.settings.targetLufs} LUFS
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </NeonGrid>
          )}
        </section>

        {/* Platform Target Selector */}
        <section className="mb-8">
          <NeonSectionHeader
            title="Target Platform"
            description="Optimize loudness for your distribution target"
          />
          <div className="flex flex-wrap gap-2">
            {TARGET_PLATFORMS.map((platform) => (
              <Badge
                key={platform.name}
                variant={selectedPlatform === platform.name ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1.5 text-sm transition-colors ${
                  selectedPlatform === platform.name
                    ? ""
                    : "hover:bg-primary/10"
                }`}
                onClick={() => setSelectedPlatform(platform.name)}
              >
                {platform.name} ({platform.targetLufs} LUFS)
              </Badge>
            ))}
          </div>
        </section>

        {/* EQ Visualization */}
        <section className="mb-8">
          <NeonSectionHeader
            title="EQ Shape"
            description="3-band spectral balance visualization"
          />
          <Card>
            <CardContent className="p-6">
              {loading || !analysis ? (
                <Skeleton className="h-24 w-full rounded-lg" />
              ) : (
                <div className="flex items-end justify-center gap-8">
                  {(["low", "mid", "high"] as const).map((band) => {
                    const value = analysis.spectralBalance[band] ?? 0
                    const percentage = Math.round(value * 100)
                    const maxBarHeight = 96
                    const barHeight = Math.max(8, value * maxBarHeight * 2.5)
                    const colors: Record<string, string> = {
                      low: "bg-red-500/80",
                      mid: "bg-yellow-500/80",
                      high: "bg-blue-500/80",
                    }
                    return (
                      <div key={band} className="flex flex-col items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {percentage}%
                        </span>
                        <div className="flex h-24 items-end">
                          <div
                            className={`w-12 rounded-t-md ${colors[band]} transition-all`}
                            style={{ height: `${barHeight}px` }}
                          />
                        </div>
                        <span className="text-sm font-semibold capitalize">{band}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Stereo Width Slider */}
        <section className="mb-8">
          <NeonSectionHeader title="Stereo Width" />
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <span className="w-10 text-right text-sm text-muted-foreground">0%</span>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={stereoWidth}
                  onChange={(e) => setStereoWidth(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                />
                <span className="w-14 text-sm text-muted-foreground">200%</span>
              </div>
              <p className="mt-2 text-center text-lg font-bold">{stereoWidth}%</p>
            </CardContent>
          </Card>
        </section>

        {/* Compression Settings */}
        <section className="mb-8">
          <NeonSectionHeader title="Compression" description="Current preset compression settings" />
          <Card>
            <CardContent className="p-6">
              {selectedPreset?.settings.compression ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Threshold</p>
                    <p className="text-lg font-bold">
                      {selectedPreset.settings.compression.threshold} dB
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Ratio</p>
                    <p className="text-lg font-bold">
                      {selectedPreset.settings.compression.ratio}:1
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Attack</p>
                    <p className="text-lg font-bold">
                      {selectedPreset.settings.compression.attack} ms
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Release</p>
                    <p className="text-lg font-bold">
                      {selectedPreset.settings.compression.release} ms
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Select a preset to view compression settings
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Master Button */}
        <section className="mb-8">
          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              className="px-10 py-6 text-lg"
              onClick={handleMaster}
              disabled={isProcessing || !selectedPreset}
            >
              {isProcessing ? (
                <>
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Mastering...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Master This Track
                </>
              )}
            </Button>
            {masteringComplete && (
              <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-500">
                <CheckCircle className="h-4 w-4" />
                Mastering complete! Your track is ready.
              </div>
            )}
          </div>
        </section>

        {/* Job History */}
        <section>
          <NeonSectionHeader
            title="Mastering History"
            description="Your past mastering jobs"
          />
          {loading ? (
            <NeonGrid className="grid-cols-1">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </NeonGrid>
          ) : jobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No mastering jobs yet. Master your first track above!
                </p>
              </CardContent>
            </Card>
          ) : (
            <NeonGrid className="grid-cols-1">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {job.preset?.name ?? "Custom"}
                          </p>
                          <Badge
                            variant={
                              job.status === "completed" ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {job.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(job.created_at).toLocaleDateString()} at{" "}
                          {new Date(job.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      {job.analysis && (
                        <div className="flex gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">In</p>
                            <p className="font-medium">
                              {job.analysis.inputLufs} LUFS
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Out</p>
                            <p className="font-medium">
                              {job.analysis.outputLufs} LUFS
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Peak</p>
                            <p className="font-medium">
                              {job.analysis.truePeak} dB
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">DR</p>
                            <p className="font-medium">
                              {job.analysis.dynamicRange} dB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </NeonGrid>
          )}
        </section>
      </NeonPage>
    </AuthGuard>
  )
}
