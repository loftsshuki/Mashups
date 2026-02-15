// Intelligent Recommendations - "What to remix next"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export type RecommendationType =
  | "trending" 
  | "skill_building" 
  | "compatible" 
  | "similar_creators" 
  | "daily_challenge"
  | "undiscovered"

export interface Recommendation {
  id: string
  type: RecommendationType
  title: string
  description: string
  confidence: number // 0-100
  reason: string
  target: {
    type: "mashup" | "creator" | "challenge" | "track"
    id: string
    data: any
  }
  actions: Array<{
    label: string
    href: string
  }>
  expiresAt?: string
}

export interface UserTaste {
  preferredGenres: string[]
  preferredBPM: { min: number; max: number }
  favoriteCreators: string[]
  recentActivity: string[]
  skillLevel: "beginner" | "intermediate" | "advanced"
}

export interface TrendingAnalysis {
  trendingGenres: Array<{
    genre: string
    growth: number // percentage
    volume: number // number of plays
  }>
  risingCreators: Array<{
    creatorId: string
    name: string
    followerGrowth: number
    hitTrack: string
  }>
  viralSounds: Array<{
    trackId: string
    title: string
    artist: string
    platform: string
    velocity: number
  }>
}

// Generate personalized recommendations
// Uses vector similarity search when embeddings exist, otherwise mock
export async function getRecommendations(
  userId: string,
  userTaste: UserTaste,
  limit: number = 10
): Promise<Recommendation[]> {
  // Try vector-based recommendations first
  if (isSupabaseConfigured() && process.env.OPENAI_API_KEY) {
    try {
      const vectorRecs = await getVectorRecommendations(userId, userTaste, limit)
      if (vectorRecs.length > 0) return vectorRecs
    } catch {
      // Fall through to mock
    }
  }

  // Simulate ML model
  await new Promise(resolve => setTimeout(resolve, 800))

  const recommendations: Recommendation[] = []
  
  // Trending recommendations
  recommendations.push({
    id: `rec_${Date.now()}_1`,
    type: "trending",
    title: "Phonk is trending +340%",
    description: "Drift phonk style mashups are blowing up. Try mixing Memphis rap vocals with drift phonk beats.",
    confidence: 92,
    reason: "Based on your hip-hop preferences and current viral trends",
    target: {
      type: "track",
      id: "track_phonk_001",
      data: { genre: "Phonk", bpm: 140 },
    },
    actions: [
      { label: "Try This", href: "/create?template=phonk" },
      { label: "Explore Trend", href: "/explore?genre=Phonk" },
    ],
  })
  
  // Skill building
  const skillRec = getSkillBuildingRec(userTaste.skillLevel)
  recommendations.push(skillRec)
  
  // Compatible tracks
  recommendations.push({
    id: `rec_${Date.now()}_3`,
    type: "compatible",
    title: "Perfect BPM Match Found",
    description: "Your recent track 'Neon Dreams' (128 BPM) matches well with 5 trending tracks in your library.",
    confidence: 87,
    reason: "BPM and key analysis shows high compatibility",
    target: {
      type: "mashup",
      id: "compat_001",
      data: { matches: 5, avgConfidence: 85 },
    },
    actions: [
      { label: "View Matches", href: "/create?matches=true" },
    ],
  })
  
  // Similar creators
  recommendations.push({
    id: `rec_${Date.now()}_4`,
    type: "similar_creators",
    title: "Creators like you are making...",
    description: "Producers with similar taste are experimenting with synthwave + drum & bass combinations.",
    confidence: 78,
    reason: "Peer behavior analysis",
    target: {
      type: "creator",
      id: "trend_analysis",
      data: { combination: "Synthwave + DnB", adoptionRate: 0.34 },
    },
    actions: [
      { label: "Try This Combo", href: "/create?genres=synthwave,dnb" },
    ],
  })
  
  // Daily challenge
  recommendations.push({
    id: `rec_${Date.now()}_5`,
    type: "daily_challenge",
    title: "Today's Challenge: Speed Demon",
    description: "Create a mashup with only 150+ BPM tracks. Battle submissions open until midnight!",
    confidence: 95,
    reason: "Daily skill challenge",
    target: {
      type: "challenge",
      id: "daily_001",
      data: { type: "Speed Demon", deadline: "23:59" },
    },
    actions: [
      { label: "Accept Challenge", href: "/battles/daily" },
    ],
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  })
  
  // Undiscovered gems
  recommendations.push({
    id: `rec_${Date.now()}_6`,
    type: "undiscovered",
    title: "Hidden Gem: RetroKing",
    description: "This creator has <100 followers but makes incredible 80s mashups. Perfect match for your taste!",
    confidence: 82,
    reason: "Taste profile match with low engagement",
    target: {
      type: "creator",
      id: "creator_retro_001",
      data: { followers: 87, matchScore: 94 },
    },
    actions: [
      { label: "Check Profile", href: "/profile/RetroKing" },
      { label: "Collab?", href: "/messages?to=RetroKing" },
    ],
  })
  
  return recommendations.slice(0, limit)
}

