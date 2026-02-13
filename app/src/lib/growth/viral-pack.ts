import { getRightsSafetyAssessment, isRightsSafe } from "@/lib/data/rights-safety"
import type { MockMashup } from "@/lib/mock-data"

export type HookStructure = "cold_open" | "drop_first" | "vocal_tease" | "beat_switch"

export interface ViralPackClip {
  id: string
  mashupId: string
  title: string
  creatorName: string
  structure: HookStructure
  clipStartSec: number
  clipLengthSec: 15 | 30
  confidence: number
  rightsSafe: boolean
  rightsScore: number
}

export interface WeeklyViralPack {
  id: string
  publishedAt: string
  publishWeek: string
  day: "Monday" | "Other"
  clipCount: number
  clips: ViralPackClip[]
}

const structures: HookStructure[] = [
  "cold_open",
  "drop_first",
  "vocal_tease",
  "beat_switch",
]

function toWeekLabel(date: Date): string {
  const monday = new Date(date)
  const day = monday.getDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(monday.getDate() + diff)
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(
    monday.getDate(),
  ).padStart(2, "0")}`
}

function getWeekPublishedAt(now = new Date()): Date {
  const date = new Date(now)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(9, 0, 0, 0)
  return date
}

function computeConfidence(mashup: MockMashup, structure: HookStructure): number {
  const base = Math.min(0.98, 0.62 + mashup.likeCount / 80_000 + mashup.commentCount / 30_000)
  const structureBoost =
    structure === "drop_first"
      ? 0.08
      : structure === "cold_open"
        ? 0.06
        : structure === "vocal_tease"
          ? 0.04
          : 0.03
  return Math.min(0.99, Number((base + structureBoost).toFixed(2)))
}

export function buildWeeklyViralPack(
  mashups: MockMashup[],
  now = new Date(),
): WeeklyViralPack {
  const mondayRelease = getWeekPublishedAt(now)
  const safePool = mashups
    .map((mashup) => ({
      mashup,
      safety: getRightsSafetyAssessment(mashup.id),
    }))
    .filter((entry) => isRightsSafe(entry.safety))
    .sort((a, b) => b.safety.score - a.safety.score)
  const sourcePool =
    safePool.length > 0
      ? safePool
      : mashups.map((mashup) => ({
          mashup,
          safety: getRightsSafetyAssessment(mashup.id),
        }))

  const clips: ViralPackClip[] = []
  for (let i = 0; i < 20; i += 1) {
    const entry = sourcePool[i % Math.max(1, sourcePool.length)]
    if (!entry) break

    const structure = structures[i % structures.length]
    const clipLengthSec: 15 | 30 = i % 3 === 0 ? 30 : 15
    const clipStartSec = Math.max(
      0,
      (i % 2 === 0 ? 6 : 12) + (entry.mashup.bpm % 8) + (i % 5) * 2,
    )

    clips.push({
      id: `pack-clip-${i + 1}`,
      mashupId: entry.mashup.id,
      title: entry.mashup.title,
      creatorName: entry.mashup.creator.displayName,
      structure,
      clipStartSec,
      clipLengthSec,
      confidence: computeConfidence(entry.mashup, structure),
      rightsSafe: true,
      rightsScore: entry.safety.score,
    })
  }

  return {
    id: `viral-pack-${toWeekLabel(mondayRelease)}`,
    publishedAt: mondayRelease.toISOString(),
    publishWeek: toWeekLabel(mondayRelease),
    day: now.getDay() === 1 ? "Monday" : "Other",
    clipCount: clips.length,
    clips,
  }
}
