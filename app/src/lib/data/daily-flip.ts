import { createClient } from "@/lib/supabase/client"
import type { DailyFlip, DailyFlipEntry, Profile } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ── Mock Data ──

const mockStems: DailyFlip["stems"] = [
  { name: "Motown Vocals", type: "Vocal", color: "bg-pink-500", bpm: 110, key: "Am" },
  { name: "Trap Hi-Hats", type: "Drums", color: "bg-yellow-500", bpm: 140, key: "-" },
  { name: "Ambient Pad", type: "Synth", color: "bg-blue-500", bpm: 90, key: "C" },
]

function getMockTodaysFlip(): DailyFlip {
  const now = new Date()
  const endsAt = new Date(now.getTime() + 8 * 60 * 60 * 1000) // ~8 hours from now
  const startedAt = new Date(now.getTime() - 16 * 60 * 60 * 1000) // started ~16 hours ago

  return {
    id: "flip-042",
    flip_number: 42,
    title: "Motown \u00d7 Trap",
    description: "Blend silky Motown vocals with hard-hitting trap percussion. Find the groove between golden-era soul and modern bounce.",
    stems: mockStems,
    rules: "Use all 3 stems. Final mix must be 60\u2013180 seconds. One submission per person.",
    started_at: startedAt.toISOString(),
    ends_at: endsAt.toISOString(),
    created_at: startedAt.toISOString(),
  }
}

const mockLeaderboardProfiles: Array<{ username: string; display_name: string }> = [
  { username: "ProducerX", display_name: "Producer X" },
  { username: "BeatSmith", display_name: "Beat Smith" },
  { username: "MixMaster", display_name: "Mix Master" },
  { username: "VinylQueen", display_name: "Vinyl Queen" },
  { username: "BassDrop", display_name: "Bass Drop" },
  { username: "SoulFlip", display_name: "Soul Flip" },
  { username: "TrapLord", display_name: "Trap Lord" },
  { username: "GrooveKid", display_name: "Groove Kid" },
  { username: "WavRider", display_name: "Wav Rider" },
  { username: "ChopShop", display_name: "Chop Shop" },
]

function getMockLeaderboard(flipId: string): DailyFlipEntry[] {
  return mockLeaderboardProfiles.map((profile, index) => ({
    id: `entry-${flipId}-${index + 1}`,
    flip_id: flipId,
    user_id: `user-${index + 1}`,
    mashup_id: `mashup-flip-${index + 1}`,
    audio_url: null,
    score: 95 - index * 4 + Math.floor(Math.random() * 3),
    vote_count: 200 - index * 18,
    rank: index + 1,
    submitted_at: new Date(Date.now() - index * 30 * 60 * 1000).toISOString(),
    user: {
      id: `user-${index + 1}`,
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: `https://placehold.co/100x100/8b5cf6/white?text=${profile.username.slice(0, 2).toUpperCase()}`,
      bio: null,
      created_at: "2026-01-01T00:00:00Z",
    } satisfies Profile,
  }))
}

