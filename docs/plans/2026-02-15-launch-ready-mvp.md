# Launch-Ready MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Mashups.com from a UI prototype into a launch-ready + pitch-ready product where users can upload audio, separate stems, mix them together with real-time playback, export the result, and share it.

**Architecture:** Six phases moving from zero-effort config wins through the critical audio engine, then auth, payments, and AI. Each phase is independently shippable. The core audio engine (Phase 1) is the product — everything else is supporting infrastructure.

**Tech Stack:** Next.js 16, React 19, Web Audio API, Supabase (auth + DB + realtime), Vercel Blob (storage), Replicate (stem separation), Stripe (payments), OpenAI (text AI)

---

## Phase 0: Infrastructure Config (30 minutes)

Wire up the services that are already coded but missing API keys.

### Task 0.1: Set Supabase Env Vars on Vercel

**Files:**
- No code changes

**Step 1: Get values from local env**

Read values from `app/.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Step 2: Set on Vercel**

```bash
cd app
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development
```

Or set via Vercel Dashboard > Settings > Environment Variables.

**Step 3: Verify**

Push a deployment and check that the homepage loads real data from Supabase instead of mock fallbacks.

---

### Task 0.2: Enable Vercel Blob Storage

**Files:**
- No code changes — `@vercel/blob` is already in package.json and used in `app/src/lib/storage/upload.ts` and `app/src/app/api/upload/route.ts`

**Step 1: Add Vercel Blob to project**

```bash
npx vercel link  # if not already linked
npx vercel blob add  # provisions blob store
```

Or: Vercel Dashboard > Storage > Create > Blob Store > Link to project.

This auto-sets `BLOB_READ_WRITE_TOKEN` in the environment.

**Step 2: Verify**

Deploy and test file upload via the `/create` page. The upload should return a real `*.public.blob.vercel-storage.com` URL instead of `/audio/dev-upload-*.mp3`.

---

### Task 0.3: Enable Stem Separation (Replicate)

**Files:**
- No code changes — `app/src/lib/audio/replicate.ts` and `app/src/app/api/audio/separate/route.ts` are ready

**Step 1: Get Replicate API token**

1. Sign up at https://replicate.com
2. Go to Account > API Tokens
3. Create a token

**Step 2: Set env var**

```bash
npx vercel env add REPLICATE_API_TOKEN production preview development
```

Also add to `app/.env.local` for local dev.

**Step 3: Verify**

```bash
curl -X GET http://localhost:3000/api/audio/separate
# Should return: { "configured": true, "model": "cjwbw/demucs", ... }
```

**Step 4: Commit any changes**

```bash
git add -A && git commit -m "chore: document env var setup for Supabase, Blob, Replicate"
```

---

## Phase 1: Core Audio Engine (1-2 weeks)

This is THE product. Build a Web Audio API multi-track engine that loads stems, plays them in sync, and exports to a mixed audio file.

### Task 1.1: Create StemEngine Class

**Files:**
- Create: `app/src/lib/audio/stem-engine.ts`

**Context:** The existing `use-audio-player.ts` uses Howler.js for single-track playback (listening to published mashups). The StemEngine is a separate system for the `/create` page's mixer — it manages N stems simultaneously via Web Audio API.

**Step 1: Create the StemEngine class**

```typescript
// app/src/lib/audio/stem-engine.ts

export interface StemTrack {
  id: string
  name: string
  audioUrl: string
  buffer: AudioBuffer | null
  gainNode: GainNode | null
  panNode: StereoPannerNode | null
  sourceNode: AudioBufferSourceNode | null
  volume: number   // 0-1
  pan: number      // -1 to 1
  muted: boolean
  solo: boolean
}

export type EngineState = "idle" | "loading" | "ready" | "playing" | "error"

