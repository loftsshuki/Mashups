import type { MockMashup } from "@/lib/mock-data"

export type BattleStatus = "upcoming" | "active" | "voting" | "completed"
export type BattleType = "1v1" | "tournament"
export type BattleTheme = "genre" | "tempo" | "era" | "open"

export interface BattleEntry {
  id: string
  mashupId: string
  mashup: MockMashup
  creatorId: string
  submittedAt: string
  votes: number
  rank?: number
  isWinner?: boolean
}

export interface Battle {
  id: string
  title: string
  description: string
  type: BattleType
  theme: BattleTheme
  themeValue?: string
  status: BattleStatus

  submissionStart: string
  submissionEnd: string
  votingStart: string
  votingEnd: string

  maxEntries: number
  entries: BattleEntry[]

  prizePool: number
  prizeCurrency: string
  prizeDescription: string

  voteType: "blind" | "open"
  votesPerUser: number

  totalVotes: number
  uniqueVoters: number

  hostId: string
  hostName: string
  hostAvatar: string

  coverUrl?: string
  rules: string[]
  requirements: string[]
  createdAt: string
}

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ---------------------------------------------------------------------------
// Mock data (fallback)
// ---------------------------------------------------------------------------

export const mockBattles: Battle[] = [
  {
    id: "battle-001",
    title: "Trap vs Dubstep Showdown",
    description: "The ultimate genre clash! Submit your best Trap or Dubstep mashup and let the community decide which genre reigns supreme.",
    type: "1v1",
    theme: "genre",
    themeValue: "Trap vs Dubstep",
    status: "voting",
    submissionStart: "2026-02-01T00:00:00Z",
    submissionEnd: "2026-02-10T23:59:59Z",
    votingStart: "2026-02-11T00:00:00Z",
    votingEnd: "2026-02-20T23:59:59Z",
    maxEntries: 32,
    entries: [],
    prizePool: 500,
    prizeCurrency: "USD",
    prizeDescription: "$500 cash prize + Featured on homepage for 1 week",
    voteType: "blind",
    votesPerUser: 3,
    totalVotes: 1247,
    uniqueVoters: 423,
    hostId: "user-admin",
    hostName: "Mashups Team",
    hostAvatar: "/avatars/team.png",
    coverUrl: "/battles/trap-vs-dubstep.jpg",
    rules: [
      "Must be original mashup created for this battle",
      "No copyrighted samples without clearance",
      "Between 2-5 minutes long",
      "Must include at least 2 source tracks",
    ],
    requirements: [
      "Stem separation recommended",
      "Submit before deadline",
      "Follow community guidelines",
    ],
    createdAt: "2026-01-15T00:00:00Z",
  },
  {
    id: "battle-002",
    title: "80s Nostalgia Challenge",
    description: "Bring the 80s back! Create a mashup using only tracks from 1980-1989.",
    type: "tournament",
    theme: "era",
    themeValue: "1980s",
    status: "active",
    submissionStart: "2026-02-10T00:00:00Z",
    submissionEnd: "2026-02-28T23:59:59Z",
    votingStart: "2026-03-01T00:00:00Z",
    votingEnd: "2026-03-07T23:59:59Z",
    maxEntries: 64,
    entries: [],
    prizePool: 1000,
    prizeCurrency: "USD",
    prizeDescription: "$1000 + Vintage Synth VST Bundle + Champion Badge",
    voteType: "blind",
    votesPerUser: 5,
    totalVotes: 0,
    uniqueVoters: 0,
    hostId: "user-retro",
    hostName: "Retro King",
    hostAvatar: "/avatars/retro.png",
    coverUrl: "/battles/80s-challenge.jpg",
    rules: [
      "All source tracks must be from 1980-1989",
      "Maximum 5 source tracks",
      "No modern remixes of 80s songs",
      "Must tag #80sBattle in description",
    ],
    requirements: [
      "List all source tracks with release years",
      "Include era-appropriate artwork",
    ],
    createdAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "battle-003",
    title: "Speed Demon: 150+ BPM Only",
    description: "Fast and furious! Create a high-energy mashup with a minimum tempo of 150 BPM.",
    type: "1v1",
    theme: "tempo",
    themeValue: "150+BPM",
    status: "upcoming",
    submissionStart: "2026-03-01T00:00:00Z",
    submissionEnd: "2026-03-15T23:59:59Z",
    votingStart: "2026-03-16T00:00:00Z",
    votingEnd: "2026-03-22T23:59:59Z",
    maxEntries: 16,
    entries: [],
    prizePool: 300,
    prizeCurrency: "USD",
    prizeDescription: "$300 + Exclusive 'Speed Demon' Badge",
    voteType: "blind",
    votesPerUser: 1,
    totalVotes: 0,
    uniqueVoters: 0,
    hostId: "user-speed",
    hostName: "Speed Freak",
    hostAvatar: "/avatars/speed.png",
    coverUrl: "/battles/speed-demon.jpg",
    rules: [
      "Minimum 150 BPM throughout",
      "No tempo changes below 150 BPM",
      "Must include beat grid in description",
    ],
    requirements: [
      "Use BPM detection tool",
      "Submit tempo analysis screenshot",
    ],
    createdAt: "2026-02-10T00:00:00Z",
  },
  {
    id: "battle-004",
    title: "Open Season: Anything Goes",
    description: "No rules, no themes - just pure creativity!",
    type: "tournament",
    theme: "open",
    status: "completed",
    submissionStart: "2026-01-01T00:00:00Z",
    submissionEnd: "2026-01-15T23:59:59Z",
    votingStart: "2026-01-16T00:00:00Z",
    votingEnd: "2026-01-31T23:59:59Z",
    maxEntries: 128,
    entries: [],
    prizePool: 2000,
    prizeCurrency: "USD",
    prizeDescription: "$2000 + Pro Studio Time + Legend Badge",
    voteType: "open",
    votesPerUser: 10,
    totalVotes: 5678,
    uniqueVoters: 1234,
    hostId: "user-admin",
    hostName: "Mashups Team",
    hostAvatar: "/avatars/team.png",
    coverUrl: "/battles/open-season.jpg",
    rules: [
      "Any genre, any tempo, any style",
      "Must be your own original work",
      "Follow community guidelines",
    ],
    requirements: ["Optional: Include creative process notes"],
    createdAt: "2025-12-15T00:00:00Z",
  },
]

