"use client"

import { useState, useCallback, useTransition, Suspense, useEffect, lazy } from "react"
import { Upload, Sliders, Share2, Check, Music, ArrowLeft, ArrowRight, Wand2, Sparkles, ImageIcon, FileText, Music2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UploadZone } from "@/components/create/upload-zone"
import { TrackList, type UploadedTrack } from "@/components/create/track-list"
import { MixerControls } from "@/components/create/mixer-controls"
import { PublishForm } from "@/components/create/publish-form"
import { StemUploadZone, StemList, type StemUploadResult, type SeparatedStems } from "@/components/create/stem-upload-zone"
import { StemMixer } from "@/components/create/stem-mixer"
import { TimelineEditor } from "@/components/create/timeline-editor"
import { SmartMatchPanel } from "@/components/create/smart-match-panel"
import { AutomationLane } from "@/components/create/automation-lane"
import { PlatformExport } from "@/components/create/platform-export"
import { HookGenerator } from "@/components/create/hook-generator"
import type { TimelineTrack, TimelineClip } from "@/components/create/waveform-timeline"
import type { AutomationNode } from "@/lib/audio/automation"
import { useBeatAnalysis } from "@/lib/hooks/use-beat-analysis"
import { uploadAudio } from "@/lib/storage/upload"
import { createMashup } from "@/lib/data/mashups-mutations"
import type { MockMashup } from "@/lib/mock-data"

