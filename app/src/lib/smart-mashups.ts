import type { MockMashup } from "@/lib/mock-data"

export interface SmartMashupPair {
  id: string
  left: MockMashup
  right: MockMashup
  score: number
  reason: string
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function tokenizeGenre(genre: string): Set<string> {
  return new Set(
    genre
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .map((token) => token.trim())
      .filter(Boolean),
  )
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const intersection = [...a].filter((value) => b.has(value)).length
  const union = new Set([...a, ...b]).size
  return union === 0 ? 0 : intersection / union
}

function buildReason(bpmDiff: number, genreSimilarity: number): string {
  if (bpmDiff <= 6 && genreSimilarity >= 0.3) {
    return "Strong tempo and style alignment"
  }
  if (bpmDiff <= 10) {
    return "Tight BPM match for clean transitions"
  }
  if (genreSimilarity >= 0.3) {
    return "Genre blend with complementary textures"
  }
  return "Interesting contrast with mixable tempo range"
}

export function getSmartMashupPairs(
  mashups: MockMashup[],
  limit = 4,
): SmartMashupPair[] {
  const playable = mashups.filter((m) => Boolean(m.audioUrl))
  if (playable.length < 2) return []

  const maxPlays = Math.max(...playable.map((m) => m.playCount), 1)
  const pairs: SmartMashupPair[] = []

  for (let i = 0; i < playable.length; i += 1) {
    for (let j = i + 1; j < playable.length; j += 1) {
      const left = playable[i]
      const right = playable[j]
      const bpmDiff = Math.abs(left.bpm - right.bpm)
      const bpmScore = clamp01(1 - bpmDiff / 40)
      const genreScore = jaccard(
        tokenizeGenre(left.genre),
        tokenizeGenre(right.genre),
      )
      const popularityScore =
        (left.playCount / maxPlays + right.playCount / maxPlays) / 2
      const creatorPenalty = left.creator.username === right.creator.username ? 0.07 : 0

      const score = clamp01(
        bpmScore * 0.55 + genreScore * 0.3 + popularityScore * 0.15 - creatorPenalty,
      )

      pairs.push({
        id: `${left.id}__${right.id}`,
        left,
        right,
        score,
        reason: buildReason(bpmDiff, genreScore),
      })
    }
  }

  return pairs.sort((a, b) => b.score - a.score).slice(0, limit)
}
