"use client"

import { useState, useCallback, useTransition, Suspense, useEffect } from "react"
import { Upload, Sliders, Share2, Check, ArrowLeft, ArrowRight, Wand2, Sparkles, Repeat2, BrainCircuit, Dices, Timer } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UploadZone } from "@/components/create/upload-zone"
import { TrackList, type UploadedTrack } from "@/components/create/track-list"
import { MixerControls } from "@/components/create/mixer-controls"
import { PublishForm } from "@/components/create/publish-form"
import { StemUploadZone, type StemUploadResult, type SeparatedStems } from "@/components/create/stem-upload-zone"
import { StemMixer } from "@/components/create/stem-mixer"
import { TimelineEditor } from "@/components/create/timeline-editor"
import { SmartMatchPanel } from "@/components/create/smart-match-panel"
import { AutomationLane } from "@/components/create/automation-lane"
import { PlatformExport } from "@/components/create/platform-export"
import { HookGenerator } from "@/components/create/hook-generator"
import { AuthGuard } from "@/components/auth/auth-guard"
import { CopilotPanel } from "@/components/ai/copilot-panel"
import { StemGenerator } from "@/components/ai/stem-generator"
import { GhostCollaborator } from "@/components/ai/ghost-collaborator"
import type { TimelineTrack, TimelineClip } from "@/components/create/waveform-timeline"
import type { AutomationNode } from "@/lib/audio/automation"
import { useBeatAnalysis } from "@/lib/hooks/use-beat-analysis"
import { useStemEngine } from "@/lib/hooks/use-stem-engine"
import { uploadAudio } from "@/lib/storage/upload"
import { createMashup } from "@/lib/data/mashups-mutations"
import type { MockMashup } from "@/lib/mock-data"

const steps = [
  {
    number: 1,
    title: "Source",
    description: "Upload a track or choose a pack",
    icon: Upload,
  },
  {
    number: 2,
    title: "Shape",
    description: "Cut hooks and tune the mix",
    icon: Sliders,
  },
  {
    number: 3,
    title: "Campaign",
    description: "Prove rights, caption, and export",
    icon: Share2,
  },
]

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AutoMashupGenerator } from "@/components/ai-mashup/auto-mashup"
import { RouletteSpinner } from "@/components/roulette/roulette-spinner"
import { CountdownTimer } from "@/components/roulette/countdown-timer"

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
  localBlobUrl?: string // browser blob URL for local playback
}

