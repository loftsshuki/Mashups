"use client"

import { useState } from "react"
import { Check, Loader2, Share2, Smartphone, Video } from "lucide-react"

import { Button } from "@/components/ui/button"
import { trackGreenEvent } from "@/lib/analytics/green-room"
import type { GreenMashupRender } from "@/lib/audio/green-demo-engine"
import { renderGreenVerticalVideo, shareOrDownloadGreenVideo, supportsGreenVideoExport, type GreenVideoDuration } from "@/lib/audio/green-video-export"
import type { GreenCatalogTrack } from "@/lib/catalog/green-catalog"
import { cn } from "@/lib/utils"

export function GreenShareExport({ render, left, right }: { render: GreenMashupRender; left: GreenCatalogTrack; right: GreenCatalogTrack }) {
  const [duration, setDuration] = useState<GreenVideoDuration>(15)
  const [progress, setProgress] = useState(0)
  const [state, setState] = useState<"idle" | "rendering" | "complete" | "error">("idle")
  const [message, setMessage] = useState<string | null>(null)
  const [supported] = useState(() => supportsGreenVideoExport())

  async function createAndShare() {
    setState("rendering")
    setMessage(null)
    setProgress(0)
    trackGreenEvent("video_export_started", { style: render.style, duration })
    try {
      const output = await renderGreenVerticalVideo(render, {
        leftTitle: left.title,
        leftArtist: left.artist,
        leftPassport: left.rights.passportId,
        rightTitle: right.title,
        rightArtist: right.artist,
        rightPassport: right.rights.passportId,
        arrangementTitle: render.title,
        qualityScore: render.qualityScore,
        accent: left.color,
      }, duration, setProgress)
      trackGreenEvent("video_export_completed", { style: render.style, duration, mime_type: output.mimeType })
      const result = await shareOrDownloadGreenVideo(output, `${left.title} x ${right.title}`)
      trackGreenEvent("share_started", { style: render.style, destination: result === "shared" ? "native_share" : "video_download" })
      setState("complete")
      setMessage(result === "shared" ? "Share sheet opened with the watermarked clip." : "Watermarked video downloaded.")
    } catch (error) {
      trackGreenEvent("video_export_failed", { style: render.style, duration })
      setState("error")
      setMessage(error instanceof Error ? error.message : "Video export failed.")
    }
  }

  return <div className="border border-foreground bg-card p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="mono-label text-primary">Rights-safe handoff</p><h3 className="display-type mt-3 text-3xl">Vertical clip, not a loose master.</h3></div>
      <Smartphone className="size-6" />
    </div>
    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">The video carries both source passports, Mashups attribution, arrangement quality, and a permanent watermark. No standalone audio leaves the Green Room.</p>
    <div className="mt-5 grid grid-cols-2 border border-foreground">
      {([15, 30] as const).map((seconds) => <button key={seconds} type="button" onClick={() => setDuration(seconds)} className={cn("min-h-11 font-semibold", seconds === 30 && "border-l border-foreground", duration === seconds ? "bg-foreground text-background" : "bg-background hover:bg-secondary")}>{seconds} seconds</button>)}
    </div>
    <Button className="mt-4 min-h-12 w-full" disabled={!supported || state === "rendering"} onClick={() => void createAndShare()}>
      {state === "rendering" ? <><Loader2 className="animate-spin" />Encoding {progress}%</> : state === "complete" ? <><Check />Make another clip</> : <><Video />Render and share</>}
    </Button>
    {!supported ? <p role="status" className="mt-3 text-xs text-muted-foreground">Video encoding is unavailable in this browser. Open Mashups in current Safari, Chrome, or Edge.</p> : null}
    {message ? <p role={state === "error" ? "alert" : "status"} className={cn("mt-3 border border-foreground p-3 text-xs", state === "error" ? "bg-destructive/10 text-destructive" : "bg-secondary")}><Share2 className="mr-2 inline size-3.5" />{message}</p> : null}
  </div>
}