export class StemEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private tracks: Map<string, StemTrack> = new Map()
  private startTime: number = 0  // AudioContext time when playback started
  private pauseOffset: number = 0 // seconds into the song when paused
  private _state: EngineState = "idle"
  private _duration: number = 0
  private onStateChange?: (state: EngineState) => void
  private onTimeUpdate?: (time: number) => void
  private rafId: number | null = null

  constructor(opts?: {
    onStateChange?: (state: EngineState) => void
    onTimeUpdate?: (time: number) => void
  }) {
    this.onStateChange = opts?.onStateChange
    this.onTimeUpdate = opts?.onTimeUpdate
  }

  get state(): EngineState { return this._state }
  get duration(): number { return this._duration }
  get currentTime(): number {
    if (!this.ctx || this._state !== "playing") return this.pauseOffset
    return this.ctx.currentTime - this.startTime + this.pauseOffset
  }

  private setState(s: EngineState) {
    this._state = s
    this.onStateChange?.(s)
  }

  /** Initialize the AudioContext (must be called from a user gesture) */
  async init(): Promise<void> {
    if (this.ctx) return
    this.ctx = new AudioContext()
    this.masterGain = this.ctx.createGain()
    this.masterGain.connect(this.ctx.destination)
    this.setState("idle")
  }

  /** Load an audio file from URL into a track */
  async addTrack(id: string, name: string, audioUrl: string): Promise<void> {
    if (!this.ctx || !this.masterGain) await this.init()
    const ctx = this.ctx!

    this.setState("loading")

    const gainNode = ctx.createGain()
    const panNode = ctx.createStereoPanner()
    gainNode.connect(panNode)
    panNode.connect(this.masterGain!)

    const track: StemTrack = {
      id, name, audioUrl,
      buffer: null, gainNode, panNode,
      sourceNode: null,
      volume: 1, pan: 0, muted: false, solo: false,
    }
    this.tracks.set(id, track)

    // Fetch and decode audio
    const response = await fetch(audioUrl)
    const arrayBuffer = await response.arrayBuffer()
    track.buffer = await ctx.decodeAudioData(arrayBuffer)

    // Update duration (longest stem wins)
    this._duration = Math.max(this._duration, track.buffer.duration)

    this.setState("ready")
  }

  /** Remove a track */
  removeTrack(id: string): void {
    const track = this.tracks.get(id)
    if (track) {
      track.sourceNode?.stop()
      track.gainNode?.disconnect()
      track.panNode?.disconnect()
      this.tracks.delete(id)
    }
  }

  /** Play all tracks in sync from current position */
  play(): void {
    if (!this.ctx || this._state === "playing") return
    if (this.ctx.state === "suspended") this.ctx.resume()

    this.startTime = this.ctx.currentTime
    this.createAndStartSources(this.pauseOffset)
    this.setState("playing")
    this.startTimeLoop()
  }

  /** Pause playback, remember position */
  pause(): void {
    if (this._state !== "playing") return
    this.pauseOffset = this.currentTime
    this.stopAllSources()
    this.setState("ready")
    this.stopTimeLoop()
  }

  /** Stop and reset to beginning */
  stop(): void {
    this.stopAllSources()
    this.pauseOffset = 0
    this.setState("ready")
    this.stopTimeLoop()
    this.onTimeUpdate?.(0)
  }

  /** Seek to a specific time (seconds) */
  seek(time: number): void {
    const wasPlaying = this._state === "playing"
    this.stopAllSources()
    this.pauseOffset = Math.max(0, Math.min(time, this._duration))
    if (wasPlaying) {
      this.play()
    } else {
      this.onTimeUpdate?.(this.pauseOffset)
    }
  }

  /** Set volume for a track (0-1) */
  setTrackVolume(id: string, volume: number): void {
    const track = this.tracks.get(id)
    if (track) {
      track.volume = volume
      this.applyTrackGain(track)
    }
  }

  /** Set pan for a track (-1 to 1) */
  setTrackPan(id: string, pan: number): void {
    const track = this.tracks.get(id)
    if (track?.panNode) {
      track.pan = pan
      track.panNode.pan.value = pan
    }
  }

  /** Toggle mute on a track */
  setTrackMuted(id: string, muted: boolean): void {
    const track = this.tracks.get(id)
    if (track) {
      track.muted = muted
      this.applyTrackGain(track)
    }
  }

  /** Toggle solo on a track */
  setTrackSolo(id: string, solo: boolean): void {
    const track = this.tracks.get(id)
    if (track) {
      track.solo = solo
      // Re-apply gains for all tracks (solo affects others)
      this.tracks.forEach(t => this.applyTrackGain(t))
    }
  }

  /** Set master volume (0-1) */
  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = volume
    }
  }

  /** Get all track states for UI rendering */
  getTracks(): StemTrack[] {
    return Array.from(this.tracks.values())
  }

  /** Export mix to WAV blob using OfflineAudioContext */
  async exportToWav(): Promise<Blob> {
    if (this.tracks.size === 0) throw new Error("No tracks to export")

    const sampleRate = 44100
    const length = Math.ceil(this._duration * sampleRate)
    const offline = new OfflineAudioContext(2, length, sampleRate)

    const masterGain = offline.createGain()
    masterGain.connect(offline.destination)

    for (const track of this.tracks.values()) {
      if (!track.buffer) continue

      const source = offline.createBufferSource()
      source.buffer = track.buffer

      const gain = offline.createGain()
      const pan = offline.createStereoPanner()

      // Apply mute/solo/volume
      const anySolo = Array.from(this.tracks.values()).some(t => t.solo)
      if (track.muted || (anySolo && !track.solo)) {
        gain.gain.value = 0
      } else {
        gain.gain.value = track.volume
      }
      pan.pan.value = track.pan

      source.connect(gain)
      gain.connect(pan)
      pan.connect(masterGain)
      source.start(0)
    }

    const renderedBuffer = await offline.startRendering()
    return audioBufferToWav(renderedBuffer)
  }

  /** Cleanup everything */
  dispose(): void {
    this.stopAllSources()
    this.stopTimeLoop()
    this.tracks.forEach(t => {
      t.gainNode?.disconnect()
      t.panNode?.disconnect()
    })
    this.tracks.clear()
    this.ctx?.close()
    this.ctx = null
    this.masterGain = null
    this.setState("idle")
  }

  // -- Private helpers --

  private createAndStartSources(offset: number): void {
    if (!this.ctx) return
    for (const track of this.tracks.values()) {
      if (!track.buffer) continue

      const source = this.ctx.createBufferSource()
      source.buffer = track.buffer
      source.connect(track.gainNode!)

      // Clamp offset to buffer duration
      const clampedOffset = Math.min(offset, track.buffer.duration)
      source.start(0, clampedOffset)
      track.sourceNode = source

      this.applyTrackGain(track)
    }
  }

  private stopAllSources(): void {
    for (const track of this.tracks.values()) {
      try { track.sourceNode?.stop() } catch { /* already stopped */ }
      track.sourceNode = null
    }
  }

  private applyTrackGain(track: StemTrack): void {
    if (!track.gainNode) return
    const anySolo = Array.from(this.tracks.values()).some(t => t.solo)
    if (track.muted || (anySolo && !track.solo)) {
      track.gainNode.gain.value = 0
    } else {
      track.gainNode.gain.value = track.volume
    }
  }

  private startTimeLoop(): void {
    const tick = () => {
      if (this._state === "playing") {
        const t = this.currentTime
        if (t >= this._duration) {
          this.stop()
          return
        }
        this.onTimeUpdate?.(t)
        this.rafId = requestAnimationFrame(tick)
      }
    }
    this.rafId = requestAnimationFrame(tick)
  }

  private stopTimeLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }
}

