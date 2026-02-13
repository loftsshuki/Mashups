import type { MockMashup } from "@/lib/mock-data"

type LocalEvent = {
  mashupId?: string
  eventType: "impression" | "play" | "skip" | "like" | "share" | "open"
}

function tokenizeGenre(genre: string): string[] {
  return genre
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean)
}

export function rankForYouMashups(
  mashups: MockMashup[],
  events: LocalEvent[],
): MockMashup[] {
  const signalByMashup = new Map<string, number>()
  const genreAffinity = new Map<string, number>()

  for (const event of events) {
    if (!event.mashupId) continue
    const weight =
      event.eventType === "play" || event.eventType === "open"
        ? 2
        : event.eventType === "like" || event.eventType === "share"
          ? 3
          : event.eventType === "skip"
            ? -2
            : 0.5
    signalByMashup.set(
      event.mashupId,
      (signalByMashup.get(event.mashupId) ?? 0) + weight,
    )
  }

  for (const mashup of mashups) {
    const direct = signalByMashup.get(mashup.id) ?? 0
    if (direct <= 0) continue
    for (const token of tokenizeGenre(mashup.genre)) {
      genreAffinity.set(token, (genreAffinity.get(token) ?? 0) + direct)
    }
  }

  const scored = mashups.map((mashup) => {
    const direct = signalByMashup.get(mashup.id) ?? 0
    const genreScore = tokenizeGenre(mashup.genre).reduce(
      (sum, token) => sum + (genreAffinity.get(token) ?? 0),
      0,
    )
    const trendScore = mashup.playCount / 100000
    const total = direct * 3 + genreScore * 0.8 + trendScore
    return { mashup, total }
  })

  return scored
    .sort((a, b) => b.total - a.total)
    .map((item) => item.mashup)
}
