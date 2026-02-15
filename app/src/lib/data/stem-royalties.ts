export interface StemRoyaltyEntry {
  stemId: string
  stemTitle: string
  instrument: string
  usedInMashups: number
  totalPlays: number
  earnedCents: number
  currency: string
}

export interface StemRoyaltySummary {
  totalEarnedCents: number
  totalStemsUsed: number
  totalMashups: number
  entries: StemRoyaltyEntry[]
  monthLabel: string
}

// Mock royalty data
const mockEntries: StemRoyaltyEntry[] = [
  {
    stemId: "stem-001",
    stemTitle: "Funky Bassline Loop",
    instrument: "bass",
    usedInMashups: 12,
    totalPlays: 8420,
    earnedCents: 1240,
    currency: "USD",
  },
  {
    stemId: "stem-002",
    stemTitle: "808 Drum Pattern",
    instrument: "drums",
    usedInMashups: 23,
    totalPlays: 15200,
    earnedCents: 2180,
    currency: "USD",
  },
  {
    stemId: "stem-003",
    stemTitle: "Ethereal Vocal Chop",
    instrument: "vocal",
    usedInMashups: 8,
    totalPlays: 5600,
    earnedCents: 860,
    currency: "USD",
  },
  {
    stemId: "stem-004",
    stemTitle: "Synth Pad Texture",
    instrument: "synth",
    usedInMashups: 5,
    totalPlays: 3100,
    earnedCents: 420,
    currency: "USD",
  },
]

export async function getStemRoyalties(_userId: string): Promise<StemRoyaltySummary> {
  const totalEarnedCents = mockEntries.reduce((sum, e) => sum + e.earnedCents, 0)
  const totalMashups = new Set(mockEntries.map((e) => e.stemId)).size
  return {
    totalEarnedCents,
    totalStemsUsed: mockEntries.length,
    totalMashups,
    entries: mockEntries,
    monthLabel: "February 2026",
  }
}
