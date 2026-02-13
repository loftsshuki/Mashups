import type { MockMashup } from "@/lib/mock-data"

export interface MomentumMashup extends MockMashup {
  momentumScore: number
}

export function computeMomentum(mashups: MockMashup[]): MomentumMashup[] {
  return mashups
    .map((mashup) => {
      const created = new Date(mashup.createdAt).getTime()
      const ageDays = Math.max(1, (Date.now() - created) / (1000 * 60 * 60 * 24))
      const engagement = mashup.likeCount * 2 + mashup.commentCount * 4
      const momentumScore = (mashup.playCount + engagement) / ageDays
      return { ...mashup, momentumScore }
    })
    .sort((a, b) => b.momentumScore - a.momentumScore)
}
