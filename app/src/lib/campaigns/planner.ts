import type { MockMashup } from "@/lib/mock-data"
import { withMashupsSignature } from "@/lib/growth/signature"

export interface CampaignSlot {
  day: string
  platform: "TikTok" | "Instagram" | "YouTube"
  clipLengthSec: 15 | 30 | 60
  hook: string
  caption: string
  mashupId: string
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const
const platforms: CampaignSlot["platform"][] = ["TikTok", "Instagram", "YouTube"]
const lengths: CampaignSlot["clipLengthSec"][] = [15, 30, 60]

export function buildWeeklyCampaign(mashups: MockMashup[]): CampaignSlot[] {
  const playable = mashups.filter((m) => Boolean(m.audioUrl)).slice(0, 7)
  if (playable.length === 0) return []

  return days.map((day, index) => {
    const mashup = playable[index % playable.length]
    const platform = platforms[index % platforms.length]
    const clipLengthSec = lengths[index % lengths.length]
    return {
      day,
      platform,
      clipLengthSec,
      hook: `${mashup.title} drop at ${Math.max(8, index * 2 + 6)}s`,
      caption: withMashupsSignature(
        `${mashup.title} remix energy. License-safe short clip.`,
      ),
      mashupId: mashup.id,
    }
  })
}
