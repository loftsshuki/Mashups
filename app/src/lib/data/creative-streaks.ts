import type { CreativeStreak } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockStreaks: Record<string, CreativeStreak> = {
  beatalchemy: {
    user_id: "beatalchemy",
    current_weekly_streak: 12,
    longest_weekly_streak: 18,
    last_creation_week: "2026-W07",
    streak_history: [
      { week: "2026-W07", mashup_count: 3, mashup_ids: ["mash-001", "mash-002", "mash-003"] },
      { week: "2026-W06", mashup_count: 2, mashup_ids: ["mash-004", "mash-005"] },
      { week: "2026-W05", mashup_count: 1, mashup_ids: ["mash-006"] },
      { week: "2026-W04", mashup_count: 4, mashup_ids: ["mash-007", "mash-008", "mash-009", "mash-010"] },
      { week: "2026-W03", mashup_count: 2, mashup_ids: ["mash-011", "mash-012"] },
    ],
  },
  lofilucy: {
    user_id: "lofilucy",
    current_weekly_streak: 6,
    longest_weekly_streak: 6,
    last_creation_week: "2026-W07",
    streak_history: [
      { week: "2026-W07", mashup_count: 1, mashup_ids: ["mash-013"] },
      { week: "2026-W06", mashup_count: 1, mashup_ids: ["mash-014"] },
    ],
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getISOWeek(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`
}

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

export async function getCreativeStreak(userId: string): Promise<CreativeStreak | null> {
  if (!isSupabaseConfigured()) {
    return mockStreaks[userId] ?? null
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("creative_streaks")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error || !data) {
      return mockStreaks[userId] ?? null
    }
    return data as CreativeStreak
  } catch {
    return mockStreaks[userId] ?? null
  }
}

export async function updateStreak(userId: string, mashupId: string): Promise<CreativeStreak | null> {
  const currentWeek = getISOWeek(new Date())

  if (!isSupabaseConfigured()) {
    const existing = mockStreaks[userId]
    if (!existing) return null

    if (existing.last_creation_week === currentWeek) {
      // Already created this week, just add mashup to history
      const weekEntry = existing.streak_history.find((w) => w.week === currentWeek)
      if (weekEntry) {
        weekEntry.mashup_count++
        weekEntry.mashup_ids.push(mashupId)
      }
    } else {
      // New week — check if streak continues
      existing.current_weekly_streak++
      existing.longest_weekly_streak = Math.max(existing.longest_weekly_streak, existing.current_weekly_streak)
      existing.last_creation_week = currentWeek
      existing.streak_history.unshift({ week: currentWeek, mashup_count: 1, mashup_ids: [mashupId] })
    }
    return existing
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from("creative_streaks")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (!existing) {
      // First creation ever
      const newStreak: Omit<CreativeStreak, "streak_history"> & { streak_history: string } = {
        user_id: userId,
        current_weekly_streak: 1,
        longest_weekly_streak: 1,
        last_creation_week: currentWeek,
        streak_history: JSON.stringify([{ week: currentWeek, mashup_count: 1, mashup_ids: [mashupId] }]),
      }
      const { data } = await supabase
        .from("creative_streaks")
        .insert(newStreak)
        .select()
        .single()
      return data as CreativeStreak | null
    }

    const history = (existing.streak_history ?? []) as CreativeStreak["streak_history"]
    const streak = existing as CreativeStreak

    if (streak.last_creation_week === currentWeek) {
      const weekEntry = history.find((w) => w.week === currentWeek)
      if (weekEntry) {
        weekEntry.mashup_count++
        weekEntry.mashup_ids.push(mashupId)
      }
    } else {
      streak.current_weekly_streak++
      streak.longest_weekly_streak = Math.max(streak.longest_weekly_streak, streak.current_weekly_streak)
      streak.last_creation_week = currentWeek
      history.unshift({ week: currentWeek, mashup_count: 1, mashup_ids: [mashupId] })
    }

    const { data } = await supabase
      .from("creative_streaks")
      .update({
        current_weekly_streak: streak.current_weekly_streak,
        longest_weekly_streak: streak.longest_weekly_streak,
        last_creation_week: currentWeek,
        streak_history: history,
      })
      .eq("user_id", userId)
      .select()
      .single()

    return data as CreativeStreak | null
  } catch {
    return mockStreaks[userId] ?? null
  }
}

export { getISOWeek }
