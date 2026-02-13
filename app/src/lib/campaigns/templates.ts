import type { CampaignSlot } from "@/lib/campaigns/planner"
import { withMashupsSignature } from "@/lib/growth/signature"
import type { MockMashup } from "@/lib/mock-data"

export type CreatorTier = "large" | "medium" | "emerging"

export interface CampaignTemplate {
  id: string
  name: string
  goal: string
  description: string
  targetTier: CreatorTier
  postCadence: string
  platformPattern: CampaignSlot["platform"][]
  clipPattern: CampaignSlot["clipLengthSec"][]
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

const templates: CampaignTemplate[] = [
  {
    id: "burst_launch",
    name: "Burst Launch",
    goal: "Acquire new viewers quickly",
    description:
      "High frequency posting concentrated around highest-conversion clip lengths.",
    targetTier: "large",
    postCadence: "2 clips/day peak days",
    platformPattern: ["TikTok", "Instagram", "YouTube"],
    clipPattern: [15, 30, 15],
  },
  {
    id: "steady_drip",
    name: "Steady Drip",
    goal: "Sustain weekly engagement",
    description:
      "Balanced daily cadence that keeps algorithm freshness while preserving production bandwidth.",
    targetTier: "medium",
    postCadence: "1 clip/day",
    platformPattern: ["Instagram", "TikTok", "YouTube"],
    clipPattern: [30, 60, 30],
  },
  {
    id: "challenge_sprint",
    name: "Challenge Sprint",
    goal: "Drive creator submissions and referrals",
    description:
      "Challenge-forward CTA sequence with strong attribution and referral hooks.",
    targetTier: "emerging",
    postCadence: "5 challenge clips/week",
    platformPattern: ["TikTok", "YouTube", "Instagram"],
    clipPattern: [15, 30, 60],
  },
]

export function getCampaignTemplates(): CampaignTemplate[] {
  return templates
}

function buildCaption(mashup: MockMashup, template: CampaignTemplate, day: string): string {
  return withMashupsSignature(
    `${mashup.title} | ${template.goal}. ${day} drop. License-safe creator clip.`,
  )
}

export function buildCampaignFromTemplate(
  mashups: MockMashup[],
  templateId: string,
): CampaignSlot[] {
  const template = templates.find((entry) => entry.id === templateId) ?? templates[0]
  const playable = mashups.filter((entry) => Boolean(entry.audioUrl)).slice(0, 7)
  if (playable.length === 0) return []

  return days.map((day, index) => {
    const mashup = playable[index % playable.length]
    const clipLengthSec = template.clipPattern[index % template.clipPattern.length]
    const platform = template.platformPattern[index % template.platformPattern.length]
    const dropSecond = Math.max(4, (index % 5) * 3 + 6)

    return {
      day,
      platform,
      clipLengthSec,
      hook: `${template.name}: hit the hook at ${dropSecond}s on ${platform}.`,
      caption: buildCaption(mashup, template, day),
      mashupId: mashup.id,
    }
  })
}

