import type { GreenMashupRender } from "./green-demo-engine"

export type GreenVideoDuration = 15 | 30

export type GreenVideoMetadata = {
  leftTitle: string
  leftArtist: string
  leftPassport: string
  rightTitle: string
  rightArtist: string
  rightPassport: string
  arrangementTitle: string
  qualityScore: number
  accent: string
}

const VIDEO_MIME_TYPES = [
  "video/mp4;codecs=h264,aac",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
] as const

export function selectGreenVideoMimeType(isSupported: (mime: string) => boolean) {
  return VIDEO_MIME_TYPES.find(isSupported) ?? null
}

export function supportsGreenVideoExport() {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return false
  const canvas = document.createElement("canvas")
  return typeof canvas.captureStream === "function" && selectGreenVideoMimeType((mime) => MediaRecorder.isTypeSupported(mime)) !== null
}

export async function renderGreenVerticalVideo(
  render: GreenMashupRender,
  metadata: GreenVideoMetadata,
  duration: GreenVideoDuration,
  onProgress?: (progress: number) => void,
) {
  if (!supportsGreenVideoExport()) throw new Error("This browser cannot render a local video. Use current Safari, Chrome, or Edge.")
  const mimeType = selectGreenVideoMimeType((mime) => MediaRecorder.isTypeSupported(mime))
  if (!mimeType) throw new Error("No supported video encoder is available.")

  const canvas = document.createElement("canvas")
  canvas.width = 540
  canvas.height = 960
  const context = canvas.getContext("2d", { alpha: false })
  if (!context) throw new Error("Canvas rendering is unavailable.")
  const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) throw new Error("Web Audio is unavailable.")

  const audioContext = new AudioContextClass()
  const decoded = await audioContext.decodeAudioData(await render.audioBlob.arrayBuffer())
  const destination = audioContext.createMediaStreamDestination()
  const source = audioContext.createBufferSource()
  const gain = audioContext.createGain()
  source.buffer = decoded
  gain.gain.value = 0.94
  source.connect(gain).connect(destination)

  const canvasStream = canvas.captureStream(24)
  for (const track of destination.stream.getAudioTracks()) canvasStream.addTrack(track)
  const recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 3_200_000, audioBitsPerSecond: 160_000 })
  const chunks: BlobPart[] = []
  recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data) }

  const actualDuration = Math.min(duration, decoded.duration)
  let animationFrame = 0
  let timeout = 0
  const startedAt = performance.now()
  const completed = new Promise<void>((resolve, reject) => {
    recorder.onerror = () => reject(new Error("Video encoding failed."))
    recorder.onstop = () => resolve()
  })

  const draw = () => {
    const elapsed = Math.min(actualDuration, (performance.now() - startedAt) / 1000)
    drawGreenFrame(context, canvas.width, canvas.height, elapsed, actualDuration, metadata)
    onProgress?.(Math.round((elapsed / actualDuration) * 100))
    if (elapsed < actualDuration) animationFrame = requestAnimationFrame(draw)
  }

  try {
    drawGreenFrame(context, canvas.width, canvas.height, 0, actualDuration, metadata)
    recorder.start(500)
    await audioContext.resume()
    source.start(0, 0, actualDuration)
    draw()
    timeout = window.setTimeout(() => { if (recorder.state !== "inactive") recorder.stop() }, actualDuration * 1000 + 250)
    source.onended = () => { if (recorder.state !== "inactive") recorder.stop() }
    await completed
  } finally {
    cancelAnimationFrame(animationFrame)
    window.clearTimeout(timeout)
    source.disconnect()
    gain.disconnect()
    for (const track of canvasStream.getTracks()) track.stop()
    await audioContext.close()
  }

  const extension = mimeType.startsWith("video/mp4") ? "mp4" : "webm"
  const fileName = `${slug(metadata.leftTitle)}-x-${slug(metadata.rightTitle)}-${render.style}-${duration}s.${extension}`
  return { blob: new Blob(chunks, { type: mimeType }), fileName, mimeType, duration: actualDuration }
}

export async function shareOrDownloadGreenVideo(output: { blob: Blob; fileName: string }, title: string) {
  const file = new File([output.blob], output.fileName, { type: output.blob.type })
  if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
    await navigator.share({ title, text: "Made from a rights-cleared Green Catalog pairing on Mashups.", files: [file] })
    return "shared" as const
  }
  const url = URL.createObjectURL(output.blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = output.fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
  return "downloaded" as const
}

function drawGreenFrame(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  duration: number,
  metadata: GreenVideoMetadata,
) {
  const progress = elapsed / duration
  context.fillStyle = "#f2efe5"
  context.fillRect(0, 0, width, height)
  context.fillStyle = metadata.accent
  context.fillRect(0, 0, width, 18)
  context.fillRect(0, height - 18, width, 18)
  context.strokeStyle = "#13130f"
  context.lineWidth = 2
  for (let x = -height; x < width + height; x += 42) {
    context.globalAlpha = 0.08
    context.beginPath()
    context.moveTo(x + progress * 42, 0)
    context.lineTo(x + height + progress * 42, height)
    context.stroke()
  }
  context.globalAlpha = 1
  context.fillStyle = "#13130f"
  context.font = "700 17px monospace"
  context.fillText("MASHUPS / GREEN ROOM", 34, 60)
  context.textAlign = "right"
  context.fillText(`${Math.ceil(duration - elapsed)} SEC`, width - 34, 60)
  context.textAlign = "left"

  context.font = "900 64px sans-serif"
  context.fillText(metadata.leftTitle.toUpperCase(), 34, 176, width - 68)
  context.fillStyle = metadata.accent
  context.fillText("×", 34, 246)
  context.fillStyle = "#13130f"
  context.fillText(metadata.rightTitle.toUpperCase(), 34, 316, width - 68)
  context.font = "600 19px sans-serif"
  context.fillText(`${metadata.leftArtist} / ${metadata.rightArtist}`, 36, 356, width - 72)

  const centerY = 560
  const barCount = 32
  const barWidth = 9
  const gap = 6
  for (let index = 0; index < barCount; index += 1) {
    const pulse = Math.sin(index * 1.71 + elapsed * 5.4) * 0.5 + 0.5
    const phrase = index % 8 === 0 ? 1 : 0.58
    const barHeight = 34 + pulse * 150 * phrase
    context.fillStyle = index / barCount <= progress ? metadata.accent : "#13130f"
    context.fillRect(34 + index * (barWidth + gap), centerY - barHeight / 2, barWidth, barHeight)
  }

  context.strokeStyle = "#13130f"
  context.globalAlpha = 0.25
  context.strokeRect(34, 700, width - 68, 1)
  context.globalAlpha = 1
  context.font = "900 34px sans-serif"
  context.fillStyle = "#13130f"
  context.fillText(metadata.arrangementTitle.toUpperCase(), 34, 758, width - 68)
  context.font = "700 15px monospace"
  context.fillText(`QUALITY ${metadata.qualityScore} / 100`, 34, 802)
  context.fillText(`${metadata.leftPassport} + ${metadata.rightPassport}`, 34, 836, width - 68)
  context.fillStyle = metadata.accent
  context.fillRect(34, 880, (width - 68) * progress, 8)
  context.strokeStyle = "#13130f"
  context.strokeRect(34, 880, width - 68, 8)
  context.fillStyle = "#13130f"
  context.font = "700 14px monospace"
  context.fillText("MAKE YOUR VERSION / MASHUPS.AGENCY", 34, 922)
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "mashup"
}