function CreatePageContent() {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [tracks, setTracks] = useState<TrackWithStems[]>([])
  const [mixerTracks, setMixerTracks] = useState<MixerTrackState[]>([])
  const [forkedFrom, setForkedFrom] = useState<MockMashup | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedStemTrack, setSelectedStemTrack] = useState<number | null>(null)
  const [timelineTracks, setTimelineTracks] = useState<TimelineTrack[]>([])
  const [timelinePlayhead, setTimelinePlayhead] = useState(0)
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false)
  const [automationNodes, setAutomationNodes] = useState<AutomationNode[]>([])

  const [copilotOpen, setCopilotOpen] = useState(false)
  const [ghostOpen, setGhostOpen] = useState(false)

  // Audio engine for real-time multi-track playback
  const stemEngine = useStemEngine()

  // Beat analysis for first track — use local blob URL (instant, no network)
  // Never pass placeholder URLs (they 404 and cause decode errors)
  const firstTrack = tracks[0]
  const beatAnalysisUrl = firstTrack?.localBlobUrl || null
  const { analysis: beatAnalysis } = useBeatAnalysis(beatAnalysisUrl)

  const forkId = searchParams.get("fork")
  const remixId = searchParams.get("remix")
  const challengeId = searchParams.get("challenge") ?? undefined
  const [remixSource, setRemixSource] = useState<{ title: string; creator: string } | null>(null)

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

  // Remix: load stems from an existing mashup
  useEffect(() => {
    let cancelled = false

    async function loadRemixStems(id: string) {
      try {
        const response = await fetch(`/api/remix/load?mashupId=${encodeURIComponent(id)}`)
        if (!response.ok) return
        const data = (await response.json()) as {
          mashupTitle?: string
          creatorName?: string
          stems?: Array<{ title: string; audio_url: string; instrument?: string; duration_ms?: number }>
        }
        if (cancelled || !data.stems) return

        setRemixSource({ title: data.mashupTitle ?? "Remix", creator: data.creatorName ?? "" })

        // Convert stems to tracks for the timeline
        const stemTracks: TrackWithStems[] = data.stems.map((stem) => ({
          file: new File([], stem.title),
          name: stem.title,
          size: 0,
          uploadProgress: 100,
          uploadedUrl: stem.audio_url,
          duration: stem.duration_ms ? stem.duration_ms / 1000 : 30,
        }))

        setTracks(stemTracks)
      } catch {
        // Failed to load remix data
      }
    }

    if (remixId) {
      void loadRemixStems(remixId)
    }

    return () => {
      cancelled = true
    }
  }, [remixId])

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

      // Create a persistent browser blob URL for local playback
      // (StemEngine uses this instead of the server upload URL)
      const localBlobUrl = URL.createObjectURL(file)

      // Get audio duration from the local blob
      let duration: number | undefined
      try {
        const audio = new Audio(localBlobUrl)
        duration = await new Promise<number>((resolve) => {
          audio.addEventListener("loadedmetadata", () => {
            resolve(audio.duration)
          })
          audio.addEventListener("error", () => {
            resolve(0)
          })
          setTimeout(() => resolve(0), 5000)
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

      // Try client-side upload first (bypasses serverless body size limit)
      let uploadedUrl = ""
      try {
        const { upload } = await import("@vercel/blob/client")
        const blob = await upload(
          `audio/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
          file,
          {
            access: "public",
            handleUploadUrl: "/api/upload/client-token",
          }
        )
        uploadedUrl = blob.url
      } catch {
        // Client upload failed — fall back to server action
        const result = await uploadAudio(formData)
        if ("url" in result) {
          uploadedUrl = result.url
        }
      }

      setTracks((prev) => {
        const idx = prev.findIndex(
          (t) => t.file === file && t.uploadProgress < 100
        )
        if (idx === -1) return prev
        const updated = [...prev]
        if (uploadedUrl) {
          updated[idx] = {
            ...updated[idx],
            uploadProgress: 100,
            uploadedUrl,
            localBlobUrl,
            duration,
          }
        } else {
          // Both uploads failed — still keep the track with localBlobUrl for local playback
          updated[idx] = {
            ...updated[idx],
            uploadProgress: 100,
            uploadedUrl: "",
            localBlobUrl,
            duration,
          }
        }
        return updated
      })
    }
  }, [])

  const handleRemoveTrack = useCallback((index: number) => {
    setTracks((prev) => {
      const track = prev[index]
      if (track?.localBlobUrl) URL.revokeObjectURL(track.localBlobUrl)
      return prev.filter((_, i) => i !== index)
    })
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
      } else if (track.uploadedUrl || track.localBlobUrl) {
        // Regular track without stems - add as single track
        const colors = ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b", "#10b981"]
        const color = colors[trackIndex % colors.length]

        const clip: TimelineClip = {
          id: `clip-${trackIndex}-full`,
          trackId: `track-${trackIndex}-full`,
          name: track.name.replace(/\.[^.]+$/, ""),
          audioUrl: track.localBlobUrl || track.uploadedUrl!,
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
    // Sync to audio engine
    const engineTracks = stemEngine.tracks
    if (engineTracks[index]) {
      stemEngine.setVolume(engineTracks[index].id, volume / 100) // UI is 0-100, engine is 0-1
    }
  }, [stemEngine])

  const handleMuteToggle = useCallback((index: number) => {
    setMixerTracks((prev) => {
      const next = prev.map((t, i) => (i === index ? { ...t, muted: !t.muted } : t))
      const engineTracks = stemEngine.tracks
      if (engineTracks[index]) {
        stemEngine.setMuted(engineTracks[index].id, next[index].muted)
      }
      return next
    })
  }, [stemEngine])

  const handleSoloToggle = useCallback((index: number) => {
    setMixerTracks((prev) => {
      const next = prev.map((t, i) => (i === index ? { ...t, solo: !t.solo } : t))
      const engineTracks = stemEngine.tracks
      if (engineTracks[index]) {
        stemEngine.setSolo(engineTracks[index].id, next[index].solo)
      }
      return next
    })
  }, [stemEngine])

  // ---------------------------------------------------------------------------
  // Step 3: Publish handler
  // ---------------------------------------------------------------------------

  const handlePublish = useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        // Export the mix to WAV if engine has tracks loaded
        const wavBlob = await stemEngine.exportWav()

        if (wavBlob) {
          // Upload the mixed WAV
          const uploadForm = new FormData()
          uploadForm.append("file", new File([wavBlob], "mashup-mix.wav", { type: "audio/wav" }))
          const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm })
          const { url } = await uploadRes.json()

          if (url) {
            formData.set("audio_url", url)
          }
        }

        await createMashup(null, formData)
      })
    },
    [stemEngine]
  )

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const uploadedCount = tracks.filter((t) => t.uploadProgress === 100).length
  const canProceedStep1 = uploadedCount >= 1 // Changed to 1 since we can remix stems
  const canProceedStep2 = true

  const goToStep = useCallback(
    async (step: number) => {
      if (step === 2 && currentStep === 1) {
        initMixerTracks()

        // Load audio into the stem engine
        // Prefer local blob URL (instant, no network) over server upload URL
        for (const track of tracks) {
          if (track.stems) {
            await stemEngine.addTrack(`${track.name}-vocals`, `${track.name} (Vocals)`, track.stems.vocals)
            await stemEngine.addTrack(`${track.name}-drums`, `${track.name} (Drums)`, track.stems.drums)
            await stemEngine.addTrack(`${track.name}-bass`, `${track.name} (Bass)`, track.stems.bass)
            await stemEngine.addTrack(`${track.name}-other`, `${track.name} (Other)`, track.stems.other)
          } else {
            const audioUrl = track.localBlobUrl || track.uploadedUrl
            if (audioUrl) {
              await stemEngine.addTrack(track.name, track.name, audioUrl)
            }
          }
        }
      }
      setCurrentStep(step)
    },
    [currentStep, initMixerTracks, tracks, stemEngine]
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

  // Stem Roulette state
  const [roulettePhase, setRoulettePhase] = useState<"idle" | "spinning" | "ready" | "creating" | "done">("idle")
  const [rouletteStems, setRouletteStems] = useState<Array<{ id: string; title: string; instrument: string | null; genre: string | null; bpm: number | null; key: string | null; audio_url: string; duration_ms: number | null }>>([])
  const [rouletteTimer, setRouletteTimer] = useState(false)

  const handleRouletteSpin = useCallback(async () => {
    setRoulettePhase("spinning")
    setRouletteStems([])
    try {
      const response = await fetch("/api/roulette/spin", { method: "POST" })
      if (!response.ok) { setRoulettePhase("idle"); return }
      const data = (await response.json()) as { stems: typeof rouletteStems }
      setRouletteStems(data.stems)
    } catch {
      setRoulettePhase("idle")
    }
  }, [])

  const handleRouletteStart = useCallback(() => {
    setRoulettePhase("creating")
    setRouletteTimer(true)

    // Load roulette stems into the manual mixer
    const stemTracks: TrackWithStems[] = rouletteStems.map((stem) => ({
      file: new File([], stem.title),
      name: stem.title,
      size: 0,
      uploadProgress: 100,
      uploadedUrl: stem.audio_url,
      duration: stem.duration_ms ? stem.duration_ms / 1000 : 30,
    }))
    setTracks(stemTracks)
  }, [rouletteStems])

  const modeParam = searchParams.get("mode")
  const mode = modeParam === "manual" ? "manual" : modeParam === "roulette" ? "roulette" : "auto"

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-28 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-10 grid gap-5 border-b border-foreground pb-8 text-left lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="signal-label mb-5">Campaign builder</p>
          <h1 className="display-type text-5xl leading-[0.85] text-foreground sm:text-7xl">
            Track in. Campaign out.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Find the hook, resolve the rights, package the post, and keep the signal attached to the source.
          </p>
        </div>
        <div className="flex gap-px border border-foreground bg-foreground lg:col-span-4">
          <div className="flex-1 bg-background p-3">
            <p className="mono-label text-muted-foreground">Target</p>
            <p className="mt-2 text-sm font-semibold">First export in 10 min</p>
          </div>
          <div className="flex-1 bg-secondary p-3 text-secondary-foreground">
            <p className="mono-label">Rights gate</p>
            <p className="mt-2 text-sm font-semibold">Always before export</p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="mx-auto mb-10 max-w-4xl border border-foreground bg-card p-4 sm:p-6">
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
                      "relative z-10 flex h-12 w-12 items-center justify-center rounded-sm border transition-colors",
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

      {/* Mode Selection */}
      <Tabs defaultValue={mode} className="mb-8">
        <div className="flex justify-center mb-6">
          <TabsList className="grid h-auto w-full max-w-2xl grid-cols-3 rounded-none border border-foreground bg-muted p-1">
            <TabsTrigger value="auto">
              <Sparkles className="h-4 w-4 mr-2" />
              Fast Campaign
            </TabsTrigger>
            <TabsTrigger value="manual">Pro Studio</TabsTrigger>
            <TabsTrigger value="roulette">
              <Dices className="h-4 w-4 mr-2" />
              5-Minute Flip
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="auto">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <p className="mono-label text-primary">Recommended first run</p>
            <h2 className="display-type mt-3 text-3xl">Build the campaign fast</h2>
            <p className="mt-2 text-sm text-muted-foreground">Upload source material, generate a workable first mix, then move directly into hooks and export proof.</p>
          </div>
          <AutoMashupGenerator
            className="max-w-3xl mx-auto"
            onComplete={(result) => {
              console.log("Auto mashup complete", result)
            }}
          />
        </TabsContent>

        <TabsContent value="roulette">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="display-type text-3xl">The 5-minute flip</h2>
              <p className="text-muted-foreground text-sm">
                Spin for 3 random stems. Make something amazing in 5 minutes.
              </p>
            </div>

            <div className="mb-8">
              <RouletteSpinner
                stems={rouletteStems}
                isSpinning={roulettePhase === "spinning"}
                onSpinComplete={() => setRoulettePhase("ready")}
              />
            </div>

            <div className="flex flex-col items-center gap-4">
              {roulettePhase === "idle" && (
                <Button size="lg" onClick={handleRouletteSpin} className="px-8">
                  <Dices className="mr-2 h-5 w-5" />
                  Spin the Wheel
                </Button>
              )}

              {roulettePhase === "spinning" && (
                <p className="text-sm text-muted-foreground animate-pulse">
                  Selecting your stems...
                </p>
              )}

              {roulettePhase === "ready" && (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Your 3 stems are ready. You have 5 minutes. Go!
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button size="lg" onClick={handleRouletteStart}>
                      <Timer className="mr-2 h-5 w-5" />
                      Start the Clock
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleRouletteSpin}>
                      <Dices className="mr-2 h-5 w-5" />
                      Re-spin
                    </Button>
                  </div>
                </div>
              )}

              {roulettePhase === "creating" && (
                <div className="text-center space-y-4">
                  <CountdownTimer
                    durationSeconds={300}
                    isRunning={rouletteTimer}
                    onComplete={() => { setRouletteTimer(false); setRoulettePhase("done") }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Stems loaded into your mixer. Switch to Manual Studio to start mixing!
                  </p>
                </div>
              )}

              {roulettePhase === "done" && (
                <div className="text-center space-y-4">
                  <p className="text-lg font-semibold text-foreground">
                    Time&apos;s up!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Publish what you&apos;ve got, or keep polishing.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setRoulettePhase("idle")
                    setRouletteStems([])
                  }}>
                    Play Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manual">
          {/* Step content */}
          <div className="mx-auto max-w-2xl">
            {/* ----------------------------------------------------------------- */}
            {/* Step 1: Upload Tracks */}
            {/* ----------------------------------------------------------------- */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {remixSource && (
                  <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                    <Repeat2 className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Remixing: {remixSource.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {remixSource.creator ? `by ${remixSource.creator} — ` : ""}
                        Stems pre-loaded. Add your own twist!
                      </p>
                    </div>
                  </div>
                )}

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

                {/* AI Stem Generator */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or generate with AI
                    </span>
                  </div>
                </div>

                <StemGenerator
                  onAddToTimeline={(stem) => {
                    setTracks((prev) => [...prev, {
                      file: new File([], stem.title),
                      name: stem.title,
                      size: 0,
                      uploadProgress: 100,
                      uploadedUrl: stem.audio_url,
                      duration: stem.duration_seconds,
                    }])
                  }}
                />

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
                {/* AI Toggles */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant={ghostOpen ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGhostOpen(!ghostOpen)}
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Ghost Collab
                  </Button>
                  <Button
                    variant={copilotOpen ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCopilotOpen(!copilotOpen)}
                  >
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    AI Copilot
                  </Button>
                </div>

                {ghostOpen && <GhostCollaborator />}

                <CopilotPanel
                  isOpen={copilotOpen}
                  onClose={() => setCopilotOpen(false)}
                  currentStems={tracks.map((t) => ({
                    instrument: t.stems ? "multi" : undefined,
                    title: t.name,
                  }))}
                  bpm={beatAnalysis?.bpm.bpm ?? null}
                />

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

                {/* Transport controls — real-time multi-track playback */}
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                  <Button
                    size="sm"
                    variant={stemEngine.engineState === "playing" ? "secondary" : "default"}
                    onClick={stemEngine.engineState === "playing" ? stemEngine.pause : stemEngine.play}
                    disabled={stemEngine.engineState === "loading" || stemEngine.engineState === "idle"}
                  >
                    {stemEngine.engineState === "playing" ? "Pause" : "Play"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={stemEngine.stop}>
                    Stop
                  </Button>

                  {/* Time display */}
                  <span className="font-mono text-sm text-muted-foreground">
                    {formatTime(stemEngine.currentTime)} / {formatTime(stemEngine.duration)}
                  </span>

                  {/* Seek bar */}
                  <input
                    type="range"
                    min={0}
                    max={stemEngine.duration || 1}
                    step={0.1}
                    value={stemEngine.currentTime}
                    onChange={(e) => stemEngine.seek(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                </div>

                {stemEngine.engineState === "loading" && (
                  <p className="text-sm text-muted-foreground animate-pulse text-center">
                    Loading audio into mixer...
                  </p>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export default function CreatePage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
            <p className="text-sm text-muted-foreground">Loading creator workspace...</p>
          </div>
        }
      >
        <CreatePageContent />
      </Suspense>
    </AuthGuard>
  )
}