const mockHistoryFlips: DailyFlip[] = [
  {
    id: "flip-041",
    flip_number: 41,
    title: "Jazz \u00d7 EDM",
    description: "Merge improvisational jazz riffs with pulsing EDM drops.",
    stems: [
      { name: "Jazz Piano", type: "Keys", color: "bg-amber-500", bpm: 120, key: "Dm" },
      { name: "EDM Synth Lead", type: "Synth", color: "bg-cyan-500", bpm: 128, key: "Dm" },
      { name: "Swing Drums", type: "Drums", color: "bg-orange-500", bpm: 120, key: "-" },
    ],
    rules: "Use all 3 stems. Final mix must be 60\u2013180 seconds.",
    started_at: "2026-02-13T00:00:00Z",
    ends_at: "2026-02-14T00:00:00Z",
    created_at: "2026-02-13T00:00:00Z",
  },
  {
    id: "flip-040",
    flip_number: 40,
    title: "Classical \u00d7 Drill",
    description: "Layer orchestral strings over aggressive drill patterns.",
    stems: [
      { name: "String Ensemble", type: "Strings", color: "bg-rose-500", bpm: 100, key: "Gm" },
      { name: "Drill 808s", type: "Bass", color: "bg-red-500", bpm: 140, key: "Gm" },
      { name: "Orchestral Hits", type: "FX", color: "bg-purple-500", bpm: 100, key: "Gm" },
    ],
    rules: "Use all 3 stems. Final mix must be 60\u2013180 seconds.",
    started_at: "2026-02-12T00:00:00Z",
    ends_at: "2026-02-13T00:00:00Z",
    created_at: "2026-02-12T00:00:00Z",
  },
  {
    id: "flip-039",
    flip_number: 39,
    title: "Funk \u00d7 House",
    description: "Bring the funk groove into a four-on-the-floor house framework.",
    stems: [
      { name: "Funk Guitar", type: "Guitar", color: "bg-green-500", bpm: 118, key: "E" },
      { name: "House Kick", type: "Drums", color: "bg-yellow-500", bpm: 124, key: "-" },
      { name: "Slap Bass", type: "Bass", color: "bg-lime-500", bpm: 118, key: "E" },
    ],
    rules: "Use all 3 stems. Final mix must be 60\u2013180 seconds.",
    started_at: "2026-02-11T00:00:00Z",
    ends_at: "2026-02-12T00:00:00Z",
    created_at: "2026-02-11T00:00:00Z",
  },
  {
    id: "flip-038",
    flip_number: 38,
    title: "R&B \u00d7 Dubstep",
    description: "Smooth R&B vocals meet filthy dubstep wobbles.",
    stems: [
      { name: "R&B Vocals", type: "Vocal", color: "bg-pink-500", bpm: 95, key: "Bb" },
      { name: "Dubstep Wobble", type: "Synth", color: "bg-violet-500", bpm: 140, key: "Bb" },
      { name: "Sub Bass", type: "Bass", color: "bg-indigo-500", bpm: 140, key: "Bb" },
    ],
    rules: "Use all 3 stems. Final mix must be 60\u2013180 seconds.",
    started_at: "2026-02-10T00:00:00Z",
    ends_at: "2026-02-11T00:00:00Z",
    created_at: "2026-02-10T00:00:00Z",
  },
  {
    id: "flip-037",
    flip_number: 37,
    title: "Latin \u00d7 Techno",
    description: "Fuse Latin rhythms and percussion with relentless techno energy.",
    stems: [
      { name: "Conga Loop", type: "Percussion", color: "bg-orange-500", bpm: 126, key: "-" },
      { name: "Techno Kick", type: "Drums", color: "bg-slate-500", bpm: 130, key: "-" },
      { name: "Latin Guitar", type: "Guitar", color: "bg-amber-500", bpm: 126, key: "Am" },
    ],
    rules: "Use all 3 stems. Final mix must be 60\u2013180 seconds.",
    started_at: "2026-02-09T00:00:00Z",
    ends_at: "2026-02-10T00:00:00Z",
    created_at: "2026-02-09T00:00:00Z",
  },
]

// ── Data Functions ──

export async function getTodaysFlip(): Promise<DailyFlip | null> {
  if (!isSupabaseConfigured()) return getMockTodaysFlip()

  try {
    const supabase = createClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("daily_flips")
      .select("*")
      .lte("started_at", now)
      .gte("ends_at", now)
      .order("flip_number", { ascending: false })
      .limit(1)

    if (error || !data || data.length === 0) return getMockTodaysFlip()
    return data[0] as DailyFlip
  } catch {
    return getMockTodaysFlip()
  }
}

export async function getFlipById(id: string): Promise<DailyFlip | null> {
  if (!isSupabaseConfigured()) {
    const mock = getMockTodaysFlip()
    if (mock.id === id) return mock
    return mockHistoryFlips.find((f) => f.id === id) ?? null
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("daily_flips")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) return null
    return data as DailyFlip
  } catch {
    return null
  }
}

export async function getFlipLeaderboard(
  flipId: string,
  limit: number = 50,
): Promise<DailyFlipEntry[]> {
  if (!isSupabaseConfigured()) return getMockLeaderboard(flipId).slice(0, limit)

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("daily_flip_entries")
      .select("*, user:profiles!user_id(*)")
      .eq("flip_id", flipId)
      .order("score", { ascending: false })
      .limit(limit)

    if (error || !data) return []
    return data as DailyFlipEntry[]
  } catch {
    return []
  }
}

export async function submitFlipEntry(
  flipId: string,
  mashupId?: string,
  audioUrl?: string,
): Promise<{ entry?: DailyFlipEntry; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Database not configured" }
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // Check for existing entry
    const { data: existing } = await supabase
      .from("daily_flip_entries")
      .select("id")
      .eq("flip_id", flipId)
      .eq("user_id", user.id)
      .limit(1)

    if (existing && existing.length > 0) {
      return { error: "You have already submitted an entry for this flip" }
    }

    const { data, error } = await supabase
      .from("daily_flip_entries")
      .insert({
        flip_id: flipId,
        user_id: user.id,
        mashup_id: mashupId ?? null,
        audio_url: audioUrl ?? null,
        score: 0,
        vote_count: 0,
      })
      .select("*, user:profiles!user_id(*)")
      .single()

    if (error || !data) return { error: error?.message ?? "Failed to submit entry" }
    return { entry: data as DailyFlipEntry }
  } catch {
    return { error: "Failed to submit entry" }
  }
}

