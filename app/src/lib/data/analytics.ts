import type { MockMashup } from "@/lib/mock-data"

export interface CreatorAnalyticsSnapshot {
  totalPlays: number
  totalLikes: number
  totalComments: number
  avgCompletionRate: number
  skipRate: number
  saveRate: number
}

export function buildCreatorAnalytics(mashups: MockMashup[]): CreatorAnalyticsSnapshot {
  const totalPlays = mashups.reduce((sum, m) => sum + m.playCount, 0)
  const totalLikes = mashups.reduce((sum, m) => sum + m.likeCount, 0)
  const totalComments = mashups.reduce((sum, m) => sum + m.commentCount, 0)
  const likeRate = totalPlays > 0 ? totalLikes / totalPlays : 0
  const commentRate = totalPlays > 0 ? totalComments / totalPlays : 0

  return {
    totalPlays,
    totalLikes,
    totalComments,
    avgCompletionRate: Math.min(0.92, 0.52 + likeRate * 4.2),
    skipRate: Math.max(0.06, 0.34 - likeRate * 2.7),
    saveRate: Math.min(0.48, 0.08 + (likeRate + commentRate) * 2.2),
  }
}
