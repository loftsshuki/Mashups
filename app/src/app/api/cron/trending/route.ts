import { NextResponse } from "next/server"

/**
 * Vercel Cron handler — runs daily at 6 AM UTC.
 * Fetches trending music from YouTube and upserts into trending_sounds table.
 */
export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization")
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results: { youtube: number; errors: string[] } = {
    youtube: 0,
    errors: [],
  }

  // Fetch YouTube trending
  if (process.env.YOUTUBE_API_KEY) {
    try {
      const { fetchTrendingMusic } = await import(
        "@/lib/integrations/youtube"
      )
      const videos = await fetchTrendingMusic(25)

      if (videos.length > 0) {
        const { createClient } = await import("@/lib/supabase/server")
        const supabase = await createClient()

        // Compute velocity based on view count thresholds
        const rows = videos.map((v, i) => ({
          source: v.source,
          external_id: v.external_id,
          title: v.title,
          artist: v.artist,
          external_url: v.external_url,
          thumbnail_url: v.thumbnail_url,
          rank: i + 1,
          velocity:
            v.views > 50_000_000
              ? "hot"
              : v.views > 10_000_000
                ? "rising"
                : v.views > 1_000_000
                  ? "steady"
                  : "cooling",
          stats: { views: v.views, growthRate: 0 },
          tags: v.tags,
          fetched_at: new Date().toISOString(),
        }))

        const { error } = await supabase
          .from("trending_sounds")
          .upsert(rows, { onConflict: "source,external_id" })

        if (error) {
          results.errors.push(`YouTube upsert: ${error.message}`)
        } else {
          results.youtube = rows.length
        }
      }
    } catch (e) {
      results.errors.push(
        `YouTube fetch: ${e instanceof Error ? e.message : "Unknown error"}`,
      )
    }
  } else {
    results.errors.push("YOUTUBE_API_KEY not configured")
  }

  return NextResponse.json({
    ok: results.errors.length === 0,
    inserted: results.youtube,
    errors: results.errors,
    timestamp: new Date().toISOString(),
  })
}
