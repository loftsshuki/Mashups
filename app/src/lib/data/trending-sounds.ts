/**
 * Trending Sounds Data
 * Mock data for trending TikTok/Spotify sounds
 * In production, this would call TikTok API + Spotify Charts
 */

export interface TrendingSound {
  id: string
  title: string
  artist: string
  platform: "tiktok" | "spotify" | "youtube"
  thumbnailUrl: string
  previewUrl: string
  velocity: "rising" | "hot" | "steady" | "cooling"
  stats: {
    posts?: number // TikTok: videos using this sound
    streams?: number // Spotify: weekly streams
    views?: number // YouTube: views
    growthRate: number // % change from last week
  }
  rank: number
  previousRank?: number
  duration: number
  bpm?: number
  key?: string
  tags: string[]
  isRemixable: boolean
  originalSource?: string
}

// Mock trending data
export const MOCK_TRENDING_SOUNDS: TrendingSound[] = [
  {
    id: "tt-001",
    title: "Cruel Summer",
    artist: "Taylor Swift",
    platform: "tiktok",
    thumbnailUrl: "https://placehold.co/100x100/ec4899/white?text=CS",
    previewUrl: "/audio/trending/cruel-summer.mp3",
    velocity: "hot",
    stats: { posts: 2500000, growthRate: 45 },
    rank: 1,
    previousRank: 3,
    duration: 178,
    bpm: 170,
    key: "A",
    tags: ["pop", "summer", "viral"],
    isRemixable: true,
  },
  {
    id: "tt-002",
    title: "Paint The Town Red",
    artist: "Doja Cat",
    platform: "tiktok",
    thumbnailUrl: "https://placehold.co/100x100/f59e0b/white?text=PT",
    previewUrl: "/audio/trending/paint-town-red.mp3",
    velocity: "rising",
    stats: { posts: 1800000, growthRate: 120 },
    rank: 2,
    previousRank: 8,
    duration: 195,
    bpm: 95,
    key: "Dm",
    tags: ["rap", "hip-hop", "trending"],
    isRemixable: true,
  },
  {
    id: "sp-001",
    title: "Vampire",
    artist: "Olivia Rodrigo",
    platform: "spotify",
    thumbnailUrl: "https://placehold.co/100x100/8b5cf6/white?text=VA",
    previewUrl: "/audio/trending/vampire.mp3",
    velocity: "steady",
    stats: { streams: 15000000, growthRate: 5 },
    rank: 3,
    previousRank: 2,
    duration: 219,
    bpm: 138,
    key: "F#m",
    tags: ["pop", "rock", "ballad"],
    isRemixable: true,
  },
  {
    id: "tt-003",
    title: "Seven (feat. Latto)",
    artist: "Jung Kook",
    platform: "tiktok",
    thumbnailUrl: "https://placehold.co/100x100/10b981/white?text=SE",
    previewUrl: "/audio/trending/seven.mp3",
    velocity: "hot",
    stats: { posts: 3200000, growthRate: 30 },
    rank: 4,
    previousRank: 1,
    duration: 184,
    bpm: 125,
    key: "B",
    tags: ["k-pop", "pop", "summer"],
    isRemixable: true,
  },
  {
    id: "yt-001",
    title: "What Was I Made For?",
    artist: "Billie Eilish",
    platform: "youtube",
    thumbnailUrl: "https://placehold.co/100x100/06b6d4/white?text=WW",
    previewUrl: "/audio/trending/what-was-made-for.mp3",
    velocity: "rising",
    stats: { views: 85000000, growthRate: 85 },
    rank: 5,
    previousRank: 12,
    duration: 222,
    bpm: 78,
    key: "G",
    tags: ["soundtrack", "ballad", "viral"],
    isRemixable: true,
  },
  {
    id: "sp-002",
    title: "Dance The Night",
    artist: "Dua Lipa",
    platform: "spotify",
    thumbnailUrl: "https://placehold.co/100x100/f472b6/white?text=DN",
    previewUrl: "/audio/trending/dance-night.mp3",
    velocity: "steady",
    stats: { streams: 12000000, growthRate: 10 },
    rank: 6,
    previousRank: 4,
    duration: 176,
    bpm: 118,
    key: "D",
    tags: ["disco", "pop", "soundtrack"],
    isRemixable: true,
  },
  {
    id: "tt-004",
    title: "Boy's a Liar Pt. 2",
    artist: "PinkPantheress & Ice Spice",
    platform: "tiktok",
    thumbnailUrl: "https://placehold.co/100x100/a855f7/white?text=BL",
    previewUrl: "/audio/trending/boys-liar.mp3",
    velocity: "cooling",
    stats: { posts: 1500000, growthRate: -15 },
    rank: 7,
    previousRank: 5,
    duration: 154,
    bpm: 132,
    key: "Em",
    tags: ["drum-bass", "rap", "uk"],
    isRemixable: true,
  },
  {
    id: "tt-005",
    title: "Barbie World",
    artist: "Nicki Minaj & Ice Spice",
    platform: "tiktok",
    thumbnailUrl: "https://placehold.co/100x100/ff69b4/white?text=BW",
    previewUrl: "/audio/trending/barbie-world.mp3",
    velocity: "rising",
    stats: { posts: 2100000, growthRate: 65 },
    rank: 8,
    previousRank: 15,
    duration: 161,
    bpm: 140,
    key: "C#m",
    tags: ["rap", "pop", "soundtrack"],
    isRemixable: true,
  },
  {
    id: "sp-003",
    title: "Last Night",
    artist: "Morgan Wallen",
    platform: "spotify",
    thumbnailUrl: "https://placehold.co/100x100/64748b/white?text=LN",
    previewUrl: "/audio/trending/last-night.mp3",
    velocity: "hot",
    stats: { streams: 18000000, growthRate: 25 },
    rank: 9,
    previousRank: 7,
    duration: 194,
    bpm: 112,
    key: "E",
    tags: ["country", "pop", "chart-topper"],
    isRemixable: true,
  },
  {
    id: "yt-002",
    title: "Rich Flex",
    artist: "Drake & 21 Savage",
    platform: "youtube",
    thumbnailUrl: "https://placehold.co/100x100/1e293b/white?text=RF",
    previewUrl: "/audio/trending/rich-flex.mp3",
    velocity: "steady",
    stats: { views: 45000000, growthRate: 8 },
    rank: 10,
    previousRank: 9,
    duration: 239,
    bpm: 98,
    key: "Cm",
    tags: ["rap", "hip-hop", "drake"],
    isRemixable: true,
  },
]

