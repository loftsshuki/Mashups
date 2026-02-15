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
