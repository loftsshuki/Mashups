"use client"

import { useState } from "react"
import { CalendarDays, Copy, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buildWeeklyCampaign } from "@/lib/campaigns/planner"
import { mockMashups } from "@/lib/mock-data"
import { withMashupsSignature } from "@/lib/growth/signature"

export default function CampaignsPage() {
  const slots = buildWeeklyCampaign(mockMashups)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [loadingDay, setLoadingDay] = useState<string | null>(null)
  const [copiedDay, setCopiedDay] = useState<string | null>(null)

  async function generateLink(day: string) {
    setLoadingDay(day)
    try {
      const response = await fetch("/api/attribution/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: `weekly-${day.toLowerCase()}`,
          creatorId: "creator-demo",
          destination: `${window.location.origin}/explore`,
        }),
      })
      const data = (await response.json()) as { url?: string }
      if (data.url) setGeneratedLink(data.url)
    } finally {
      setLoadingDay(null)
    }
  }

  async function copyCaption(day: string, caption: string) {
    const value = generatedLink
      ? `${withMashupsSignature(caption)}\n${generatedLink}`
      : withMashupsSignature(caption)
    await navigator.clipboard.writeText(value)
    setCopiedDay(day)
    setTimeout(() => setCopiedDay((prev) => (prev === day ? null : prev)), 1800)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <div className="mb-8 flex items-center gap-2">
        <CalendarDays className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Campaign Builder</h1>
          <p className="text-sm text-muted-foreground">
            Weekly short-form plan with platform-ready hooks and captions.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {slots.map((slot) => (
          <div key={`${slot.day}-${slot.platform}`} className="rounded-lg border border-border/50 bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {slot.day} - {slot.platform} - {slot.clipLengthSec}s
                </p>
                <p className="text-xs text-muted-foreground">Mashup: {slot.mashupId}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyCaption(slot.day, slot.caption)}
              >
                <Copy className="h-4 w-4" />
                {copiedDay === slot.day ? "Copied" : "Copy Caption"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateLink(slot.day)}
                disabled={loadingDay === slot.day}
              >
                <Link2 className="h-4 w-4" />
                {loadingDay === slot.day ? "Generating..." : "Generate Link"}
              </Button>
            </div>
            <p className="mt-2 text-sm text-foreground">{slot.hook}</p>
            <p className="mt-1 text-xs text-muted-foreground">{slot.caption}</p>
          </div>
        ))}
      </div>
      {generatedLink && (
        <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground">
          Attribution link generated:{" "}
          <a href={generatedLink} className="text-primary underline" target="_blank" rel="noreferrer">
            {generatedLink}
          </a>
        </div>
      )}
    </div>
  )
}