export async function voteForEntry(
  entryId: string,
): Promise<{ voted: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { voted: true }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { voted: false, error: "Not authenticated" }

    // Check if already voted
    const { data: existingVote } = await supabase
      .from("daily_flip_votes")
      .select("id")
      .eq("entry_id", entryId)
      .eq("user_id", user.id)
      .limit(1)

    if (existingVote && existingVote.length > 0) {
      // Remove vote
      await supabase
        .from("daily_flip_votes")
        .delete()
        .eq("entry_id", entryId)
        .eq("user_id", user.id)

      // Decrement vote_count
      const { data: entry } = await supabase
        .from("daily_flip_entries")
        .select("vote_count")
        .eq("id", entryId)
        .single()

      if (entry) {
        await supabase
          .from("daily_flip_entries")
          .update({ vote_count: Math.max(0, (entry as { vote_count: number }).vote_count - 1) })
          .eq("id", entryId)
      }

      return { voted: false }
    }

    // Insert vote
    const { error: voteError } = await supabase
      .from("daily_flip_votes")
      .insert({ entry_id: entryId, user_id: user.id })

    if (voteError) return { voted: false, error: voteError.message }

    // Increment vote_count
    const { data: entry } = await supabase
      .from("daily_flip_entries")
      .select("vote_count")
      .eq("id", entryId)
      .single()

    if (entry) {
      await supabase
        .from("daily_flip_entries")
        .update({ vote_count: (entry as { vote_count: number }).vote_count + 1 })
        .eq("id", entryId)
    }

    return { voted: true }
  } catch {
    return { voted: false, error: "Failed to toggle vote" }
  }
}

export async function getFlipHistory(limit: number = 10): Promise<DailyFlip[]> {
  if (!isSupabaseConfigured()) return mockHistoryFlips.slice(0, limit)

  try {
    const supabase = createClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("daily_flips")
      .select("*")
      .lt("ends_at", now)
      .order("flip_number", { ascending: false })
      .limit(limit)

    if (error || !data) return []
    return data as DailyFlip[]
  } catch {
    return []
  }
}

export async function getFlipStats(
  flipId: string,
): Promise<{ entryCount: number; voteCount: number; topScore: number }> {
  if (!isSupabaseConfigured()) {
    return { entryCount: 2841, voteCount: 15420, topScore: 94 }
  }

  try {
    const supabase = createClient()

    const { data: entries, error } = await supabase
      .from("daily_flip_entries")
      .select("score, vote_count")
      .eq("flip_id", flipId)

    if (error || !entries) return { entryCount: 0, voteCount: 0, topScore: 0 }

    const typedEntries = entries as Array<{ score: number; vote_count: number }>
    const entryCount = typedEntries.length
    const voteCount = typedEntries.reduce((sum, e) => sum + e.vote_count, 0)
    const topScore = typedEntries.reduce((max, e) => Math.max(max, e.score), 0)

    return { entryCount, voteCount, topScore }
  } catch {
    return { entryCount: 0, voteCount: 0, topScore: 0 }
  }
}

export async function getUserFlipStreak(
  userId: string,
): Promise<{ currentStreak: number; longestStreak: number; totalFlips: number }> {
  if (!isSupabaseConfigured()) {
    return { currentStreak: 7, longestStreak: 14, totalFlips: 42 }
  }

  try {
    const supabase = createClient()

    // Get all flip entries for the user, joined with flip dates
    const { data: entries, error } = await supabase
      .from("daily_flip_entries")
      .select("submitted_at, flip:daily_flips!flip_id(flip_number, started_at)")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false })

    if (error || !entries || entries.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalFlips: 0 }
    }

    const totalFlips = entries.length

    // Extract unique flip dates (by day)
    const typedEntries = entries as Array<{ submitted_at: string; flip: unknown }>
    const flipDates: string[] = [
      ...new Set(
        typedEntries.map((e) => {
          const d = new Date(e.submitted_at)
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
        }),
      ),
    ].sort((a, b) => b.localeCompare(a)) // Descending

    // Calculate streaks
    let currentStreak = 0
    let longestStreak = 0
    let streak = 1

    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`

    // Current streak starts if most recent flip is today or yesterday
    const isCurrentStreakActive =
      flipDates[0] === todayStr || flipDates[0] === yesterdayStr

    for (let i = 1; i < flipDates.length; i++) {
      const prev = new Date(flipDates[i - 1])
      const curr = new Date(flipDates[i])
      const diffDays = Math.round(
        (prev.getTime() - curr.getTime()) / (24 * 60 * 60 * 1000),
      )

      if (diffDays === 1) {
        streak++
      } else {
        if (i === 1 || (isCurrentStreakActive && currentStreak === 0)) {
          currentStreak = streak
        }
        longestStreak = Math.max(longestStreak, streak)
        streak = 1
      }
    }

    // Finalize
    longestStreak = Math.max(longestStreak, streak)
    if (currentStreak === 0 && isCurrentStreakActive) {
      currentStreak = streak
    }

    return { currentStreak, longestStreak, totalFlips }
  } catch {
    return { currentStreak: 0, longestStreak: 0, totalFlips: 0 }
  }
}
