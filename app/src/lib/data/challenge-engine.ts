import {
  getChallengeEntries as getMockChallengeEntries,
  mockChallenges,
  type Challenge,
} from "@/lib/data/challenges"
import { mapRowToMockMashup } from "@/lib/data/mashup-adapter"
import { mockMashups, type MockMashup } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/server"

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

interface ChallengeRow {
  id: string
  external_id: string | null
  title: string
  description: string | null
  starts_at: string
  ends_at: string
  prize_text: string | null
  status: Challenge["status"]
  tag: string | null
  frequency: Challenge["frequency"] | null
  sponsor: string | null
  reward_type: Challenge["rewardType"] | null
}

function toChallenge(row: ChallengeRow): Challenge {
  return {
    id: row.external_id ?? row.id,
    title: row.title,
    description: row.description ?? "",
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    prizeText: row.prize_text ?? "Prize TBA",
    status:
      row.status === "active" || row.status === "closed" || row.status === "upcoming"
        ? row.status
        : "upcoming",
    tag: row.tag ?? "Open",
    frequency:
      row.frequency === "daily" ||
      row.frequency === "twice_weekly" ||
      row.frequency === "weekly"
        ? row.frequency
        : "weekly",
    sponsor: row.sponsor,
    rewardType:
      row.reward_type === "cash" || row.reward_type === "brand" || row.reward_type === "credits"
        ? row.reward_type
        : "cash",
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

async function seedChallengesIfNeeded() {
  if (!isSupabaseConfigured()) return

  const supabase = await createClient()
  const { data } = await supabase.from("challenges").select("id").limit(1)
  if ((data?.length ?? 0) > 0) return

  const rows = mockChallenges.map((challenge) => ({
    external_id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    starts_at: challenge.startsAt,
    ends_at: challenge.endsAt,
    prize_text: challenge.prizeText,
    status: challenge.status,
    tag: challenge.tag,
    frequency: challenge.frequency,
    sponsor: challenge.sponsor,
    reward_type: challenge.rewardType,
  }))

  await supabase.from("challenges").insert(rows)
}

async function findChallengeRow(challengeId: string): Promise<ChallengeRow | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = await createClient()
  const byExternal = await supabase
    .from("challenges")
    .select(
      "id,external_id,title,description,starts_at,ends_at,prize_text,status,tag,frequency,sponsor,reward_type",
    )
    .eq("external_id", challengeId)
    .maybeSingle()

  if (byExternal.data) return byExternal.data as ChallengeRow
  if (!isUuid(challengeId)) return null

  const byId = await supabase
    .from("challenges")
    .select(
      "id,external_id,title,description,starts_at,ends_at,prize_text,status,tag,frequency,sponsor,reward_type",
    )
    .eq("id", challengeId)
    .maybeSingle()
  return (byId.data as ChallengeRow | null) ?? null
}

export async function getChallengesFromBackend(): Promise<Challenge[]> {
  if (!isSupabaseConfigured()) return mockChallenges

  try {
    await seedChallengesIfNeeded()
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("challenges")
      .select(
        "id,external_id,title,description,starts_at,ends_at,prize_text,status,tag,frequency,sponsor,reward_type",
      )
      .order("starts_at", { ascending: true })

    if (error || !data || data.length === 0) return mockChallenges
    return (data as ChallengeRow[]).map((row) => toChallenge(row))
  } catch {
    return mockChallenges
  }
}

export async function getChallengeEntriesFromBackend(
  challengeId: string,
): Promise<MockMashup[]> {
  if (!isSupabaseConfigured()) return getMockChallengeEntries(challengeId)

  try {
    const challengeRow = await findChallengeRow(challengeId)
    if (!challengeRow) return getMockChallengeEntries(challengeId)

    const supabase = await createClient()
    const { data: entryRows, error: entryError } = await supabase
      .from("challenge_entries")
      .select("mashup_id,submitted_at")
      .eq("challenge_id", challengeRow.id)
      .order("submitted_at", { ascending: false })
      .limit(24)

    if (entryError || !entryRows || entryRows.length === 0) {
      return getMockChallengeEntries(challengeId)
    }

    const mashupIds = Array.from(
      new Set(
        (entryRows as Record<string, unknown>[])
          .map((row) => (typeof row.mashup_id === "string" ? row.mashup_id : null))
          .filter((value): value is string => Boolean(value)),
      ),
    )

    if (mashupIds.length === 0) return getMockChallengeEntries(challengeId)

    const { data: mashupRows, error: mashupError } = await supabase
      .from("mashups")
      .select(
        `
        *,
        creator:profiles!creator_id(*),
        source_tracks(*),
        like_count:likes(count),
        comment_count:comments(count)
      `,
      )
      .in("id", mashupIds)

    if (mashupError || !mashupRows || mashupRows.length === 0) {
      return getMockChallengeEntries(challengeId)
    }

    const mashupMap = new Map(
      (mashupRows as Record<string, unknown>[]).map((row) => {
        const id = typeof row.id === "string" ? row.id : ""
        return [id, mapRowToMockMashup(row)] as const
      }),
    )

    return mashupIds
      .map((id) => mashupMap.get(id))
      .filter((row): row is MockMashup => Boolean(row))
  } catch {
    return getMockChallengeEntries(challengeId)
  }
}

async function getDefaultUserMashupId(userId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("mashups")
    .select("id")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return typeof data?.id === "string" ? data.id : null
}

export async function enterChallengeFromBackend(input: {
  challengeId: string
  mashupId?: string
  userId: string
}) {
  const { challengeId, mashupId, userId } = input

  if (!isSupabaseConfigured()) {
    const challenge = mockChallenges.find((entry) => entry.id === challengeId)
    if (!challenge) {
      return { ok: false as const, status: 404, error: "Challenge not found." }
    }
    if (challenge.status === "closed") {
      return { ok: false as const, status: 400, error: "Challenge is closed." }
    }

    const fallbackMashup = mashupId ?? mockMashups[0]?.id
    if (!fallbackMashup) {
      return { ok: false as const, status: 400, error: "No mashup available for entry." }
    }

    return {
      ok: true as const,
      status: 200,
      entryId: `entry_${Math.random().toString(36).slice(2, 14)}`,
      challenge,
      mashupId: fallbackMashup,
    }
  }

  try {
    const challengeRow = await findChallengeRow(challengeId)
    if (!challengeRow) {
      return { ok: false as const, status: 404, error: "Challenge not found." }
    }
    if (challengeRow.status === "closed") {
      return { ok: false as const, status: 400, error: "Challenge is closed." }
    }

    const resolvedMashupId = mashupId ?? (await getDefaultUserMashupId(userId))
    if (!resolvedMashupId) {
      return {
        ok: false as const,
        status: 400,
        error: "No creator mashup found. Publish a track before joining challenges.",
      }
    }

    const supabase = await createClient()
    const { data: mashupRow } = await supabase
      .from("mashups")
      .select("id,creator_id")
      .eq("id", resolvedMashupId)
      .maybeSingle()

    if (!mashupRow || mashupRow.creator_id !== userId) {
      return {
        ok: false as const,
        status: 403,
        error: "You can only submit your own mashups.",
      }
    }

    const { data, error } = await supabase
      .from("challenge_entries")
      .insert({
        challenge_id: challengeRow.id,
        mashup_id: resolvedMashupId,
        creator_id: userId,
      })
      .select("id")
      .single()

    if (error) {
      const code = (error as { code?: string }).code
      if (code === "23505") {
        return {
          ok: true as const,
          status: 200,
          entryId: `duplicate_${challengeRow.id}_${resolvedMashupId}`,
          challenge: toChallenge(challengeRow),
          mashupId: resolvedMashupId,
        }
      }
      return { ok: false as const, status: 400, error: error.message }
    }

    await supabase.from("recommendation_events").insert({
      user_id: userId,
      mashup_id: resolvedMashupId,
      event_type: "open",
      context: `challenge_entry:${challengeRow.id}`,
    })

    return {
      ok: true as const,
      status: 200,
      entryId: typeof data?.id === "string" ? data.id : `entry_${Date.now()}`,
      challenge: toChallenge(challengeRow),
      mashupId: resolvedMashupId,
    }
  } catch {
    return { ok: false as const, status: 500, error: "Failed to submit challenge entry." }
  }
}
