import { GREEN_ARRANGEMENT_IDS, type GreenArrangementId } from "@mashups/contracts"

import type { GreenCatalogTrack, GreenPairAssessment } from "@/lib/catalog/green-catalog"

export type GreenArrangementSegment = {
  name: "intro" | "verse" | "build" | "transition" | "drop" | "outro"
  startBar: number
  bars: number
  grooveSource: "a" | "b" | null
  harmonySource: "a" | "b" | null
  toplineSource: "a" | "b" | null
  transition: "none" | "riser" | "impact"
}

export type GreenArrangementPlan = {
  id: GreenArrangementId
  title: string
  description: string
  targetBpm: number
  totalBars: 16
  phraseBars: 4
  sidechainDuckDb: number
  qualityScore: number
  segments: GreenArrangementSegment[]
}

export function buildGreenArrangementPlans(
  left: GreenCatalogTrack,
  right: GreenCatalogTrack,
  assessment: GreenPairAssessment,
): GreenArrangementPlan[] {
  const targetBpm = Math.round((left.bpm + right.bpm) / 2)
  const shared = { targetBpm, totalBars: 16 as const, phraseBars: 4 as const }
  const plans: Record<GreenArrangementId, GreenArrangementPlan> = {
    "vocal-a-over-b": {
      ...shared,
      id: "vocal-a-over-b",
      title: "A Voice / B Body",
      description: `${left.title}'s topline enters after a clean two-bar runway over ${right.title}'s groove.`,
      sidechainDuckDb: -3.5,
      qualityScore: arrangementScore(assessment, assessment.vocalCollisionRisk === "medium" ? -4 : 1),
      segments: [
        segment("intro", 0, 2, "b", "b", null),
        segment("verse", 2, 6, "b", "b", "a"),
        segment("build", 8, 4, "b", "b", "a", "riser"),
        segment("drop", 12, 2, "b", "b", "a", "impact"),
        segment("outro", 14, 2, "b", "b", null),
      ],
    },
    "vocal-b-over-a": {
      ...shared,
      id: "vocal-b-over-a",
      title: "B Voice / A Body",
      description: `${right.title}'s topline rides ${left.title}'s rhythm with phrase-level breathing room.`,
      sidechainDuckDb: -3.5,
      qualityScore: arrangementScore(assessment, left.energy < right.energy ? 2 : -2),
      segments: [
        segment("intro", 0, 2, "a", "a", null),
        segment("verse", 2, 6, "a", "a", "b"),
        segment("build", 8, 4, "a", "a", "b", "riser"),
        segment("drop", 12, 2, "a", "a", "b", "impact"),
        segment("outro", 14, 2, "a", "a", null),
      ],
    },
    "drop-swap": {
      ...shared,
      id: "drop-swap",
      title: "Phrase-Matched Drop Swap",
      description: `${left.title} owns the setup; ${right.title} lands on bar nine without overlapping toplines.`,
      sidechainDuckDb: -2.5,
      qualityScore: arrangementScore(assessment, assessment.vocalCollisionRisk === "medium" ? 5 : 3),
      segments: [
        segment("intro", 0, 2, "a", "a", null),
        segment("verse", 2, 4, "a", "a", "a"),
        segment("transition", 6, 2, "a", "a", null, "riser"),
        segment("drop", 8, 6, "b", "b", "b", "impact"),
        segment("outro", 14, 2, "b", "b", null),
      ],
    },
  }
  return GREEN_ARRANGEMENT_IDS.map((id) => plans[id])
}

function segment(
  name: GreenArrangementSegment["name"],
  startBar: number,
  bars: number,
  grooveSource: GreenArrangementSegment["grooveSource"],
  harmonySource: GreenArrangementSegment["harmonySource"],
  toplineSource: GreenArrangementSegment["toplineSource"],
  transition: GreenArrangementSegment["transition"] = "none",
): GreenArrangementSegment {
  return { name, startBar, bars, grooveSource, harmonySource, toplineSource, transition }
}

function arrangementScore(assessment: GreenPairAssessment, adjustment: number) {
  return Math.max(0, Math.min(100, assessment.score + adjustment))
}
