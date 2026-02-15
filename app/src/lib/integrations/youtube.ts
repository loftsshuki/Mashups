// YouTube Data API v3 — fetch trending music videos

interface YouTubeTrendingItem {
  title: string
  artist: string
  source: "youtube"
  external_id: string
  external_url: string
  thumbnail_url: string
  views: number
  tags: string[]
}

/**
 * Fetch trending music videos from YouTube Data API v3.
 * Uses the `mostPopular` chart with `videoCategoryId=10` (Music).
 */
export async function fetchTrendingMusic(
  limit: number = 25,
): Promise<YouTubeTrendingItem[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) throw new Error("YOUTUBE_API_KEY not configured")

  const params = new URLSearchParams({
    part: "snippet,statistics",
    chart: "mostPopular",
    videoCategoryId: "10", // Music category
    regionCode: "US",
    maxResults: String(limit),
    key: apiKey,
  })

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${params}`,
  )

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error")
    throw new Error(`YouTube API error ${response.status}: ${errorBody}`)
  }

  const data = await response.json()

  return (data.items ?? []).map(
    (item: {
      id: string
      snippet: {
        title: string
        channelTitle: string
        thumbnails: { high?: { url: string }; medium?: { url: string } }
        tags?: string[]
      }
      statistics: { viewCount?: string }
    }) => ({
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      source: "youtube" as const,
      external_id: item.id,
      external_url: `https://www.youtube.com/watch?v=${item.id}`,
      thumbnail_url:
        item.snippet.thumbnails.high?.url ??
        item.snippet.thumbnails.medium?.url ??
        "",
      views: parseInt(item.statistics.viewCount ?? "0", 10),
      tags: (item.snippet.tags ?? []).slice(0, 5),
    }),
  )
}
