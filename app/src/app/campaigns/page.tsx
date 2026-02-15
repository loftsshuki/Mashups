"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Copy, Link2, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  NeonGrid,
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import {
  getCampaignTemplates,
  type CreatorTier,
} from "@/lib/campaigns/templates"
import type { CampaignSlot } from "@/lib/campaigns/planner"
import { withMashupsSignature } from "@/lib/growth/signature"

export default function CampaignsPage() {
  const templates = getCampaignTemplates()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id ?? "burst_launch",
  )
  const selectedTemplate = useMemo(
    () =>
      templates.find((template) => template.id === selectedTemplateId) ?? templates[0],
    [selectedTemplateId, templates],
  )
  const [slots, setSlots] = useState<CampaignSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(true)

  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [loadingSlotKey, setLoadingSlotKey] = useState<string | null>(null)
  const [copiedSlotKey, setCopiedSlotKey] = useState<string | null>(null)

  const [inviteTier, setInviteTier] = useState<CreatorTier>(
    selectedTemplate?.targetTier ?? "emerging",
  )
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [inviteExpiresAt, setInviteExpiresAt] = useState<string | null>(null)
  const [inviteRevSharePercent, setInviteRevSharePercent] = useState<number | null>(null)
  const [generatingInvite, setGeneratingInvite] = useState(false)
  const [copiedInvite, setCopiedInvite] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadSlots(templateId: string) {
      setLoadingSlots(true)
      try {
        const response = await fetch(
          `/api/campaigns/slots?templateId=${encodeURIComponent(templateId)}`,
          { cache: "no-store" },
        )
        if (!response.ok) return
        const payload = (await response.json()) as { slots?: CampaignSlot[] }
        if (!cancelled && Array.isArray(payload.slots)) {
          setSlots(payload.slots)
        }
      } finally {
        if (!cancelled) setLoadingSlots(false)
      }
    }

    void loadSlots(selectedTemplateId)
    return () => {
      cancelled = true
    }
  }, [selectedTemplateId])

  async function generateInvite() {
    if (!selectedTemplate) return

    setGeneratingInvite(true)
    try {
      const response = await fetch("/api/growth/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: `${selectedTemplate.id}-${new Date().toISOString().slice(0, 10)}`,
          creatorTier: inviteTier,
          destination: `${window.location.origin}/signup`,
        }),
      })
      const data = (await response.json()) as {
        code?: string
        inviteUrl?: string
        expiresAt?: string
        revSharePercent?: number
      }

      if (response.ok) {
        setInviteCode(data.code ?? null)
        setInviteLink(data.inviteUrl ?? null)
        setInviteExpiresAt(data.expiresAt ?? null)
        setInviteRevSharePercent(data.revSharePercent ?? null)
      }
    } finally {
      setGeneratingInvite(false)
    }
  }

  async function copyInviteLink() {
    if (!inviteLink) return
    await navigator.clipboard.writeText(inviteLink)
    setCopiedInvite(true)
    setTimeout(() => setCopiedInvite(false), 1600)
  }

  async function generateLink(slotKey: string, day: string) {
    setLoadingSlotKey(slotKey)
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
      setLoadingSlotKey(null)
    }
  }

  async function copyCaption(slotKey: string, caption: string) {
    const value = generatedLink
      ? `${withMashupsSignature(caption)}\n${generatedLink}`
      : withMashupsSignature(caption)
    await navigator.clipboard.writeText(value)
    setCopiedSlotKey(slotKey)
    setTimeout(() => setCopiedSlotKey((prev) => (prev === slotKey ? null : prev)), 1800)
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
              <p className="text-sm font-medium text-foreground">
                Auto-generated weekly slots
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Build, copy, sign, publish, and recruit creators in one flow.
              </p>
            </div>
          </div>
        }
      />

      <section id="cohort-invites" className="neon-panel mb-8 rounded-2xl p-4">
        <NeonSectionHeader
          title="Template + Cohort Setup"
          description="Select campaign pattern and generate referral invites for creator cohorts."
        />

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Campaign Template</p>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="mb-1 text-xs text-muted-foreground">Creator Tier</p>
            <Select value={inviteTier} onValueChange={(value) => setInviteTier(value as CreatorTier)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="emerging">Emerging</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button
              className="w-full rounded-full md:w-auto"
              onClick={generateInvite}
              disabled={generatingInvite}
            >
              <Users className="h-4 w-4" />
              {generatingInvite ? "Generating..." : "Generate Invite"}
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={copyInviteLink}
              disabled={!inviteLink}
            >
              <Copy className="h-4 w-4" />
              {copiedInvite ? "Copied" : "Copy Link"}
            </Button>
          </div>
        </div>

        {selectedTemplate ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{selectedTemplate.goal}</Badge>
            <Badge variant="outline">Tier: {selectedTemplate.targetTier}</Badge>
            <Badge variant="outline">Cadence: {selectedTemplate.postCadence}</Badge>
          </div>
        ) : null}

        {inviteLink ? (
          <div className="mt-3 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-foreground">
            Invite {inviteCode ? `(${inviteCode})` : ""}:{" "}
            <a href={inviteLink} className="text-primary underline" target="_blank" rel="noreferrer">
              {inviteLink}
            </a>
            {inviteExpiresAt ? (
              <p className="mt-1 text-muted-foreground">
                Expires {new Date(inviteExpiresAt).toLocaleString()}
              </p>
            ) : null}
            {inviteRevSharePercent !== null ? (
              <p className="mt-1 text-muted-foreground">
                Referral revenue share: {inviteRevSharePercent.toFixed(1)}%
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <NeonSectionHeader
        title="Campaign Slots"
        description={
          selectedTemplate
            ? `Each slot follows ${selectedTemplate.name}: ${selectedTemplate.description}`
            : "Each slot is a complete brief with hook, caption, and attribution link action."
        }
      />
      <NeonGrid>
        {slots.map((slot, index) => {
          const slotKey = `${slot.day}-${slot.platform}-${slot.mashupId}-${index}`
          return (
            <div key={slotKey} className="neon-panel rounded-2xl p-4">
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
                  onClick={() => copyCaption(slotKey, slot.caption)}
                >
                  <Copy className="h-4 w-4" />
                  {copiedSlotKey === slotKey ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => generateLink(slotKey, slot.day)}
                  disabled={loadingSlotKey === slotKey}
                >
                  <Link2 className="h-4 w-4" />
                  {loadingSlotKey === slotKey ? "Generating..." : "Sign Link"}
                </Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground">{slot.hook}</p>
            <p className="mt-1 text-xs text-muted-foreground">{slot.caption}</p>
          </div>
          )
        })}
      </NeonGrid>

      {loadingSlots ? (
        <p className="mt-4 text-xs text-muted-foreground">Refreshing campaign slots...</p>
      ) : null}

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