// -- WAV encoder --

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16
  const bytesPerSample = bitDepth / 8
  const blockAlign = numChannels * bytesPerSample
  const dataLength = buffer.length * blockAlign
  const headerLength = 44
  const totalLength = headerLength + dataLength

  const arrayBuffer = new ArrayBuffer(totalLength)
  const view = new DataView(arrayBuffer)

  // WAV header
  writeString(view, 0, "RIFF")
  view.setUint32(4, totalLength - 8, true)
  writeString(view, 8, "WAVE")
  writeString(view, 12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeString(view, 36, "data")
  view.setUint32(40, dataLength, true)

  // Interleave channels and write samples
  const channels = []
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch))
  }

  let offset = 44
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]))
      view.setInt16(offset, sample * 0x7fff, true)
      offset += 2
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" })
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}
```

**Step 2: Build and verify no type errors**

```bash
cd app && npx next build
```

**Step 3: Commit**

```bash
git add app/src/lib/audio/stem-engine.ts
git commit -m "feat: add StemEngine — Web Audio API multi-track mixer with WAV export"
```

---

### Task 1.2: Create React Hook for StemEngine

**Files:**
- Create: `app/src/lib/hooks/use-stem-engine.ts`

**Step 1: Create the hook**

```typescript
// app/src/lib/hooks/use-stem-engine.ts
"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { StemEngine, type EngineState, type StemTrack } from "@/lib/audio/stem-engine"

