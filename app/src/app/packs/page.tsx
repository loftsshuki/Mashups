"use client"

import { useEffect, useState } from "react"
import { CalendarDays, Copy, Link2, PackageOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  NeonGrid,
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import { withMashupsSignature } from "@/lib/growth/signature"
import { getWeeklyViralPack } from "@/lib/data/viral-packs"
import type { WeeklyViralPack } from "@/lib/growth/viral-pack"

export default function ViralPacksPage() {
  const [pack, setPack] = useState<WeeklyViralPack | null>(null)
  const [loadingPack, setLoadingPack] = useState(true)
  const [loadingClipId, setLoadingClipId] = useState<string | null>(null)
  const [copiedClipId, setCopiedClipId] = useState<string | null>(null)
  const [signedLinks, setSignedLinks] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false

    async function loadPack() {
      setLoadingPack(true)
      try {
        const nextPack = await getWeeklyViralPack()
        if (!cancelled) {
          setPack(nextPack)
        }
      } finally {
        if (!cancelled) setLoadingPack(false)
      }
    }

    void loadPack()

    return () => {
      cancelled = true
    }
  }, [])

  async function ensureSignedLink(clipId: string) {
    if (!pack) return `${window.location.origin}/explore?rights=safe`
    if (signedLinks[clipId]) return signedLinks[clipId]
    setLoadingClipId(clipId)
    try {
      const response = await fetch("/api/attribution/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: `${pack.id}-${clipId}`,
          creatorId: "viral-pack",
          destination: `${window.location.origin}/explore?rights=safe`,
          source: "weekly_viral_pack",
        }),
      })

      if (response.ok) {
        const data = (await response.json()) as { url?: string }
        if (data.url) {
          const nextUrl = data.url
          setSignedLinks((prev) => ({ ...prev, [clipId]: nextUrl }))
          return nextUrl
        }
      }
      return `${window.location.origin}/explore?rights=safe`
    } finally {
      setLoadingClipId(null)
    }
  }

  async function copyExportPackage(
    clipId: string,
    title: string,
    startSec: number,
    durationSec: number,
  ) {
    if (!pack) return
    const link = await ensureSignedLink(clipId)
    const exportCopy = withMashupsSignature(
      `${title} | ${durationSec}s clip starting at ${startSec.toFixed(1)}s.\n${link}`,
    )
    await navigator.clipboard.writeText(exportCopy)
    setCopiedClipId(clipId)
    setTimeout(() => setCopiedClipId((prev) => (prev === clipId ? null : prev)), 1800)
  }

  return (
    <NeonPage className="max-w-6xl">
      <NeonHero
        eyebrow="Weekly Viral Pack"
        title="20 rights-safe hook-ready clips, refreshed every Monday."
        description="Use pre-structured cuts with signed attribution links and auto-caption copy for fast posting."
        aside={
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-primary" />
              Published week {pack?.publishWeek ?? "loading"}
            </p>
            <p className="text-xs text-muted-foreground">
              {pack?.day === "Monday"
                ? "Fresh Monday drop is live."
                : "Using most recent Monday drop."}
            </p>
          </div>
        }
      />

      <NeonSectionHeader
        title="Pack Contents"
        description={
          loadingPack || !pack
            ? "Loading weekly pack..."
            : `${pack.clipCount} clips tuned for short-form hook performance.`
        }
      />
      <NeonGrid>
        {(pack?.clips ?? []).map((clip) => (
          <div key={clip.id} className="neon-panel rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{clip.title}</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="default">Rights-Safe {clip.rightsScore}</Badge>
                <Badge variant="outline">{clip.structure}</Badge>
                <Badge variant="outline">{clip.clipLengthSec}s</Badge>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Creator {clip.creatorName} | start {clip.clipStartSec.toFixed(1)}s | confidence{" "}
              {(clip.confidence * 100).toFixed(0)}%
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => copyExportPackage(clip.id, clip.title, clip.clipStartSec, clip.clipLengthSec)}
                disabled={loadingClipId === clip.id}
              >
                <Copy className="h-4 w-4" />
                {copiedClipId === clip.id
                  ? "Copied"
                  : loadingClipId === clip.id || loadingPack
                    ? "Signing..."
                    : "Copy Export"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={async () => {
                  const link = await ensureSignedLink(clip.id)
                  window.open(link, "_blank", "noopener,noreferrer")
                }}
              >
                <Link2 className="h-4 w-4" />
                Open Link
              </Button>
              <Badge variant="secondary">
                <PackageOpen className="h-3.5 w-3.5" />
                Weekly Pack
              </Badge>
            </div>
          </div>
        ))}
      </NeonGrid>
    </NeonPage>
  )
}
