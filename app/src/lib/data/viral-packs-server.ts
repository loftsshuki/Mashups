import { buildWeeklyViralPack, type WeeklyViralPack } from "@/lib/growth/viral-pack"
import { mockMashups } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/server"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function toWeekDate(now: Date): string {
  const monday = new Date(now)
  const day = monday.getDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(monday.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().slice(0, 10)
}

export async function getWeeklyViralPackFromServer(
  now = new Date(),
): Promise<WeeklyViralPack> {
  const fallback = buildWeeklyViralPack(mockMashups, now)
  if (!isSupabaseConfigured()) return fallback

  try {
    const weekStart = toWeekDate(now)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("viral_pack_clips")
      .select("*")
      .eq("publish_week", weekStart)
      .order("clip_index", { ascending: true })

    if (error || !data || data.length === 0) {
      const rows = fallback.clips.map((clip, index) => ({
        pack_id: fallback.id,
        publish_week: weekStart,
        published_at: fallback.publishedAt,
        clip_index: index,
        mashup_id: clip.mashupId,
        title: clip.title,
        creator_name: clip.creatorName,
        structure: clip.structure,
        clip_start_sec: clip.clipStartSec,
        clip_length_sec: clip.clipLengthSec,
        confidence: clip.confidence,
        rights_safe: clip.rightsSafe,
        rights_score: clip.rightsScore,
      }))
      await supabase.from("viral_pack_clips").upsert(rows, {
        onConflict: "pack_id,clip_index",
      })
      return fallback
    }

    const clips: WeeklyViralPack["clips"] = (data as Record<string, unknown>[]).map(
      (row, index) => {
        const structure: WeeklyViralPack["clips"][number]["structure"] =
          row.structure === "cold_open" ||
          row.structure === "drop_first" ||
          row.structure === "vocal_tease" ||
          row.structure === "beat_switch"
            ? row.structure
            : "drop_first"

        return {
          id: typeof row.id === "string" ? row.id : `clip-${index + 1}`,
          mashupId: typeof row.mashup_id === "string" ? row.mashup_id : "unknown",
          title: typeof row.title === "string" ? row.title : "Untitled",
          creatorName: typeof row.creator_name === "string" ? row.creator_name : "Unknown",
          structure,
          clipStartSec: typeof row.clip_start_sec === "number" ? row.clip_start_sec : 0,
          clipLengthSec: row.clip_length_sec === 30 ? 30 : 15,
          confidence: typeof row.confidence === "number" ? row.confidence : 0.7,
          rightsSafe: Boolean(row.rights_safe),
          rightsScore: typeof row.rights_score === "number" ? row.rights_score : 0,
        }
      },
    )

    const publishedAt =
      typeof data[0]?.published_at === "string" ? data[0].published_at : fallback.publishedAt

    return {
      id: typeof data[0]?.pack_id === "string" ? data[0].pack_id : fallback.id,
      publishedAt,
      publishWeek: weekStart,
      day: new Date(publishedAt).getDay() === 1 ? "Monday" : "Other",
      clipCount: clips.length,
      clips,
    }
  } catch {
    return fallback
  }
}