export function useStemEngine() {
  const engineRef = useRef<StemEngine | null>(null)
  const [engineState, setEngineState] = useState<EngineState>("idle")
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [tracks, setTracks] = useState<StemTrack[]>([])

  // Create engine on mount
  useEffect(() => {
    const engine = new StemEngine({
      onStateChange: (state) => {
        setEngineState(state)
        setTracks(engine.getTracks())
        setDuration(engine.duration)
      },
      onTimeUpdate: (time) => setCurrentTime(time),
    })
    engineRef.current = engine

    return () => {
      engine.dispose()
      engineRef.current = null
    }
  }, [])

  const addTrack = useCallback(async (id: string, name: string, url: string) => {
    const engine = engineRef.current
    if (!engine) return
    await engine.init() // safe to call multiple times
    await engine.addTrack(id, name, url)
    setTracks(engine.getTracks())
    setDuration(engine.duration)
  }, [])

  const removeTrack = useCallback((id: string) => {
    engineRef.current?.removeTrack(id)
    setTracks(engineRef.current?.getTracks() ?? [])
  }, [])

  const play = useCallback(() => engineRef.current?.play(), [])
  const pause = useCallback(() => engineRef.current?.pause(), [])
  const stop = useCallback(() => engineRef.current?.stop(), [])
  const seek = useCallback((t: number) => engineRef.current?.seek(t), [])

  const setVolume = useCallback((id: string, vol: number) => {
    engineRef.current?.setTrackVolume(id, vol)
    setTracks(engineRef.current?.getTracks() ?? [])
  }, [])

  const setPan = useCallback((id: string, pan: number) => {
    engineRef.current?.setTrackPan(id, pan)
    setTracks(engineRef.current?.getTracks() ?? [])
  }, [])

  const setMuted = useCallback((id: string, muted: boolean) => {
    engineRef.current?.setTrackMuted(id, muted)
    setTracks(engineRef.current?.getTracks() ?? [])
  }, [])

  const setSolo = useCallback((id: string, solo: boolean) => {
    engineRef.current?.setTrackSolo(id, solo)
    setTracks(engineRef.current?.getTracks() ?? [])
  }, [])

  const setMasterVolume = useCallback((vol: number) => {
    engineRef.current?.setMasterVolume(vol)
  }, [])

  const exportWav = useCallback(async (): Promise<Blob | null> => {
    if (!engineRef.current) return null
    return engineRef.current.exportToWav()
  }, [])

  return {
    engineState, currentTime, duration, tracks,
    addTrack, removeTrack,
    play, pause, stop, seek,
    setVolume, setPan, setMuted, setSolo,
    setMasterVolume, exportWav,
  }
}
```

**Step 2: Build and verify**

```bash
cd app && npx next build
```

**Step 3: Commit**

```bash
git add app/src/lib/hooks/use-stem-engine.ts
git commit -m "feat: add useStemEngine React hook for multi-track mixer"
```

---

### Task 1.3: Wire StemEngine into the Create Page Mixer (Step 2)

**Files:**
- Modify: `app/src/app/create/page.tsx` (the Step 2 "Mix & Arrange" section)

**Context:** Currently `handlePreview()` shows "Real-time audio mixing is coming in a future update." We replace this with actual multi-track playback using `useStemEngine`.

**Step 1: Add the engine hook to CreatePageContent**

At the top of `CreatePageContent()`, add:

```typescript
import { useStemEngine } from "@/lib/hooks/use-stem-engine"

