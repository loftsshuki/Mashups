interface ExportHookClipInput {
  audioUrl: string
  startSec: number
  durationSec: number
  fileNameBase: string
}

function writeAscii(view: DataView, offset: number, value: string): void {
  for (let i = 0; i < value.length; i += 1) {
    view.setUint8(offset + i, value.charCodeAt(i))
  }
}

function encodeAudioBufferToWav(buffer: AudioBuffer): Blob {
  const channels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const bitDepth = 16
  const bytesPerSample = bitDepth / 8
  const frameCount = buffer.length
  const blockAlign = channels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = frameCount * blockAlign

  const wavBuffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(wavBuffer)

  writeAscii(view, 0, "RIFF")
  view.setUint32(4, 36 + dataSize, true)
  writeAscii(view, 8, "WAVE")
  writeAscii(view, 12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeAscii(view, 36, "data")
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (let i = 0; i < frameCount; i += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = buffer.getChannelData(channel)[i] ?? 0
      const clamped = Math.max(-1, Math.min(1, sample))
      const pcm = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff
      view.setInt16(offset, Math.round(pcm), true)
      offset += 2
    }
  }

  return new Blob([wavBuffer], { type: "audio/wav" })
}

export async function exportHookClipAsWav(
  input: ExportHookClipInput,
): Promise<{ blob: Blob; fileName: string }> {
  const response = await fetch(input.audioUrl)
  if (!response.ok) {
    throw new Error("Unable to fetch source audio.")
  }

  const arrayBuffer = await response.arrayBuffer()
  const decodeContext = new AudioContext()
  try {
    const decoded = await decodeContext.decodeAudioData(arrayBuffer.slice(0))
    const sampleRate = decoded.sampleRate
    const startFrame = Math.max(0, Math.floor(input.startSec * sampleRate))
    const maxFrames = Math.floor(input.durationSec * sampleRate)
    const frameLength = Math.max(
      1,
      Math.min(maxFrames, Math.max(1, decoded.length - startFrame)),
    )

    const clipContext = new OfflineAudioContext(
      decoded.numberOfChannels,
      frameLength,
      sampleRate,
    )
    const clipped = clipContext.createBuffer(
      decoded.numberOfChannels,
      frameLength,
      sampleRate,
    )

    for (let channel = 0; channel < decoded.numberOfChannels; channel += 1) {
      const sourceData = decoded.getChannelData(channel)
      const targetData = clipped.getChannelData(channel)
      targetData.set(sourceData.subarray(startFrame, startFrame + frameLength))
    }

    const source = clipContext.createBufferSource()
    source.buffer = clipped
    source.connect(clipContext.destination)
    source.start(0)

    const rendered = await clipContext.startRendering()
    const blob = encodeAudioBufferToWav(rendered)
    const normalizedBase = input.fileNameBase
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    const fileName = `${normalizedBase || "hook"}-${Math.round(input.startSec)}s.wav`
    return { blob, fileName }
  } finally {
    await decodeContext.close()
  }
}

