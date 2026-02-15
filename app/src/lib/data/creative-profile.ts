// Creative Memory — aggregates a creator's history into a creative profile

export interface CreativeProfile {
  username: string
  topGenres: { genre: string; count: number; percentage: number }[]
  bpmRange: { min: number; max: number; average: number }
  keyPreference: { major: number; minor: number }
  topInstruments: { instrument: string; count: number }[]
  productiveHours: { hour: number; count: number }[]
  productiveDays: { day: string; count: number }[]
  archetype: string
  totalMashups: number
  totalStems: number
  collabRate: number // percentage of mashups with multiple contributors
}

const ARCHETYPES: { condition: (p: CreativeProfile) => boolean; label: string }[] = [
  { condition: (p) => (p.topGenres[0]?.genre !== p.topGenres[1]?.genre) && p.topGenres.length >= 3, label: "The Genre Bender" },
  { condition: (p) => p.bpmRange.average > 140, label: "The Speed Demon" },
  { condition: (p) => p.bpmRange.average < 90, label: "The Chill Architect" },
  { condition: (p) => p.collabRate > 50, label: "The Connector" },
  { condition: (p) => p.totalMashups > 20, label: "The Machine" },
  { condition: (p) => p.keyPreference.minor > p.keyPreference.major * 2, label: "The Dark Alchemist" },
  { condition: (p) => p.topInstruments[0]?.instrument === "vocal", label: "The Vox Curator" },
  { condition: (p) => p.topInstruments[0]?.instrument === "drums", label: "The Beatsmith" },
]

function determineArchetype(profile: CreativeProfile): string {
  for (const arch of ARCHETYPES) {
    if (arch.condition(profile)) return arch.label
  }
  return "The Vibe Curator"
}

// Mock data — in production, this aggregates from Supabase mashups + stems tables
export async function getCreativeProfile(username: string): Promise<CreativeProfile> {
  const profile: CreativeProfile = {
    username,
    topGenres: [
      { genre: "Hip-Hop", count: 15, percentage: 35 },
      { genre: "Electronic", count: 10, percentage: 24 },
      { genre: "R&B", count: 8, percentage: 19 },
      { genre: "Pop", count: 5, percentage: 12 },
      { genre: "Jazz", count: 4, percentage: 10 },
    ],
    bpmRange: { min: 85, max: 150, average: 118 },
    keyPreference: { major: 18, minor: 24 },
    topInstruments: [
      { instrument: "vocal", count: 28 },
      { instrument: "drums", count: 25 },
      { instrument: "bass", count: 20 },
      { instrument: "synth", count: 15 },
      { instrument: "guitar", count: 8 },
    ],
    productiveHours: Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      count: h >= 20 || h <= 2 ? 8 + Math.floor(Math.random() * 5) : Math.floor(Math.random() * 3),
    })),
    productiveDays: [
      { day: "Mon", count: 5 },
      { day: "Tue", count: 4 },
      { day: "Wed", count: 6 },
      { day: "Thu", count: 3 },
      { day: "Fri", count: 8 },
      { day: "Sat", count: 10 },
      { day: "Sun", count: 7 },
    ],
    archetype: "",
    totalMashups: 42,
    totalStems: 96,
    collabRate: 23,
  }

  profile.archetype = determineArchetype(profile)
  return profile
}
