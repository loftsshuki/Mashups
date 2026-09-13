export class StemPlayer {
  constructor() {
    this.context = null; this.buffers = null; this.sources = []; this.channels = []
    this.duration = 30; this.offset = 0; this.startedAt = 0; this.playing = false; this.mode = 'both'; this.onended = () => {}; this.request = 0
  }
  async load(manifest) {
    if (this.buffers) return
    this.context ??= new AudioContext()
    await this.context.resume()
    this.master?.disconnect()
    this.master = this.context.createGain(); this.master.gain.value = .9; this.master.connect(this.context.destination)
    if (manifest.mode === 'files') {
      this.buffers = await Promise.all([manifest.backingUrl, manifest.leadUrl].map(async (url) => {
        const response = await fetch(new URL(url, location.href), { signal: AbortSignal.timeout(20000) })
        if (!response.ok) throw new Error('The audio could not load. Please try Play again.')
        return this.context.decodeAudioData(await response.arrayBuffer())
      }))
      if (Math.abs(this.buffers[0].duration - this.buffers[1].duration) > .06) { this.buffers = null; throw new Error('The source clips have different lengths. Playback is unavailable.') }
    } else this.buffers = synthesize(this.context, manifest.duration, manifest.bpm)
    this.duration = Math.min(...this.buffers.map((buffer) => buffer.duration))
    this.channels = this.buffers.map(() => {
      const analyser = this.context.createAnalyser(), gain = this.context.createGain()
      analyser.fftSize = 1024; analyser.smoothingTimeConstant = .65
      analyser.connect(gain); gain.connect(this.master)
      return { analyser, gain, wave: new Float32Array(1024), spectrum: new Uint8Array(512) }
    })
    this.setMode(this.mode)
  }
  async play() {
    if (!this.buffers) return
    const request = ++this.request
    await this.context.resume()
    if (request !== this.request || this.playing) return
    if (this.offset >= this.duration - .04) this.offset = 0
    this.startedAt = this.context.currentTime + .04
    this.playing = true
    this.sources = this.buffers.map((buffer, i) => {
      const source = this.context.createBufferSource(); source.buffer = buffer
      source.connect(this.channels[i].analyser); source.start(this.startedAt, this.offset)
      return source
    })
    const endSource = this.sources[0]
    endSource.onended = () => {
      if (this.sources[0] !== endSource || !this.playing) return
      this.pause(); this.offset = this.duration; this.onended()
    }
  }
  position() { return this.playing ? Math.min(this.duration, this.offset + Math.max(0, this.context.currentTime - this.startedAt)) : this.offset }
  pause() {
    this.request++
    this.offset = this.position(); this.playing = false
    for (const source of this.sources) { source.onended = null; try { source.stop() } catch {} source.disconnect() }
    this.sources = []
  }
  async seek(time) { const resume = this.playing; this.pause(); this.offset = Math.max(0, Math.min(this.duration, time)); if (resume) await this.play() }
  setMode(mode) {
    this.mode = mode
    this.channels.forEach((channel, i) => {
      const value = mode === 'both' || (i === 0 ? mode === 'backing' : mode === 'lead') ? 1 : 0
      channel.gain.gain.cancelScheduledValues(this.context.currentTime)
      channel.gain.gain.setTargetAtTime(value, this.context.currentTime, .015)
    })
  }
  levels() {
    if (!this.playing) return [0, 0, 0]
    const levels = this.channels.map((channel, i) => {
      channel.analyser.getFloatTimeDomainData(channel.wave)
      const rms = Math.sqrt(channel.wave.reduce((sum, v) => sum + v * v, 0) / channel.wave.length)
      if ((i === 0 && this.mode === 'lead') || (i === 1 && this.mode === 'backing')) return 0
      return Math.min(1, rms * 6)
    })
    const channel = this.channels[0]
    channel.analyser.getByteFrequencyData(channel.spectrum)
    const top = Math.max(1, Math.floor(190 / (this.context.sampleRate / channel.analyser.fftSize)))
    let bass = 0
    for (let i = 1; i <= top; i++) bass += channel.spectrum[i] / 255
    return [levels[0], levels[1], this.mode === 'lead' ? 0 : bass / top]
  }
  dispose() { this.pause(); this.context?.close() }
}

// Original two-part electronic sketch. No catalog sample or third-party recording.
function synthesize(context, seconds, bpm) {
  const sr = 22050, length = Math.round(seconds * sr)
  const backing = context.createBuffer(2, length, sr), lead = context.createBuffer(2, length, sr)
  const parts = [backing, lead].map((buffer) => [buffer.getChannelData(0), buffer.getChannelData(1)])
  const note = (midi) => 440 * 2 ** ((midi - 69) / 12)
  const melody = [72, 75, 79, 82, 79, 75, 70, 67, 72, 79, 75, 70, 67, 70, 75, 79]
  const roots = [48, 44, 46, 43]
  let seed = 7144
  for (let i = 0; i < length; i++) {
    const t = i / sr, beatLength = 60 / bpm, beat = Math.floor(t / beatLength), tick = t % beatLength, eighth = t % (beatLength / 2)
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0
    const noise = seed / 2147483648
    const kick = Math.sin(2 * Math.PI * (46 * tick + 7 * (1 - Math.exp(-tick * 40)))) * Math.exp(-tick * 18) * .28
    const snare = beat % 2 ? noise * Math.exp(-tick * 32) * .11 : 0
    const hats = noise * Math.exp(-eighth * 120) * .035
    const bass = Math.sin(2 * Math.PI * note(roots[Math.floor(beat / 8) % roots.length]) * t) * Math.min(1, tick * 90) * Math.exp(-tick * 6) * .17
    const fade = Math.min(1, t * 12, (seconds - t) * 4)
    for (let channel = 0; channel < 2; channel++) {
      parts[0][channel][i] = (kick + snare + hats + bass) * fade
      const pitch = note(melody[Math.floor(t / (beatLength / 2)) % melody.length])
      const env = Math.min(1, eighth * 90) * Math.exp(-eighth * 11)
      parts[1][channel][i] = t < 2 ? 0 : (Math.sin(2 * Math.PI * pitch * t + channel * .12) + .2 * Math.sin(4 * Math.PI * pitch * t)) * env * .13 * fade
    }
  }
  return [backing, lead]
}
