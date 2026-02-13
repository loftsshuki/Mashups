import type { MockMashup } from "@/lib/mock-data"
import { mockMashups } from "@/lib/mock-data"

export interface Challenge {
  id: string
  title: string
  description: string
  startsAt: string
  endsAt: string
  prizeText: string
  status: "upcoming" | "active" | "closed"
  tag: string
}

export interface ChallengeEntry {
  challengeId: string
  mashupId: string
}

export const mockChallenges: Challenge[] = [
  {
    id: "ch-001",
    title: "Flip The Classics",
    description: "Remix a classic structure into a modern club-ready mashup.",
    startsAt: "2026-02-10T00:00:00Z",
    endsAt: "2026-02-28T23:59:59Z",
    prizeText: "$500 + featured placement",
    status: "active",
    tag: "Remix",
  },
  {
    id: "ch-002",
    title: "90 BPM Challenge",
    description: "Build something hypnotic between 80-95 BPM.",
    startsAt: "2026-03-01T00:00:00Z",
    endsAt: "2026-03-20T23:59:59Z",
    prizeText: "Pro Studio 1 year",
    status: "upcoming",
    tag: "Tempo",
  },
]

export const mockChallengeEntries: ChallengeEntry[] = [
  { challengeId: "ch-001", mashupId: "mash-001" },
  { challengeId: "ch-001", mashupId: "mash-002" },
  { challengeId: "ch-001", mashupId: "mash-004" },
]

export function getChallengeEntries(challengeId: string): MockMashup[] {
  const ids = new Set(
    mockChallengeEntries
      .filter((entry) => entry.challengeId === challengeId)
      .map((entry) => entry.mashupId),
  )
  return mockMashups.filter((m) => ids.has(m.id))
}
