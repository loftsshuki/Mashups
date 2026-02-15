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

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const MINOR_KEYS = new Set(["Am", "Bm", "Cm", "Dm", "Em", "Fm", "Gm", "A#m", "C#m", "D#m", "F#m", "G#m", "Bbm", "Ebm", "Abm"])
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getMockProfile(username: string): CreativeProfile {
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

export async function getCreativeProfile(username: string): Promise<CreativeProfile> {
  if (!isSupabaseConfigured()) {
    return getMockProfile(username)
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    // Look up user by username
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single()

    if (userError || !user) {
      return getMockProfile(username)
    }

    const userId = user.id

    // Fetch mashups with their stems and created_at timestamps
    const { data: mashups, error: mashupError } = await supabase
      .from("mashups")
      .select("id, genre, bpm, created_at")
      .eq("creator_id", userId)

    if (mashupError || !mashups || mashups.length === 0) {
      return getMockProfile(username)
    }

    // Fetch stems linked to this user's mashups
    const mashupIds = mashups.map((m: { id: string }) => m.id)
    const { data: stemLinks } = await supabase
      .from("stem_mashup_links")
      .select("mashup_id, stem_id, stems(instrument, key, bpm)")
      .in("mashup_id", mashupIds)

    // Fetch collaboration sessions where this user participated
    const { data: collabSessions } = await supabase
      .from("collaboration_participants")
      .select("session_id")
      .eq("user_id", userId)

    const totalMashups = mashups.length
    const totalStems = stemLinks?.length ?? 0

    // --- Top genres ---
    const genreCounts: Record<string, number> = {}
    for (const m of mashups) {
      const g = (m as { genre?: string }).genre || "Various"
      genreCounts[g] = (genreCounts[g] || 0) + 1
    }
    const topGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: Math.round((count / totalMashups) * 100),
      }))

    // --- BPM range ---
    const bpms = mashups
      .map((m: { bpm?: number | null }) => m.bpm)
      .filter((b: number | null | undefined): b is number => b != null && b > 0)
    const bpmRange = bpms.length > 0
      ? { min: Math.min(...bpms), max: Math.max(...bpms), average: Math.round(bpms.reduce((a: number, b: number) => a + b, 0) / bpms.length) }
      : { min: 0, max: 0, average: 0 }

    // --- Key preference (major vs minor) ---
    let majorCount = 0
    let minorCount = 0
    if (stemLinks) {
      for (const link of stemLinks) {
        const stem = (link as { stems?: { key?: string } | null }).stems
        if (stem?.key) {
          if (MINOR_KEYS.has(stem.key) || stem.key.toLowerCase().includes("minor") || stem.key.endsWith("m")) {
            minorCount++
          } else {
            majorCount++
          }
        }
      }
    }

    // --- Top instruments ---
    const instrumentCounts: Record<string, number> = {}
    if (stemLinks) {
      for (const link of stemLinks) {
        const stem = (link as { stems?: { instrument?: string } | null }).stems
        const inst = stem?.instrument || "other"
        instrumentCounts[inst] = (instrumentCounts[inst] || 0) + 1
      }
    }
    const topInstruments = Object.entries(instrumentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([instrument, count]) => ({ instrument, count }))

    // --- Productive hours and days ---
    const hourCounts = new Array(24).fill(0)
    const dayCounts = new Array(7).fill(0)
    for (const m of mashups) {
      const d = new Date((m as { created_at: string }).created_at)
      hourCounts[d.getUTCHours()]++
      dayCounts[d.getUTCDay()]++
    }
    const productiveHours = hourCounts.map((count: number, hour: number) => ({ hour, count }))
    const productiveDays = dayCounts.map((count: number, i: number) => ({ day: DAY_NAMES[i], count }))

    // --- Collab rate ---
    const collabCount = collabSessions?.length ?? 0
    const collabRate = totalMashups > 0
      ? Math.round((collabCount / totalMashups) * 100)
      : 0

    const profile: CreativeProfile = {
      username,
      topGenres,
      bpmRange,
      keyPreference: { major: majorCount, minor: minorCount },
      topInstruments,
      productiveHours,
      productiveDays,
      archetype: "",
      totalMashups,
      totalStems,
      collabRate: Math.min(collabRate, 100),
    }

    profile.archetype = determineArchetype(profile)
    return profile
  } catch (err) {
    console.error("Creative profile Supabase error, falling back to mock:", err)
    return getMockProfile(username)
  }
}