// Phase 3: Lazy load export components
const AttributionEditor = lazy(() => import("@/components/attribution/attribution-editor").then(m => ({ default: m.AttributionEditor })))
const CaptionEditor = lazy(() => import("@/components/captions/caption-editor").then(m => ({ default: m.CaptionEditor })))
const ThumbnailCreator = lazy(() => import("@/components/thumbnail/thumbnail-creator").then(m => ({ default: m.ThumbnailCreator }))
import type { AttributionSource } from "@/lib/data/attribution"
import type { GeneratedCaptions, GeneratedThumbnail } from "@/lib/data/thumbnail-generator"

const steps = [
  {
    number: 1,
    title: "Upload Tracks",
    description: "Add tracks and separate stems",
    icon: Upload,
  },
  {
    number: 2,
    title: "Mix & Arrange",
    description: "Adjust levels and blend stems",
    icon: Sliders,
  },
  {
    number: 3,
    title: "Publish",
    description: "Share your mashup with the community",
    icon: Share2,
  },
]

interface MixerTrackState {
  name: string
  volume: number
  muted: boolean
  solo: boolean
}

interface TrackWithStems extends UploadedTrack {
  stems?: SeparatedStems
  isProcessingStems?: boolean
  stemError?: string
}

function CreatePageContent() {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [tracks, setTracks] = useState<TrackWithStems[]>([])
  const [mixerTracks, setMixerTracks] = useState<MixerTrackState[]>([])
  const [previewMessage, setPreviewMessage] = useState("")
  const [forkedFrom, setForkedFrom] = useState<MockMashup | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedStemTrack, setSelectedStemTrack] = useState<number | null>(null)
  const [timelineTracks, setTimelineTracks] = useState<TimelineTrack[]>([])
  const [timelinePlayhead, setTimelinePlayhead] = useState(0)
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false)
  const [automationNodes, setAutomationNodes] = useState<AutomationNode[]>([])

  // Phase 3: Export flow state
  const [attributionSources, setAttributionSources] = useState<AttributionSource[]>([])
  const [generatedCaptions, setGeneratedCaptions] = useState<GeneratedCaptions | null>(null)
  const [generatedThumbnail, setGeneratedThumbnail] = useState<GeneratedThumbnail | null>(null)
  const [activeExportTab, setActiveExportTab] = useState<"attribution" | "captions" | "thumbnail">("attribution")

  // Beat analysis for first track
  const firstTrack = tracks[0]
  const { analysis: beatAnalysis } = useBeatAnalysis(
    firstTrack?.uploadedUrl || null
  )

  const forkId = searchParams.get("fork")
  const challengeId = searchParams.get("challenge") ?? undefined

  useEffect(() => {
    let cancelled = false

    async function loadForkData(id: string) {
      const response = await fetch(`/api/mashups/${id}/summary`, { cache: "no-store" })
      if (!response.ok) return
      const payload = (await response.json()) as { mashup?: MockMashup }
      if (!cancelled) {
        setForkedFrom(payload.mashup ?? null)
      }
    }

    if (forkId) {
      void loadForkData(forkId)
    } else {
      setForkedFrom(null)
    }

    return () => {
      cancelled = true
    }
  }, [forkId])

  // ---------------------------------------------------------------------------
  // Step 1: Upload handlers (with stem separation)
  // ---------------------------------------------------------------------------

  const handleStemResults = useCallback((results: StemUploadResult[]) => {
    setTracks((prev) => {
      // Merge new results with existing tracks
      const updated = [...prev]
      
      results.forEach((result) => {
        const existingIndex = updated.findIndex(
          (t) => t.file === result.file && t.name === result.name
        )
        
        if (existingIndex >= 0) {
          // Update existing track
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...result,
          }
        } else {
          // Add new track with default uploadProgress
          updated.push({
            ...result,
            uploadProgress: result.uploadProgress ?? 100,
          })
        }
      })
      
      return updated
    })
  }, [])

  const handleFilesAdded = useCallback(async (files: File[]) => {
    // Add each file to the track list with 0 progress
    const newTracks: TrackWithStems[] = files.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      uploadProgress: 0,
    }))

    setTracks((prev) => [...prev, ...newTracks])

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Simulate progress stages before actual upload
      setTracks((prev) => {
        const idx = prev.findIndex(
          (t) => t.file === file && t.uploadProgress === 0
        )
        if (idx === -1) return prev
        const updated = [...prev]
        updated[idx] = { ...updated[idx], uploadProgress: 30 }
        return updated
      })

      const formData = new FormData()
      formData.set("file", file)

      // Try to get audio duration
      let duration: number | undefined
      try {
        const objectUrl = URL.createObjectURL(file)
        const audio = new Audio(objectUrl)
        duration = await new Promise<number>((resolve) => {
          audio.addEventListener("loadedmetadata", () => {
            resolve(audio.duration)
            URL.revokeObjectURL(objectUrl)
          })
          audio.addEventListener("error", () => {
            resolve(0)
            URL.revokeObjectURL(objectUrl)
          })
          // Timeout after 5s
          setTimeout(() => {
            resolve(0)
            URL.revokeObjectURL(objectUrl)
          }, 5000)
        })
      } catch {
        duration = undefined
      }

      setTracks((prev) => {
        const idx = prev.findIndex(
          (t) => t.file === file && t.uploadProgress < 100
        )
        if (idx === -1) return prev
        const updated = [...prev]
        updated[idx] = { ...updated[idx], uploadProgress: 60 }
        return updated
      })

      const result = await uploadAudio(formData)

      setTracks((prev) => {
        const idx = prev.findIndex(
          (t) => t.file === file && t.uploadProgress < 100
        )
        if (idx === -1) return prev
        const updated = [...prev]
        if ("url" in result) {
          updated[idx] = {
            ...updated[idx],
            uploadProgress: 100,
            uploadedUrl: result.url,
            duration,
          }
        } else {
          // Upload failed — remove the track
          updated.splice(idx, 1)
        }
        return updated
      })
    }
  }, [])

  const handleRemoveTrack = useCallback((index: number) => {
    setTracks((prev) => prev.filter((_, i) => i !== index))
    if (selectedStemTrack === index) {
      setSelectedStemTrack(null)
    }
  }, [selectedStemTrack])

  // Build timeline tracks from stems AND regular tracks
  useEffect(() => {
    const newTimelineTracks: TimelineTrack[] = []
    
    tracks.forEach((track, trackIndex) => {
      if (track.stems) {
        // Create a track for each stem type
        const stemTypes: (keyof SeparatedStems)[] = ["vocals", "drums", "bass", "other"]
        const stemColors = {
          vocals: "#ec4899", // pink-500
          drums: "#f59e0b",  // amber-500
          bass: "#10b981",   // emerald-500
          other: "#3b82f6",  // blue-500
        }
        const stemNames = {
          vocals: "Vocals",
          drums: "Drums",
          bass: "Bass",
          other: "Other",
        }
        
        stemTypes.forEach((stemType) => {
          const clip: TimelineClip = {
            id: `clip-${trackIndex}-${stemType}`,
            trackId: `track-${trackIndex}-${stemType}`,
            name: `${track.name.replace(/\.[^.]+$/, "")} - ${stemNames[stemType]}`,
            audioUrl: track.stems![stemType],
            startTime: 0,
            duration: track.duration || 180,
            offset: 0,
            color: stemColors[stemType],
            volume: 80,
            muted: false,
          }
          
          newTimelineTracks.push({
            id: `track-${trackIndex}-${stemType}`,
            name: stemNames[stemType],
            type: "stem",
            stemType: stemType,
            clips: [clip],
            height: 80,
            color: stemColors[stemType],
          })
        })
      } else if (track.uploadedUrl) {
        // Regular track without stems - add as single track
        const colors = ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b", "#10b981"]
        const color = colors[trackIndex % colors.length]
        
        const clip: TimelineClip = {
          id: `clip-${trackIndex}-full`,
          trackId: `track-${trackIndex}-full`,
          name: track.name.replace(/\.[^.]+$/, ""),
          audioUrl: track.uploadedUrl,
          startTime: 0,
          duration: track.duration || 180,
          offset: 0,
          color: color,
          volume: 80,
          muted: false,
        }
        
        newTimelineTracks.push({
          id: `track-${trackIndex}-full`,
          name: track.name.replace(/\.[^.]+$/, ""),
          type: "audio",
          clips: [clip],
          height: 80,
          color: color,
        })
      }
    })
    
    setTimelineTracks(newTimelineTracks)
  }, [tracks])

  // ---------------------------------------------------------------------------
  // Step 2: Mixer handlers
  // ---------------------------------------------------------------------------

  const initMixerTracks = useCallback(() => {
    setMixerTracks(
      tracks.map((t) => ({
        name: t.name.replace(/\.[^.]+$/, ""), // strip extension
        volume: 80,
        muted: false,
        solo: false,
      }))
    )
  }, [tracks])

  const handleVolumeChange = useCallback((index: number, volume: number) => {
    setMixerTracks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, volume } : t))
    )
  }, [])

  const handleMuteToggle = useCallback((index: number) => {
    setMixerTracks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, muted: !t.muted } : t))
    )
  }, [])

  const handleSoloToggle = useCallback((index: number) => {
    setMixerTracks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, solo: !t.solo } : t))
    )
  }, [])

  const handlePreview = useCallback(() => {
    setPreviewMessage(
      "Real-time audio mixing is coming in a future update. For now, your volume and mute settings will be saved with the mashup metadata."
    )
    setTimeout(() => setPreviewMessage(""), 5000)
  }, [])

  // ---------------------------------------------------------------------------
  // Step 3: Publish handler
  // ---------------------------------------------------------------------------

  const handlePublish = useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        await createMashup(null, formData)
      })
    },
    []
  )

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const uploadedCount = tracks.filter((t) => t.uploadProgress === 100).length
  const canProceedStep1 = uploadedCount >= 1 // Changed to 1 since we can remix stems
  const canProceedStep2 = true

  const goToStep = useCallback(
    (step: number) => {
      if (step === 2 && currentStep === 1) {
        initMixerTracks()
      }
      setCurrentStep(step)
    },
    [currentStep, initMixerTracks]
  )

  // Compute first uploaded audio URL and total duration for publish form
  const firstAudioUrl =
    tracks.find((t) => t.uploadedUrl)?.uploadedUrl ?? ""
  const totalDuration = tracks.reduce(
    (sum, t) => sum + (t.duration ?? 0),
    0
  )

  // Count tracks with stems
  const tracksWithStems = tracks.filter((t) => t.stems && !t.isProcessingStems).length
  const tracksProcessingStems = tracks.filter((t) => t.isProcessingStems).length

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Page header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create a Mashup
        </h1>
        <p className="mt-2 text-muted-foreground">
          Blend tracks together and make something new
        </p>
      </div>

      {/* Step indicator */}
      <div className="mx-auto mb-12 max-w-3xl">
        <div className="flex items-start justify-between">
          {steps.map((step, i) => {
            const isActive = step.number === currentStep
            const isCompleted = step.number < currentStep
            return (
              <div
                key={step.number}
                className="flex flex-1 flex-col items-center text-center"
              >
                <div className="relative flex flex-col items-center">
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        "absolute top-6 left-[calc(50%+24px)] h-px w-[calc(100%+48px)] sm:w-[calc(100%+80px)]",
                        isCompleted ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                  {/* Step circle */}
                  <div
                    className={cn(
                      "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors",
                      isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : isActive
                          ? "border-primary bg-card text-primary"
                          : "border-primary/30 bg-card text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <p
                    className={cn(
                      "mt-3 text-sm font-semibold",
                      isActive || isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="mt-1 max-w-[140px] text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Generator Promo */}
      <div className="mx-auto max-w-2xl mb-8">
        <Link href="/create/ai">
          <div className="p-4 rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-purple-500/5 hover:border-primary/50 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Try AI Mashup Generator</h3>
                <p className="text-sm text-muted-foreground">
                  Upload tracks and let AI create a complete mashup automatically
                </p>
              </div>
              <Button variant="outline" size="sm">
                Try Now
              </Button>
            </div>
          </div>
        </Link>
      </div>

      {/* Step content */}
      <div className="mx-auto max-w-2xl">
        {/* ----------------------------------------------------------------- */}
        {/* Step 1: Upload Tracks */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <StemUploadZone onFilesAdded={handleStemResults} />

            {/* Legacy upload option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or upload without stem separation
                </span>
              </div>
            </div>

            <UploadZone onFilesAdded={handleFilesAdded} />

            <TrackList tracks={tracks} onRemove={handleRemoveTrack} />

            {/* Show stem status */}
            {(tracksWithStems > 0 || tracksProcessingStems > 0) && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <Wand2 className="h-4 w-4 text-primary" />
                  <span className="font-medium">AI Stem Separation</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tracksWithStems} track{tracksWithStems !== 1 ? "s" : ""} with separated stems
                  {tracksProcessingStems > 0 && (
                    <>, {tracksProcessingStems} processing...</>
                  )}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Go to Step 2 to remix individual stems (vocals, drums, bass, other)
                </p>
              </div>
            )}

            {uploadedCount < 1 && (
              <p className="text-center text-sm text-muted-foreground">
                Add at least {1 - uploadedCount} more track
                {1 - uploadedCount > 1 ? "s" : ""} to continue
              </p>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Step 2: Mix & Arrange */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Stem Mixer for tracks with stems */}
            {tracksWithStems > 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Stem Mixer
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select a track to remix its individual stems
                  </p>
                </div>

                {/* Track selector */}
                <div className="flex flex-wrap gap-2">
                  {tracks.map((track, index) =>
                    track.stems ? (
                      <Button
                        key={index}
                        variant={selectedStemTrack === index ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setSelectedStemTrack(index)}
                      >
                        <Wand2 className="mr-2 h-3 w-3" />
                        {track.name.replace(/\.[^.]+$/, "")}
                      </Button>
                    ) : null
                  )}
                </div>

                {/* Stem mixer for selected track */}
                {selectedStemTrack !== null && tracks[selectedStemTrack]?.stems && (
                  <StemMixer
                    stems={tracks[selectedStemTrack].stems!}
                    trackName={tracks[selectedStemTrack].name}
                  />
                )}

                {selectedStemTrack === null && tracksWithStems > 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    Select a track above to open its stem mixer
                  </p>
                )}

                {/* Smart Match Panel - Shows for ANY uploaded tracks */}
                {tracks.length > 0 && (
                  <SmartMatchPanel
                    primaryTrackUrl={tracks[0]?.uploadedUrl || null}
                    secondaryTrackUrls={tracks
                      .filter((t) => t.uploadedUrl && t !== tracks[0])
                      .map((t) => t.uploadedUrl!)}
                  />
                )}

                {/* Timeline Editor - Shows for ALL tracks */}
                {timelineTracks.length > 0 && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-semibold">🎚️ Timeline Editor</h3>
                      <p className="text-xs text-muted-foreground">
                        Drag, trim, and arrange audio on the timeline. Click clips to select, drag edges to trim.
                      </p>
                      {beatAnalysis && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Beat grid: {beatAnalysis.bpm.bpm} BPM
                        </p>
                      )}
                    </div>
                    <TimelineEditor
                      tracks={timelineTracks}
                      totalDuration={Math.max(
                        ...tracks
                          .filter((t) => t.duration)
                          .map((t) => t.duration || 180),
                        60
                      )}
                      bpm={beatAnalysis?.bpm.bpm || 120}
                      beatOffset={beatAnalysis?.bpm.offset || 0}
                      onTracksChange={setTimelineTracks}
                      onPlayheadChange={setTimelinePlayhead}
                      currentTime={timelinePlayhead}
                      isPlaying={isTimelinePlaying}
                      onPlayPause={() => setIsTimelinePlaying((p) => !p)}
                    />
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or mix full tracks
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Track Mixer
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Adjust volume levels and mute/solo individual tracks
              </p>
            </div>

            <MixerControls
              tracks={mixerTracks}
              onVolumeChange={handleVolumeChange}
              onMuteToggle={handleMuteToggle}
              onSoloToggle={handleSoloToggle}
            />

            <div className="flex justify-center">
              <Button variant="outline" onClick={handlePreview}>
                <Music className="h-4 w-4" />
                Preview Mix
              </Button>
            </div>

            {previewMessage && (
              <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
                {previewMessage}
              </div>
            )}

            {/* Volume Automation */}
            <div className="pt-6 border-t border-border/50">
              <h3 className="text-base font-semibold mb-1">Volume Automation</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Create fades and volume changes over time
              </p>
              <AutomationLane
                nodes={automationNodes}
                duration={totalDuration}
                onNodesChange={setAutomationNodes}
                color="#ec4899"
              />
            </div>

            {/* AI Hook Generator */}
            <div className="pt-6 border-t border-border/50">
              <HookGenerator
                audioUrl={firstAudioUrl}
                totalDuration={totalDuration}
                onSelectHook={(start, duration) => {
                  // Could use this to set export region
                  console.log("Selected hook:", start, duration)
                }}
              />
            </div>

            {/* Platform Export */}
            <div className="pt-6 border-t border-border/50">
              <PlatformExport
                audioUrl={firstAudioUrl}
                totalDuration={totalDuration}
                onExport={(settings) => {
                  console.log("Export settings:", settings)
                }}
              />
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Step 3: Publish */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Publish Your Mashup
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add details and share your creation with the community
              </p>
              {forkedFrom && (
                <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground">
                  Forking from: <span className="font-medium">{forkedFrom.title}</span>
                </div>
              )}
            </div>

            <PublishForm
              audioUrl={firstAudioUrl}
              duration={Math.round(totalDuration)}
              onPublish={handlePublish}
              isPending={isPending}
              initialTitle={forkedFrom ? `${forkedFrom.title} (Fork)` : ""}
              initialDescription={
                forkedFrom
                  ? `Forked from "${forkedFrom.title}" by ${forkedFrom.creator.displayName}.`
                  : ""
              }
              initialGenre={forkedFrom?.genre ?? ""}
              initialBpm={forkedFrom ? String(forkedFrom.bpm) : ""}
              initialSourceTracks={forkedFrom?.sourceTracks}
              forkParentId={forkedFrom?.id}
              challengeId={challengeId}
            />
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="mx-auto mt-8 flex max-w-2xl items-center justify-between">
        {currentStep > 1 ? (
          <Button
            variant="outline"
            onClick={() => goToStep(currentStep - 1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {currentStep < 3 && (
          <Button
            onClick={() => goToStep(currentStep + 1)}
            disabled={
              (currentStep === 1 && !canProceedStep1) ||
              (currentStep === 2 && !canProceedStep2)
            }
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
          <p className="text-sm text-muted-foreground">Loading creator workspace...</p>
        </div>
      }
    >
      <CreatePageContent />
    </Suspense>
  )
}