// Inside the component:
const stemEngine = useStemEngine()
```

**Step 2: Load stems into engine when entering Step 2**

Modify the `goToStep` callback. When moving to step 2, load all track audio URLs (and stem URLs if separated) into the engine:

```typescript
const goToStep = useCallback(
  async (step: number) => {
    if (step === 2 && currentStep === 1) {
      initMixerTracks()

      // Load audio into the stem engine
      for (const track of tracks) {
        if (track.stems) {
          // Load separated stems
          await stemEngine.addTrack(`${track.id}-vocals`, `${track.name} (Vocals)`, track.stems.vocals)
          await stemEngine.addTrack(`${track.id}-drums`, `${track.name} (Drums)`, track.stems.drums)
          await stemEngine.addTrack(`${track.id}-bass`, `${track.name} (Bass)`, track.stems.bass)
          await stemEngine.addTrack(`${track.id}-other`, `${track.name} (Other)`, track.stems.other)
        } else if (track.uploadedUrl) {
          // Load original file
          await stemEngine.addTrack(track.id, track.name, track.uploadedUrl)
        }
      }
    }
    setCurrentStep(step)
  },
  [currentStep, initMixerTracks, tracks, stemEngine]
)
```

**Step 3: Replace the fake preview handler with real transport controls**

Delete `handlePreview` and the `previewMessage` state. Add transport controls to the Step 2 UI:

```tsx
{/* Transport controls — replaces the old fake "Preview" button */}
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
```

Add the time formatter:

```typescript
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}
```

**Step 4: Wire mixer controls to the engine**

Update `handleVolumeChange`, `handleMuteToggle`, `handleSoloToggle` to call the engine:

```typescript
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
```

**Step 5: Build and test manually**

```bash
cd app && npx next build
```

Then test locally:
1. Go to `/create`
2. Upload an audio file
3. Click "Separate Stems" (if Replicate configured) or proceed with original
4. Move to Step 2
5. Click Play — **you should hear multi-track audio**
6. Adjust volume sliders — volumes should change in real-time
7. Mute/solo tracks — should work

**Step 6: Commit**

```bash
git add app/src/app/create/page.tsx
git commit -m "feat: wire StemEngine into create page — real-time multi-track playback"
```

---

### Task 1.4: Add Export/Mixdown to Publish Flow

**Files:**
- Modify: `app/src/app/create/page.tsx` (Step 3 publish flow)
- Modify: `app/src/app/api/upload/route.ts` (accept WAV blob upload)

**Context:** Currently `createMashup` saves the original upload URL as `audio_url`. Instead, we should export the mixed stems to a WAV, upload that, and use it as the mashup audio.

**Step 1: Add export + upload before publish**

Modify `handlePublish` to export the mix first:

```typescript
const handlePublish = useCallback(
  (formData: FormData) => {
    startTransition(async () => {
      // Export the mix to WAV
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
```

**Step 2: Build and test**

```bash
cd app && npx next build
```

Test: Create a mashup through all 3 steps. The published mashup should have a real mixed audio file.

**Step 3: Commit**

```bash
git add app/src/app/create/page.tsx
git commit -m "feat: export mixed stems to WAV and upload on publish"
```

---

### Task 1.5: Clean Up Placeholder Message and Polish

**Files:**
- Modify: `app/src/app/create/page.tsx`

**Step 1:** Remove the `previewMessage` state variable and any UI that shows "Real-time audio mixing is coming in a future update."

**Step 2:** Add a loading indicator while stems are being loaded into the engine:

```tsx
{stemEngine.engineState === "loading" && (
  <p className="text-sm text-muted-foreground animate-pulse">
    Loading audio into mixer...
  </p>
)}
```

**Step 3: Build and commit**

```bash
cd app && npx next build
git add app/src/app/create/page.tsx
git commit -m "fix: remove placeholder preview message, add loading state"
```

---

## Phase 2: Auth Improvements (1 day)

### Task 2.1: Add Google OAuth

**Files:**
- Modify: `app/src/app/login/page.tsx`
- Modify: `app/src/app/signup/page.tsx`
- Modify: `app/src/lib/auth/auth-actions.ts`

**Step 1: Configure Google OAuth in Supabase Dashboard**

1. Supabase Dashboard > Authentication > Providers > Google
2. Enable Google provider
3. Set Client ID and Client Secret from Google Cloud Console
4. Set redirect URL to `https://<your-domain>/auth/callback`

**Step 2: Add OAuth action**

Add to `app/src/lib/auth/auth-actions.ts`:

```typescript
export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}
```

**Step 3: Add Google button to login page**

Add above the email form in `app/src/app/login/page.tsx`:

```tsx
<form action={signInWithGoogle}>
  <Button type="submit" variant="outline" className="w-full">
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
    Continue with Google
  </Button>
</form>
<div className="relative my-4">
  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
  </div>
</div>
```

**Step 4: Add the same button to the signup page**

**Step 5: Update auth callback to create profile for OAuth users**

Modify `app/src/app/auth/callback/route.ts` to create a profile if one doesn't exist:

```typescript
// After exchanging the code for a session:
const { data: { user } } = await supabase.auth.getUser()
if (user) {
  // Check if profile exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single()

  if (!profile) {
    // Create profile from OAuth data
    const username = user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`
    await supabase.from("profiles").insert({
      id: user.id,
      username,
      display_name: user.user_metadata?.full_name || username,
      avatar_url: user.user_metadata?.avatar_url || null,
    })
  }
}
```

**Step 6: Build, test, commit**

```bash
cd app && npx next build
git add app/src/app/login/page.tsx app/src/app/signup/page.tsx app/src/lib/auth/auth-actions.ts app/src/app/auth/callback/route.ts
git commit -m "feat: add Google OAuth login with auto profile creation"
```

---

### Task 2.2: Add Password Reset Flow

**Files:**
- Create: `app/src/app/reset-password/page.tsx`
- Create: `app/src/app/update-password/page.tsx`
- Modify: `app/src/lib/auth/auth-actions.ts`
- Modify: `app/src/app/login/page.tsx` (fix forgot password link)

**Step 1: Add password reset actions to auth-actions.ts**

```typescript
export async function resetPassword(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/update-password`,
  })

  if (error) return { error: error.message }
  return { success: true, message: "Check your email for a password reset link" }
}

export async function updatePassword(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const password = formData.get("password") as string

  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message }
  redirect("/login?message=Password updated successfully")
}
```

**Step 2: Create reset-password page**

A simple form with email input that calls `resetPassword` action.

**Step 3: Create update-password page**

A form with new password + confirm that calls `updatePassword` action. User arrives here from the email link.

**Step 4: Fix the forgot password link in login page**

Change `href="#"` to `href="/reset-password"`.

**Step 5: Build, test, commit**

```bash
cd app && npx next build
git add app/src/app/reset-password/ app/src/app/update-password/ app/src/lib/auth/auth-actions.ts app/src/app/login/page.tsx
git commit -m "feat: add password reset flow with email link"
```

---

### Task 2.3: Protect the Create Page

**Files:**
- Modify: `app/src/app/create/page.tsx`

**Step 1:** Wrap the create page content with `AuthGuard`:

```tsx
import { AuthGuard } from "@/components/auth/auth-guard"

export default function CreatePage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div>Loading...</div>}>
        <CreatePageContent />
      </Suspense>
    </AuthGuard>
  )
}
```

**Step 2: Build and commit**

```bash
cd app && npx next build
git add app/src/app/create/page.tsx
git commit -m "fix: protect create page with AuthGuard"
```

---

## Phase 3: Stripe Payments (Half Day)

### Task 3.1: Configure Stripe Products

**Files:**
- No code changes

**Step 1: Create products in Stripe Dashboard**

1. Go to Stripe Dashboard > Products
2. Create "Pro Creator" — $12/month recurring
3. Create "Pro Studio" — $29/month recurring
4. Note the `price_id` for each (format: `price_xxx`)

**Step 2: Set env vars**

```bash
npx vercel env add STRIPE_SECRET_KEY production preview development
npx vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production preview development
npx vercel env add STRIPE_PRICE_ID_PRO_CREATOR production preview development
npx vercel env add STRIPE_PRICE_ID_PRO_STUDIO production preview development
```

Also add to `app/.env.local`.

**Step 3: Set up webhook**

1. Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://<your-domain>/api/billing/webhook`
3. Events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy webhook signing secret

```bash
npx vercel env add STRIPE_WEBHOOK_SECRET production
```

**Step 4: Test the checkout flow**

1. Go to `/pricing`
2. Click "Choose Pro Creator"
3. Should redirect to Stripe Checkout
4. Use test card `4242 4242 4242 4242`
5. After payment, should redirect to `/dashboard/monetization?checkout=success`
6. Check Supabase `subscriptions` table for the new record

---

### Task 3.2: Verify Webhook Handler

**Files:**
- Read: `app/src/app/api/billing/webhook/route.ts`

**Step 1:** Review the existing webhook handler to ensure it handles:
- `checkout.session.completed` → creates subscription record
- `customer.subscription.updated` → updates tier
- `customer.subscription.deleted` → downgrades to free

**Step 2:** If any cases are missing, implement them.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: verify and fix Stripe webhook handler"
```

---

## Phase 4: AI Features — Text & Image (2-3 Days)

### Task 4.1: Add OpenAI Client

**Files:**
- Create: `app/src/lib/ai/openai.ts`

**Step 1: Install the SDK**

```bash
cd app && npm install openai
```

**Step 2: Create the client**

```typescript
// app/src/lib/ai/openai.ts
import OpenAI from "openai"

let client: OpenAI | null = null

export function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return client
}

export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY
}
```

**Step 3: Set env var**

```bash
npx vercel env add OPENAI_API_KEY production preview development
```

**Step 4: Build and commit**

```bash
cd app && npx next build
git add app/src/lib/ai/openai.ts app/package.json app/package-lock.json
git commit -m "feat: add OpenAI client with env var check"
```

---

### Task 4.2: Wire AI Captions (Auto-Caption)

**Files:**
- Modify: `app/src/lib/data/auto-caption.ts` (replace mock with real OpenAI call)
- Modify: `app/src/app/api/ai/complete/route.ts`

**Step 1:** Update the caption generation function to call GPT-4o-mini:

```typescript
import { getOpenAI } from "@/lib/ai/openai"

export async function generateCaptions(mashupTitle: string, genre: string, stems: string[]): Promise<GeneratedCaptions> {
  const openai = getOpenAI()
  if (!openai) return mockCaptions(mashupTitle) // fallback

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
      role: "user",
      content: `Generate social media captions for a music mashup titled "${mashupTitle}" in the ${genre} genre, using stems: ${stems.join(", ")}.

Return JSON with:
- tiktok: catchy TikTok caption (under 150 chars)
- instagram: Instagram caption with hashtags
- twitter: Tweet-length caption
- youtube: YouTube description paragraph`
    }],
    response_format: { type: "json_object" },
  })

  return JSON.parse(response.choices[0].message.content || "{}")
}
```

**Step 2: Build and commit**

```bash
cd app && npx next build
git add app/src/lib/data/auto-caption.ts
git commit -m "feat: wire auto-captions to OpenAI GPT-4o-mini"
```

---

### Task 4.3: Wire AI Suggestions (Copilot Panel)

**Files:**
- Modify: `app/src/app/api/ai/complete/route.ts`

**Step 1:** Replace the template-based response with a real OpenAI call:

```typescript
import { getOpenAI, isOpenAIConfigured } from "@/lib/ai/openai"