// ---------------------------------------------------------------------------
// Row-to-Battle mapper (platform_challenges -> Battle)
// ---------------------------------------------------------------------------

function rowToBattle(row: Record<string, unknown>): Battle {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description ?? "") as string,
    type: (metadata.battle_type as BattleType) ?? "1v1",
    theme: (metadata.theme as BattleTheme) ?? "open",
    themeValue: metadata.theme_value as string | undefined,
    status: row.status as BattleStatus,
    submissionStart: (row.starts_at ?? row.created_at) as string,
    submissionEnd: (metadata.submission_end ?? row.ends_at) as string,
    votingStart: (metadata.voting_start ?? row.ends_at) as string,
    votingEnd: (row.ends_at ?? "") as string,
    maxEntries: (metadata.max_entries as number) ?? 32,
    entries: [],
    prizePool: (metadata.prize_pool as number) ?? 0,
    prizeCurrency: (metadata.prize_currency as string) ?? "USD",
    prizeDescription: (row.prize_text ?? "") as string,
    voteType: (metadata.vote_type as "blind" | "open") ?? "blind",
    votesPerUser: (metadata.votes_per_user as number) ?? 3,
    totalVotes: (metadata.total_votes as number) ?? 0,
    uniqueVoters: (metadata.unique_voters as number) ?? 0,
    hostId: (row.creator_id ?? "user-admin") as string,
    hostName: (metadata.host_name as string) ?? "Mashups Team",
    hostAvatar: (metadata.host_avatar as string) ?? "/avatars/team.png",
    coverUrl: metadata.cover_url as string | undefined,
    rules: Array.isArray(metadata.rules) ? (metadata.rules as string[]) : [],
    requirements: Array.isArray(metadata.requirements) ? (metadata.requirements as string[]) : [],
    createdAt: row.created_at as string,
  }
}

// ---------------------------------------------------------------------------
// Supabase-backed operations
// ---------------------------------------------------------------------------

export async function getActiveBattles(): Promise<Battle[]> {
  if (!isSupabaseConfigured()) {
    return mockBattles.filter((b) => b.status === "active" || b.status === "voting")
  }

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data, error } = await supabase
      .from("platform_challenges")
      .select("*")
      .in("type", ["battle", "collision", "blind_test"])
      .in("status", ["active", "voting"])
      .order("starts_at", { ascending: false })

    if (error || !data || data.length === 0) {
      return mockBattles.filter((b) => b.status === "active" || b.status === "voting")
    }
    return (data as Record<string, unknown>[]).map(rowToBattle)
  } catch {
    return mockBattles.filter((b) => b.status === "active" || b.status === "voting")
  }
}

