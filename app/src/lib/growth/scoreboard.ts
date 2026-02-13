import { computeMomentum } from "@/lib/growth/momentum"
import type { MockCreator, MockMashup } from "@/lib/mock-data"

export interface CreatorScoreboardRow {
  rank: number
  username: string
  displayName: string
  avatarUrl: string
  weeklyGrowthRate: number
  momentumLift: number
  weeklyPosts: number
  weeklyPlays: number
  score: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function buildCreatorScoreboard(
  creators: MockCreator[],
  mashups: MockMashup[],
): CreatorScoreboardRow[] {
  const momentum = computeMomentum(mashups)
  const creatorStats = new Map<
    string,
    { weeklyPosts: number; weeklyPlays: number; momentumLift: number }
  >()

  for (const mashup of momentum) {
    const key = mashup.creator.username
    const current = creatorStats.get(key) ?? {
      weeklyPosts: 0,
      weeklyPlays: 0,
      momentumLift: 0,
    }
    const recencyBoost = clamp(
      1 - (Date.now() - new Date(mashup.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30),
      0.05,
      1,
    )
    current.weeklyPosts += recencyBoost > 0.4 ? 1 : 0
    current.weeklyPlays += Math.round(mashup.playCount * 0.18 * recencyBoost)
    current.momentumLift += mashup.momentumScore * recencyBoost
    creatorStats.set(key, current)
  }

  const rows = creators.map((creator) => {
    const stat = creatorStats.get(creator.username) ?? {
      weeklyPosts: 0,
      weeklyPlays: 0,
      momentumLift: 0,
    }
    const weeklyGrowthRate = clamp(
      (stat.weeklyPlays / Math.max(1, creator.totalPlays * 0.06)) * 100,
      2,
      180,
    )
    const score =
      weeklyGrowthRate * 0.55 +
      Math.min(160, stat.momentumLift / 500) * 0.3 +
      stat.weeklyPosts * 2.5

    return {
      rank: 0,
      username: creator.username,
      displayName: creator.displayName,
      avatarUrl: creator.avatarUrl,
      weeklyGrowthRate: Number(weeklyGrowthRate.toFixed(1)),
      momentumLift: Number((stat.momentumLift / 1000).toFixed(1)),
      weeklyPosts: Math.max(1, stat.weeklyPosts),
      weeklyPlays: stat.weeklyPlays,
      score: Number(score.toFixed(1)),
    }
  })

  return rows
    .sort((a, b) => b.score - a.score)
    .map((row, index) => ({
      ...row,
      rank: index + 1,
    }))
}