function getSkillBuildingRec(skillLevel: UserTaste["skillLevel"]): Recommendation {
  const recs: Record<UserTaste["skillLevel"], Recommendation> = {
    beginner: {
      id: `rec_${Date.now()}_2`,
      type: "skill_building",
      title: "Master Beat Matching",
      description: "Your recent uploads show timing issues. Try our AI beat match tool for cleaner transitions.",
      confidence: 88,
      reason: "Detected timing inconsistencies in your last 3 uploads",
      target: {
        type: "challenge",
        id: "skill_beatmatch",
        data: { skill: "beat_matching", difficulty: "beginner" },
      },
      actions: [
        { label: "Try Tool", href: "/create?tool=beatmatch" },
        { label: "Watch Tutorial", href: "/learn/beat-matching" },
      ],
    },
    intermediate: {
      id: `rec_${Date.now()}_2`,
      type: "skill_building",
      title: "Learn Key Matching",
      description: "Elevate your mashups with harmonic mixing. Your compatible key matches could improve by 40%.",
      confidence: 85,
      reason: "Intermediate progression path",
      target: {
        type: "challenge",
        id: "skill_keymatching",
        data: { skill: "key_matching", difficulty: "intermediate" },
      },
      actions: [
        { label: "Learn More", href: "/learn/key-matching" },
        { label: "Practice", href: "/create?tool=keymatch" },
      ],
    },
    advanced: {
      id: `rec_${Date.now()}_2`,
      type: "skill_building",
      title: "Advanced Stem Manipulation",
      description: "You've mastered the basics. Try isolating individual instruments for surgical precision.",
      confidence: 90,
      reason: "Advanced technique recommendation",
      target: {
        type: "challenge",
        id: "skill_stems",
        data: { skill: "stem_manipulation", difficulty: "advanced" },
      },
      actions: [
        { label: "Try Pro Tools", href: "/create?tool=stems" },
        { label: "Advanced Guide", href: "/learn/stem-mastery" },
      ],
    },
  }
  
  return recs[skillLevel]
}

// Get trending analysis
export async function getTrendingAnalysis(): Promise<TrendingAnalysis> {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return {
    trendingGenres: [
      { genre: "Phonk", growth: 340, volume: 2500000 },
      { genre: "Drift House", growth: 180, volume: 1200000 },
      { genre: "Hyperpop", growth: 120, volume: 890000 },
      { genre: "Brazilian Funk", growth: 95, volume: 1500000 },
    ],
    risingCreators: [
      { creatorId: "c1", name: "NeonMancer", followerGrowth: 450, hitTrack: "Cyber Dreams" },
      { creatorId: "c2", name: "BassWeaver", followerGrowth: 320, hitTrack: "Low End Theory" },
    ],
    viralSounds: [
      { trackId: "v1", title: "After Dark", artist: "Mr.Kitty", platform: "TikTok", velocity: 95 },
      { trackId: "v2", title: "Memory Reboot", artist: "VOJ", platform: "YouTube", velocity: 88 },
    ],
  }
}

// Get daily feed
export async function getDailyFeed(userId: string): Promise<{
  recommendations: Recommendation[]
  trending: TrendingAnalysis
  newFromFollowing: any[]
  challenges: any[]
}> {
  const [recommendations, trending] = await Promise.all([
    getRecommendations(userId, {
      preferredGenres: ["Electronic", "Hip-Hop"],
      preferredBPM: { min: 120, max: 140 },
      favoriteCreators: [],
      recentActivity: [],
      skillLevel: "intermediate",
    }),
    getTrendingAnalysis(),
  ])
  
  return {
    recommendations,
    trending,
    newFromFollowing: [],
    challenges: [],
  }
}

