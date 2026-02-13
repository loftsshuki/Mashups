"use client"

import { useState } from "react"
import { CalendarDays, Copy, Link2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  NeonGrid,
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
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
    <NeonPage className="max-w-6xl">
      <NeonHero
        eyebrow="Campaign Builder"
        title="Weekly short-form plan with platform-ready hooks and captions."
        description="This follows the same Neon-style narrative rhythm: command panel + actionable rows + attribution output."
        aside={
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-1 h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Auto-generated weekly slots</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Build, copy, sign, and publish without leaving this page.
              </p>
            </div>
          </div>
        }
      />

      <NeonSectionHeader
        title="Campaign Slots"
        description="Each slot is a complete brief with hook, caption, and attribution link action."
      />
      <NeonGrid>
        {slots.map((slot) => (
          <div key={`${slot.day}-${slot.platform}`} className="neon-panel rounded-2xl p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {slot.day} | {slot.platform} | {slot.clipLengthSec}s
                </p>
                <p className="text-xs text-muted-foreground">Mashup: {slot.mashupId}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => copyCaption(slot.day, slot.caption)}
                >
                  <Copy className="h-4 w-4" />
                  {copiedDay === slot.day ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => generateLink(slot.day)}
                  disabled={loadingDay === slot.day}
                >
                  <Link2 className="h-4 w-4" />
                  {loadingDay === slot.day ? "Generating..." : "Sign Link"}
                </Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground">{slot.hook}</p>
            <p className="mt-1 text-xs text-muted-foreground">{slot.caption}</p>
          </div>
        ))}
      </NeonGrid>

      {generatedLink ? (
        <div className="mt-4 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-foreground">
          Attribution link generated:{" "}
          <a
            href={generatedLink}
            className="text-primary underline"
            target="_blank"
            rel="noreferrer"
          >
            {generatedLink}
          </a>
        </div>
      ) : null}
    </NeonPage>
  )
}