export async function POST(request: NextRequest) {
  if (!isOpenAIConfigured()) {
    // Return template-based suggestions as fallback
    return NextResponse.json({ suggestions: templateSuggestions })
  }

  const { prompt, context } = await request.json()
  const openai = getOpenAI()!

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
      role: "system",
      content: "You are a music production assistant. Suggest creative mashup ideas based on the user's current project."
    }, {
      role: "user",
      content: prompt
    }],
  })

  return NextResponse.json({
    suggestion: response.choices[0].message.content
  })
}
```

**Step 2: Build and commit**

```bash
cd app && npx next build
git add app/src/app/api/ai/complete/route.ts
git commit -m "feat: wire AI copilot suggestions to OpenAI"
```

---

### Task 4.4: Wire AI Thumbnail Generation

**Files:**
- Modify: `app/src/lib/data/thumbnail-generator.ts`

**Step 1:** Replace mock with DALL-E 3 call:

```typescript
import { getOpenAI } from "@/lib/ai/openai"

export async function generateThumbnail(title: string, genre: string): Promise<GeneratedThumbnail> {
  const openai = getOpenAI()
  if (!openai) return mockThumbnail(title)

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Album cover art for a music mashup titled "${title}" in the ${genre} genre. Abstract, vibrant, modern music art style. No text.`,
    n: 1,
    size: "1024x1024",
  })

  return {
    url: response.data[0].url!,
    prompt: response.data[0].revised_prompt || "",
  }
}
```

**Step 2: Build and commit**

```bash
cd app && npx next build
git add app/src/lib/data/thumbnail-generator.ts
git commit -m "feat: wire thumbnail generation to DALL-E 3"
```

---

## Phase 5: External Integrations (1 Day)

### Task 5.1: Enable Spotify Trending Data

**Files:**
- Rename: `app/src/lib/data/spotify-service.ts.ignore` → `app/src/lib/data/spotify-service.ts`
- Modify: `app/src/lib/data/trending-sounds.ts`

**Step 1: Un-ignore the Spotify service**

```bash
cd app/src/lib/data
mv spotify-service.ts.ignore spotify-service.ts
```

**Step 2: Register a Spotify app**

1. Go to https://developer.spotify.com/dashboard
2. Create an app
3. Note Client ID and Client Secret

**Step 3: Set env vars**

```bash
npx vercel env add SPOTIFY_CLIENT_ID production preview development
npx vercel env add SPOTIFY_CLIENT_SECRET production preview development
```

**Step 4: Update trending-sounds.ts to use real Spotify data**

Wire the `getTrendingSounds()` function to call the Spotify service when configured, falling back to mock data otherwise.

**Step 5: Build and commit**

```bash
cd app && npx next build
git add app/src/lib/data/spotify-service.ts app/src/lib/data/trending-sounds.ts
git commit -m "feat: enable Spotify trending data integration"
```

---

### Task 5.2: Enable Daily.co Voice Rooms

**Files:**
- Modify: `app/src/lib/data/voice-chat.ts`

**Step 1: Get Daily.co API key**

1. Sign up at https://www.daily.co
2. Go to Developers > API Keys
3. Create a key

**Step 2: Set env var**

```bash
npx vercel env add DAILY_API_KEY production preview development
```

**Step 3: Add server-side room creation**

Update `voice-chat.ts` to create rooms via Daily's REST API when the key is configured:

```typescript
export async function createVoiceRoom(name: string): Promise<{ url: string; token: string }> {
  if (!process.env.DAILY_API_KEY) {
    return { url: `https://mashups.daily.co/${name}`, token: "" }
  }

  const res = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name,
      properties: {
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        enable_chat: true,
        enable_screenshare: false,
      },
    }),
  })

  const room = await res.json()
  return { url: room.url, token: "" }
}
```

**Step 4: Build and commit**

```bash
cd app && npx next build
git add app/src/lib/data/voice-chat.ts
git commit -m "feat: add Daily.co server-side room creation"
```

---

## Phase 6: Launch Polish (1 Day)

### Task 6.1: Hide Unfinished Pages

**Files:**
- Modify: Navigation components that link to stub pages

**Step 1:** Identify all pages flagged as STUB/THIN in the audit:
- `/partner`, `/marketplace`, `/annual`, `/season`, `/daily` (old), `/portrait/[username]`

**Step 2:** Remove links to these pages from the main navigation, footer, and any other navigation components. The pages can stay in the codebase for future use — just don't link to them.

**Step 3: Build and commit**

```bash
cd app && npx next build
git add -A && git commit -m "fix: hide links to stub pages from navigation"
```

---

### Task 6.2: Consolidate Discovery Surfaces

**Files:**
- Modify: `app/src/app/explore/page.tsx`

**Step 1:** Add tabs to the explore page: "For You" | "Following" | "New"

- "For You" = current explore page algorithmic feed
- "Following" = content from the `/feed` page
- "New" = chronological from the `/discover` page

**Step 2:** Keep `/feed` and `/discover` working (for deep links) but redirect them to `/explore?tab=following` and `/explore?tab=new`.

**Step 3: Build and commit**

```bash
cd app && npx next build
git add -A && git commit -m "feat: consolidate discovery into tabbed explore page"
```

---

### Task 6.3: Final Build + Ship

**Step 1: Full build**

```bash
cd app && npx next build
```

Fix any errors.

**Step 2: Commit everything**

```bash
git add -A && git commit -m "feat: launch-ready MVP — all phases complete"
```

**Step 3: Ship to production**

```bash
git push origin claude/mashups-dev
git checkout main && git pull origin main && git merge claude/mashups-dev --no-edit && git push origin main
git checkout claude/mashups-dev
```

**Step 4: Verify Vercel deployment**

Check that the deployment reaches READY status and the core flow works:
1. Sign up (Google OAuth)
2. Upload a track
3. Separate stems
4. Mix with real-time playback
5. Export and publish
6. View the published mashup
7. Share URL works

---

## Summary

| Phase | Tasks | Effort | What It Unlocks |
|-------|-------|--------|-----------------|
| 0: Config | 3 | 30 min | Database, file storage, stem separation |
| 1: Audio Engine | 5 | 1-2 weeks | **The product works — upload, mix, listen, export** |
| 2: Auth | 3 | 1 day | Google OAuth, password reset, protected routes |
| 3: Payments | 2 | Half day | Real Stripe checkout and subscriptions |
| 4: AI | 4 | 2-3 days | Captions, suggestions, thumbnails via OpenAI |
| 5: Integrations | 2 | 1 day | Spotify trending, Daily.co voice rooms |
| 6: Polish | 3 | 1 day | Hide stubs, consolidate UX, ship |

**Total: 22 tasks across 6 phases.**

**The critical path is Phase 0 + Phase 1.** Once the audio engine works, you have a real product. Everything else is enhancement.