export async function getUpcomingBattles(): Promise<Battle[]> {
  if (!isSupabaseConfigured()) {
    return mockBattles.filter((b) => b.status === "upcoming")
  }

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data, error } = await supabase
      .from("platform_challenges")
      .select("*")
      .in("type", ["battle", "collision", "blind_test"])
      .eq("status", "upcoming")
      .order("starts_at", { ascending: true })

    if (error || !data || data.length === 0) {
      return mockBattles.filter((b) => b.status === "upcoming")
    }
    return (data as Record<string, unknown>[]).map(rowToBattle)
  } catch {
    return mockBattles.filter((b) => b.status === "upcoming")
  }
}

export async function getCompletedBattles(): Promise<Battle[]> {
  if (!isSupabaseConfigured()) {
    return mockBattles.filter((b) => b.status === "completed")
  }

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data, error } = await supabase
      .from("platform_challenges")
      .select("*")
      .in("type", ["battle", "collision", "blind_test"])
      .eq("status", "completed")
      .order("ends_at", { ascending: false })
      .limit(20)

    if (error || !data || data.length === 0) {
      return mockBattles.filter((b) => b.status === "completed")
    }
    return (data as Record<string, unknown>[]).map(rowToBattle)
  } catch {
    return mockBattles.filter((b) => b.status === "completed")
  }
}

export async function getBattleById(id: string): Promise<Battle | null> {
  if (!isSupabaseConfigured()) {
    return mockBattles.find((b) => b.id === id) || null
  }

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data, error } = await supabase
      .from("platform_challenges")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) return mockBattles.find((b) => b.id === id) || null
    return rowToBattle(data as Record<string, unknown>)
  } catch {
    return mockBattles.find((b) => b.id === id) || null
  }
}

export async function submitVote(
  battleId: string,
  entryId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true }
  }

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { error } = await supabase.from("battle_votes").insert({
      battle_id: battleId,
      entry_id: entryId,
      user_id: userId,
    })

    if (error) {
      if ((error as { code?: string }).code === "23505") {
        return { success: false, error: "You already voted in this battle" }
      }
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch {
    return { success: false, error: "Failed to submit vote" }
  }
}

export async function submitEntry(
  battleId: string,
  mashupId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true }
  }

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { error } = await supabase.from("challenge_entries").insert({
      challenge_id: battleId,
      mashup_id: mashupId,
      creator_id: userId,
    })

    if (error) {
      if ((error as { code?: string }).code === "23505") {
        return { success: false, error: "You already entered this battle" }
      }
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch {
    return { success: false, error: "Failed to submit entry" }
  }
}

// ---------------------------------------------------------------------------
// Helper functions (UI logic, no DB needed)
// ---------------------------------------------------------------------------

export function getBattleStatusDisplay(status: BattleStatus): {
  label: string
  color: string
  bgColor: string
} {
  switch (status) {
    case "upcoming":
      return { label: "Upcoming", color: "text-blue-500", bgColor: "bg-blue-500/10" }
    case "active":
      return { label: "Submissions Open", color: "text-green-500", bgColor: "bg-green-500/10" }
    case "voting":
      return { label: "Voting Live", color: "text-orange-500", bgColor: "bg-orange-500/10" }
    case "completed":
      return { label: "Completed", color: "text-muted-foreground", bgColor: "bg-muted" }
    default:
      return { label: status, color: "text-muted-foreground", bgColor: "bg-muted" }
  }
}

export function getTimeRemaining(endDate: string): {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
  isExpired: boolean
} {
  const end = new Date(endDate).getTime()
  const now = new Date().getTime()
  const diff = end - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, totalSeconds: Math.floor(diff / 1000), isExpired: false }
}

export function canSubmitToBattle(battle: Battle): boolean {
  if (battle.status !== "active") return false
  const now = new Date()
  const start = new Date(battle.submissionStart)
  const end = new Date(battle.submissionEnd)
  return now >= start && now <= end && battle.entries.length < battle.maxEntries
}

export function canVoteInBattle(battle: Battle): boolean {
  if (battle.status !== "voting") return false
  const now = new Date()
  const start = new Date(battle.votingStart)
  const end = new Date(battle.votingEnd)
  return now >= start && now <= end
}

export function getUserVoteCount(_battleId: string, _userId: string): number {
  return 0
}

export function hasUserSubmitted(_battleId: string, _userId: string): boolean {
  return false
}