// Mock recommendation for UI demo
export const mockRecommendations: Recommendation[] = [
  {
    id: "rec_001",
    type: "trending",
    title: "Try Phonk + House",
    description: "This unexpected combo is trending up 400% this week",
    confidence: 91,
    reason: "Viral trend detection",
    target: {
      type: "track",
      id: "trend_001",
      data: {},
    },
    actions: [{ label: "Try Now", href: "/create" }],
  },
  {
    id: "rec_002",
    type: "compatible",
    title: "Your tracks match with...",
    description: "3 songs in your library have compatible keys and BPMs",
    confidence: 87,
    reason: "Audio analysis",
    target: {
      type: "mashup",
      id: "compat_001",
      data: {},
    },
    actions: [{ label: "View", href: "/create" }],
  },
]

// ---------------------------------------------------------------------------
// Supabase-backed recommendation tracking
// ---------------------------------------------------------------------------

export async function logRecommendationEvent(
  userId: string,
  recommendationId: string,
  action: "shown" | "clicked" | "dismissed" | "completed",
  metadata?: Record<string, unknown>,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { error } = await supabase.from("recommendation_events").insert({
      user_id: userId,
      recommendation_id: recommendationId,
      event_type: action,
      metadata: metadata ?? {},
    })

    return !error
  } catch {
    return false
  }
}

export async function getRecommendationHistory(
  userId: string,
  limit: number = 20,
): Promise<Array<{ recommendationId: string; eventType: string; createdAt: string }>> {
  if (!isSupabaseConfigured()) return []

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data, error } = await supabase
      .from("recommendation_events")
      .select("recommendation_id, event_type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error || !data) return []

    return (data as Record<string, unknown>[]).map((row) => ({
      recommendationId: row.recommendation_id as string,
      eventType: row.event_type as string,
      createdAt: row.created_at as string,
    }))
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Vector-based recommendations (pgvector similarity search)
// ---------------------------------------------------------------------------

async function getVectorRecommendations(
  userId: string,
  userTaste: UserTaste,
  limit: number,
): Promise<Recommendation[]> {
  const { createClient } = await import("@/lib/supabase/client")
  const supabase = createClient()

  // Get user's most recent mashup with an embedding
  const { data: userMashups } = await supabase
    .from("mashups")
    .select("id, embedding")
    .eq("creator_id", userId)
    .not("embedding", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)

  if (!userMashups?.length) return []

  const { findSimilarMashups } = await import("@/lib/ai/embeddings")
  const similar = await findSimilarMashups(userMashups[0].id, limit)

  if (!similar.length) return []

  return similar.map((m, i) => ({
    id: `rec_vec_${Date.now()}_${i}`,
    type: "compatible" as RecommendationType,
    title: m.title,
    description: `${Math.round(m.similarity * 100)}% match based on style and content`,
    confidence: Math.round(m.similarity * 100),
    reason: "AI-powered similarity analysis",
    target: {
      type: "mashup" as const,
      id: m.id,
      data: { similarity: m.similarity },
    },
    actions: [
      { label: "Listen", href: `/mashups/${m.id}` },
      { label: "Remix", href: `/create?remix=${m.id}` },
    ],
  }))
}

// Helper functions
export function getRecommendationColor(type: RecommendationType): string {
  const colors: Record<RecommendationType, string> = {
    trending: "text-red-500 bg-red-500/10",
    skill_building: "text-blue-500 bg-blue-500/10",
    compatible: "text-green-500 bg-green-500/10",
    similar_creators: "text-purple-500 bg-purple-500/10",
    daily_challenge: "text-yellow-500 bg-yellow-500/10",
    undiscovered: "text-cyan-500 bg-cyan-500/10",
  }
  return colors[type]
}

export function getRecommendationIcon(type: RecommendationType): string {
  const icons: Record<RecommendationType, string> = {
    trending: "🔥",
    skill_building: "📈",
    compatible: "🧩",
    similar_creators: "👥",
    daily_challenge: "🎯",
    undiscovered: "💎",
  }
  return icons[type]
}
