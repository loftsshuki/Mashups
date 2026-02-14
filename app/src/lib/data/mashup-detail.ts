import { mapRowToMockMashup } from "@/lib/data/mashup-adapter"
import {
  getMashupChildren,
  getMashupLineage,
  getMockMashup,
  type MockMashup,
} from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/server"

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function fetchMashupsByIds(ids: string[]): Promise<MockMashup[]> {
  if (ids.length === 0) return []
  const supabase = await createClient()
  const { data, error } = await supabase
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
    .in("id", ids)

  if (error || !data) return []

  const map = new Map(
    (data as Record<string, unknown>[]).map((row) => {
      const id = typeof row.id === "string" ? row.id : ""
      return [id, mapRowToMockMashup(row)] as const
    }),
  )

  return ids
    .map((id) => map.get(id))
    .filter((row): row is MockMashup => Boolean(row))
}

async function getLineageIds(mashupId: string): Promise<string[]> {
  const supabase = await createClient()
  const lineage: string[] = [mashupId]
  let cursor = mashupId

  for (let i = 0; i < 24; i += 1) {
    const { data } = await supabase
      .from("remix_relations")
      .select("parent_mashup_id")
      .eq("child_mashup_id", cursor)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    const parentId =
      data && typeof data.parent_mashup_id === "string" ? data.parent_mashup_id : null
    if (!parentId || lineage.includes(parentId)) break

    lineage.unshift(parentId)
    cursor = parentId
  }

  return lineage
}

export async function getMashupDetailView(mashupId: string): Promise<{
  mashup: MockMashup
  lineage: MockMashup[]
  forkedMashups: MockMashup[]
}> {
  const fallbackMashup = getMockMashup(mashupId)
  const fallback = {
    mashup: fallbackMashup,
    lineage: fallbackMashup ? getMashupLineage(fallbackMashup.id) : [],
    forkedMashups: fallbackMashup ? getMashupChildren(fallbackMashup.id) : [],
  }

  if (!isSupabaseConfigured()) {
    const mashup = fallback.mashup ?? getMockMashup("mash-001")
    if (!mashup) {
      throw new Error("No mashup data available.")
    }
    return {
      mashup,
      lineage: fallback.lineage.length > 0 ? fallback.lineage : [mashup],
      forkedMashups: fallback.forkedMashups,
    }
  }

  try {
    const supabase = await createClient()
    const { data: row } = await supabase
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
      .eq("id", mashupId)
      .maybeSingle()

    if (!row) {
      const mashup = fallback.mashup ?? getMockMashup("mash-001")
      if (!mashup) throw new Error("Mashup not found.")
      return {
        mashup,
        lineage: fallback.lineage.length > 0 ? fallback.lineage : [mashup],
        forkedMashups: fallback.forkedMashups,
      }
    }

    const mashup = mapRowToMockMashup(row as Record<string, unknown>)
    const lineageIds = await getLineageIds(mashup.id)
    const lineageRows = await fetchMashupsByIds(lineageIds)

    const { data: forkRelations } = await supabase
      .from("remix_relations")
      .select("child_mashup_id")
      .eq("parent_mashup_id", mashup.id)
      .order("created_at", { ascending: false })
      .limit(48)

    const forkIds = Array.from(
      new Set(
        ((forkRelations as Record<string, unknown>[] | null) ?? [])
          .map((entry) =>
            typeof entry.child_mashup_id === "string" ? entry.child_mashup_id : null,
          )
          .filter((value): value is string => Boolean(value)),
      ),
    )

    const forkedMashups = await fetchMashupsByIds(forkIds)

    return {
      mashup,
      lineage: lineageRows.length > 0 ? lineageRows : [mashup],
      forkedMashups,
    }
  } catch {
    const mashup = fallback.mashup ?? getMockMashup("mash-001")
    if (!mashup) {
      throw new Error("Mashup not found.")
    }
    return {
      mashup,
      lineage: fallback.lineage.length > 0 ? fallback.lineage : [mashup],
      forkedMashups: fallback.forkedMashups,
    }
  }
}