/**
 * Get trending sounds with optional filters
 */
export async function getTrendingSounds(
  options: {
    platform?: "tiktok" | "spotify" | "youtube" | "all"
    velocity?: TrendingSound["velocity"][]
    limit?: number
  } = {}
): Promise<TrendingSound[]> {
  const { platform = "all", velocity, limit = 10 } = options

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  let sounds = [...MOCK_TRENDING_SOUNDS]

  // Filter by platform
  if (platform !== "all") {
    sounds = sounds.filter((s) => s.platform === platform)
  }

  // Filter by velocity
  if (velocity && velocity.length > 0) {
    sounds = sounds.filter((s) => velocity.includes(s.velocity))
  }

  // Sort by rank
  sounds.sort((a, b) => a.rank - b.rank)

  return sounds.slice(0, limit)
}

/**
 * Get single trending sound
 */
export async function getTrendingSound(id: string): Promise<TrendingSound | null> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return MOCK_TRENDING_SOUNDS.find((s) => s.id === id) || null
}

/**
 * Search trending sounds
 */
export async function searchTrendingSounds(query: string): Promise<TrendingSound[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const lowerQuery = query.toLowerCase()
  return MOCK_TRENDING_SOUNDS.filter(
    (s) =>
      s.title.toLowerCase().includes(lowerQuery) ||
      s.artist.toLowerCase().includes(lowerQuery) ||
      s.tags.some((t) => t.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Get velocity badge styling
 */
export function getVelocityStyles(
  velocity: TrendingSound["velocity"]
): { badge: string; icon: string; label: string } {
  switch (velocity) {
    case "hot":
      return {
        badge: "bg-red-500 text-white",
        icon: "🔥",
        label: "Hot",
      }
    case "rising":
      return {
        badge: "bg-orange-500 text-white",
        icon: "📈",
        label: "Rising Fast",
      }
    case "steady":
      return {
        badge: "bg-blue-500 text-white",
        icon: "➡️",
        label: "Steady",
      }
    case "cooling":
      return {
        badge: "bg-gray-500 text-white",
        icon: "📉",
        label: "Cooling",
      }
  }
}

/**
 * Format large numbers
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

/**
 * Get rank change indicator
 */
export function getRankChange(
  current: number,
  previous?: number
): { direction: "up" | "down" | "same"; diff: number } {
  if (!previous) return { direction: "same", diff: 0 }
  if (current < previous) return { direction: "up", diff: previous - current }
  if (current > previous) return { direction: "down", diff: current - previous }
  return { direction: "same", diff: 0 }
}
