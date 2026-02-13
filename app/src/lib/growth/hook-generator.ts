import { withMashupsSignature } from "@/lib/growth/signature"

export interface HookCutPoint {
  index: 1 | 2 | 3
  startSec: number
  durationSec: 15
  reason: string
}

export interface HookGeneratorResult {
  mashupId: string
  title: string
  cutPoints: HookCutPoint[]
  captionVariants: string[]
  recommendedPostWindows: Array<{
    platform: "TikTok" | "Instagram" | "YouTube"
    bestTimeLocal: string
  }>
}

export interface HookGeneratorInput {
  mashupId: string
  title: string
  bpm?: number | null
  durationSec?: number | null
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function generateHookCuts(input: HookGeneratorInput): HookGeneratorResult {
  const bpm = input.bpm ?? 120
  const duration = clamp(Math.round(input.durationSec ?? 180), 45, 600)
  const beatWindow = Math.max(2, Math.round(60 / bpm * 8))

  const starts = [
    clamp(beatWindow + 2, 0, duration - 15),
    clamp(Math.round(duration * 0.32), 0, duration - 15),
    clamp(Math.round(duration * 0.54), 0, duration - 15),
  ] as const

  const cutPoints: HookCutPoint[] = [
    {
      index: 1,
      startSec: starts[0],
      durationSec: 15,
      reason: "Early hook capture for immediate retention.",
    },
    {
      index: 2,
      startSec: starts[1],
      durationSec: 15,
      reason: "Mid-drop energy spike for loopability.",
    },
    {
      index: 3,
      startSec: starts[2],
      durationSec: 15,
      reason: "Secondary switch point to extend replay value.",
    },
  ]

  const captionVariants = [
    withMashupsSignature(`${input.title} in 15 seconds. Which cut wins?`),
    withMashupsSignature(`Drop test: ${input.title}. Stitch this and tag your version.`),
    withMashupsSignature(`${input.title} hook pass. Rights-safe clip for your next short.`),
  ]

  return {
    mashupId: input.mashupId,
    title: input.title,
    cutPoints,
    captionVariants,
    recommendedPostWindows: [
      { platform: "TikTok", bestTimeLocal: "7:30 PM" },
      { platform: "Instagram", bestTimeLocal: "12:15 PM" },
      { platform: "YouTube", bestTimeLocal: "5:45 PM" },
    ],
  }
}

