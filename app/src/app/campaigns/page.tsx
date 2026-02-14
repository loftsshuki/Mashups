"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Ban, CalendarDays, Copy, Link2, Users } from "lucide-react"

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
import type { ReferralInviteSummary } from "@/lib/growth/referral-invites"
import { withMashupsSignature } from "@/lib/growth/signature"

const inviteStateLabels: Record<ReferralInviteSummary["state"], string> = {
  active: "Active",
  expiring_soon: "Expiring Soon",
  exhausted: "Exhausted",
  expired: "Expired",
}

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
  const [copiedInviteCode, setCopiedInviteCode] = useState<string | null>(null)
  const [invites, setInvites] = useState<ReferralInviteSummary[]>([])
  const [loadingInvites, setLoadingInvites] = useState(true)
  const [revokeCode, setRevokeCode] = useState<string | null>(null)

  const refreshInvites = useCallback(async () => {
    setLoadingInvites(true)
    try {
      const response = await fetch("/api/growth/referrals?limit=30", {
        method: "GET",
        cache: "no-store",
      })
      if (!response.ok) {
        setInvites([])
        return
      }
      const data = (await response.json()) as { invites?: ReferralInviteSummary[] }
      setInvites(Array.isArray(data.invites) ? data.invites : [])
    } finally {
      setLoadingInvites(false)
    }
  }, [])

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

  useEffect(() => {
    void refreshInvites()
  }, [refreshInvites])

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
        destination?: string
      }

      if (response.ok) {
        setInviteCode(data.code ?? null)
        setInviteLink(data.inviteUrl ?? data.destination ?? null)
        setInviteExpiresAt(data.expiresAt ?? null)
        setInviteRevSharePercent(data.revSharePercent ?? null)
        await refreshInvites()
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

  async function copyInviteCodeToClipboard(code: string) {
    await navigator.clipboard.writeText(code)
    setCopiedInviteCode(code)
    setTimeout(() => {
      setCopiedInviteCode((prev) => (prev === code ? null : prev))
    }, 1600)
  }

  async function revokeInvite(code: string) {
    setRevokeCode(code)
    try {
      const response = await fetch(`/api/growth/referrals/${encodeURIComponent(code)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke" }),
      })
      if (!response.ok) return

      const payload = (await response.json()) as { invite?: ReferralInviteSummary | null }
      if (payload.invite) {
        setInvites((prev) => prev.map((entry) => (entry.code === code ? payload.invite! : entry)))
      } else {
        await refreshInvites()
      }
    } finally {
      setRevokeCode(null)
    }
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

        <div className="mt-4 rounded-xl border border-border/60 bg-background/40 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Recent Invites</p>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full"
              onClick={() => void refreshInvites()}
              disabled={loadingInvites}
            >
              {loadingInvites ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          {loadingInvites ? (
            <p className="text-xs text-muted-foreground">Loading invite lifecycle data...</p>
          ) : null}

          {!loadingInvites && invites.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No invites generated yet for this account.
            </p>
          ) : null}

          {!loadingInvites && invites.length > 0 ? (
            <div className="space-y-2">
              {invites.map((invite) => (
                <div
                  key={invite.code}
                  className="rounded-xl border border-border/60 bg-background/60 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">{invite.code}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Campaign: {invite.campaignId} | Tier: {invite.creatorTier}
                      </p>
                    </div>
                    <Badge
                      variant={
                        invite.state === "active"
                          ? "default"
                          : invite.state === "expiring_soon"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {inviteStateLabels[invite.state]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Uses {invite.usesCount}/{invite.maxUses} | Remaining {invite.usesRemaining} | Rev
                    share {invite.revSharePercent.toFixed(1)}%
                  </p>
                  {invite.expiresAt ? (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Expires {new Date(invite.expiresAt).toLocaleString()}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full"
                      onClick={() => copyInviteCodeToClipboard(invite.code)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedInviteCode === invite.code ? "Copied Code" : "Copy Code"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full"
                      onClick={() => void navigator.clipboard.writeText(invite.destination)}
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Copy Destination
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full"
                      onClick={() => revokeInvite(invite.code)}
                      disabled={
                        revokeCode === invite.code ||
                        invite.state === "expired" ||
                        invite.state === "exhausted"
                      }
                    >
                      <Ban className="h-3.5 w-3.5" />
                      {revokeCode === invite.code ? "Revoking..." : "Revoke"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
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
