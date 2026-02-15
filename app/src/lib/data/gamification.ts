import { Trophy, Star, Zap, Flame, Target, Crown, Gem, Award, Medal, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type BadgeType = 
  | "first_mashup" 
  | "trending" 
  | "battle_winner" 
  | "battle_participant"
  | "remix_master"
  | "viral_hit"
  | "community_favorite"
  | "early_adopter"
  | "pro_creator"
  | "legend"
  | "speed_demon"
  | "stem_expert"
  | "collaborator"
  | "commentator"
  | "curator"

export interface Badge {
  id: BadgeType
  name: string
  description: string
  icon: LucideIcon
  color: string
  bgColor: string
  rarity: "common" | "rare" | "epic" | "legendary"
  requirements: string
  unlockedAt?: string
}

export interface CreatorTier {
  level: number
  name: string
  minPoints: number
  maxPoints: number
  color: string
  bgGradient: string
  badge: string
  benefits: string[]
}

export interface UserGamification {
  userId: string
  currentPoints: number
  currentTier: CreatorTier
  badges: Badge[]
  stats: {
    totalMashups: number
    totalPlays: number
    totalLikes: number
    battleWins: number
    battleParticipations: number
    remixesCreated: number
    followers: number
    following: number
  }
  recentActivity: {
    type: "badge_earned" | "tier_up" | "points_earned"
    description: string
    points: number
    timestamp: string
  }[]
}

// Badge definitions
export const badges: Record<BadgeType, Badge> = {
  first_mashup: {
    id: "first_mashup",
    name: "First Steps",
    description: "Created your first mashup",
    icon: Star,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    rarity: "common",
    requirements: "Upload your first mashup",
  },
  trending: {
    id: "trending",
    name: "Trending",
    description: "Reached 10,000 plays on a mashup",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    rarity: "rare",
    requirements: "Get 10,000 plays on a single mashup",
  },
  battle_winner: {
    id: "battle_winner",
    name: "Champion",
    description: "Won a mashup battle",
    icon: Trophy,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    rarity: "epic",
    requirements: "Win 1st place in any battle",
  },
  battle_participant: {
    id: "battle_participant",
    name: "Contender",
    description: "Participated in a battle",
    icon: Target,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    rarity: "common",
    requirements: "Submit an entry to any battle",
  },
  remix_master: {
    id: "remix_master",
    name: "Remix Master",
    description: "Created 10 remixes",
    icon: Zap,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    rarity: "rare",
    requirements: "Create 10 remixes of other mashups",
  },
  viral_hit: {
    id: "viral_hit",
    name: "Viral Hit",
    description: "Reached 100,000 plays",
    icon: Sparkles,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    rarity: "legendary",
    requirements: "Get 100,000 plays on a single mashup",
  },
  community_favorite: {
    id: "community_favorite",
    name: "Community Favorite",
    description: "Received 1,000 likes",
    icon: Award,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    rarity: "epic",
    requirements: "Get 1,000 likes on your mashups total",
  },
  early_adopter: {
    id: "early_adopter",
    name: "Early Adopter",
    description: "Joined during beta",
    icon: Gem,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    rarity: "legendary",
    requirements: "Create an account during beta period",
  },
  pro_creator: {
    id: "pro_creator",
    name: "Pro Creator",
    description: "Created 50 mashups",
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    rarity: "epic",
    requirements: "Upload 50 mashups",
  },
  legend: {
    id: "legend",
    name: "Legend",
    description: "Reached Legend tier",
    icon: Medal,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    rarity: "legendary",
    requirements: "Reach the Legend creator tier",
  },
  speed_demon: {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Won the 150+BPM battle",
    icon: Zap,
    color: "text-red-600",
    bgColor: "bg-red-600/10",
    rarity: "epic",
    requirements: "Win the Speed Demon battle",
  },
  stem_expert: {
    id: "stem_expert",
    name: "Stem Expert",
    description: "Used stem separation 20 times",
    icon: Target,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    rarity: "rare",
    requirements: "Use AI stem separation on 20 tracks",
  },
  collaborator: {
    id: "collaborator",
    name: "Collaborator",
    description: "Collaborated on 5 mashups",
    icon: Sparkles,
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    rarity: "rare",
    requirements: "Collaborate with other creators on 5 mashups",
  },
  commentator: {
    id: "commentator",
    name: "Commentator",
    description: "Left 100 comments",
    icon: Award,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    rarity: "common",
    requirements: "Leave 100 comments on mashups",
  },
  curator: {
    id: "curator",
    name: "Curator",
    description: "Created 10 playlists",
    icon: Crown,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    rarity: "rare",
    requirements: "Create and publish 10 playlists",
  },
}

// Tier definitions
export const creatorTiers: CreatorTier[] = [
  {
    level: 1,
    name: "Rookie",
    minPoints: 0,
    maxPoints: 99,
    color: "text-gray-500",
    bgGradient: "from-gray-500/20 to-gray-600/20",
    badge: "🌱",
    benefits: [
      "Upload up to 10 mashups",
      "Basic analytics",
      "Join battles",
    ],
  },
  {
    level: 2,
    name: "Rising",
    minPoints: 100,
    maxPoints: 499,
    color: "text-blue-500",
    bgGradient: "from-blue-500/20 to-blue-600/20",
    badge: "🚀",
    benefits: [
      "Upload up to 50 mashups",
      "Advanced analytics",
      "Custom profile themes",
      "Priority support",
    ],
  },
  {
    level: 3,
    name: "Established",
    minPoints: 500,
    maxPoints: 1999,
    color: "text-purple-500",
    bgGradient: "from-purple-500/20 to-purple-600/20",
    badge: "⭐",
    benefits: [
      "Unlimited uploads",
      "Monetization eligibility",
      "Featured profile badge",
      "Early access to features",
    ],
  },
  {
    level: 4,
    name: "Pro",
    minPoints: 2000,
    maxPoints: 4999,
    color: "text-orange-500",
    bgGradient: "from-orange-500/20 to-orange-600/20",
    badge: "🏆",
    benefits: [
      "All previous benefits",
      "Verified badge",
      "Higher revenue share",
      "Direct creator support",
    ],
  },
  {
    level: 5,
    name: "Legend",
    minPoints: 5000,
    maxPoints: Infinity,
    color: "text-yellow-500",
    bgGradient: "from-yellow-500/20 to-yellow-600/20",
    badge: "👑",
    benefits: [
      "All previous benefits",
      "Legend badge on profile",
      "Highest revenue share",
      "Beta feature access",
      "Annual creator retreat invite",
    ],
  },
]

// Helper functions
export function getTierForPoints(points: number): CreatorTier {
  return creatorTiers.find(tier => points >= tier.minPoints && points <= tier.maxPoints) 
    || creatorTiers[creatorTiers.length - 1]
}

export function getPointsToNextTier(currentPoints: number): number {
  const currentTier = getTierForPoints(currentPoints)
  const nextTier = creatorTiers.find(tier => tier.level === currentTier.level + 1)
  if (!nextTier) return 0
  return nextTier.minPoints - currentPoints
}

export function calculateTierProgress(currentPoints: number): number {
  const currentTier = getTierForPoints(currentPoints)
  const nextTier = creatorTiers.find(tier => tier.level === currentTier.level + 1)
  
  if (!nextTier) return 100
  
  const pointsInTier = currentPoints - currentTier.minPoints
  const tierRange = nextTier.minPoints - currentTier.minPoints
  return Math.min(100, Math.round((pointsInTier / tierRange) * 100))
}

export function getRarityColor(rarity: Badge["rarity"]): string {
  switch (rarity) {
    case "common": return "text-gray-500 border-gray-200"
    case "rare": return "text-blue-500 border-blue-200"
    case "epic": return "text-purple-500 border-purple-200"
    case "legendary": return "text-yellow-500 border-yellow-200"
    default: return "text-gray-500"
  }
}

export function getRarityBg(rarity: Badge["rarity"]): string {
  switch (rarity) {
    case "common": return "bg-gray-500/10"
    case "rare": return "bg-blue-500/10"
    case "epic": return "bg-purple-500/10"
    case "legendary": return "bg-yellow-500/10"
    default: return "bg-gray-500/10"
  }
}

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Mock fallback data
const mockGamificationData: Omit<UserGamification, "userId"> = {
  currentPoints: 750,
  currentTier: getTierForPoints(750),
  badges: [
    { ...badges.first_mashup, unlockedAt: "2026-01-15T10:00:00Z" },
    { ...badges.trending, unlockedAt: "2026-02-01T15:30:00Z" },
    { ...badges.battle_participant, unlockedAt: "2026-02-05T09:00:00Z" },
    { ...badges.remix_master, unlockedAt: "2026-02-10T14:20:00Z" },
    { ...badges.stem_expert, unlockedAt: "2026-02-12T11:45:00Z" },
  ],
  stats: {
    totalMashups: 15,
    totalPlays: 45000,
    totalLikes: 2300,
    battleWins: 0,
    battleParticipations: 2,
    remixesCreated: 12,
    followers: 180,
    following: 45,
  },
  recentActivity: [
    { type: "badge_earned", description: "Earned Stem Expert badge", points: 50, timestamp: "2026-02-12T11:45:00Z" },
    { type: "tier_up", description: "Leveled up to Established tier", points: 500, timestamp: "2026-02-08T16:00:00Z" },
    { type: "points_earned", description: "Mashup reached 1,000 plays", points: 25, timestamp: "2026-02-10T09:30:00Z" },
  ],
}

// Get user gamification data — aggregates real stats from existing tables
export async function getUserGamification(userId: string): Promise<UserGamification> {
  if (!isSupabaseConfigured()) {
    return { userId, ...mockGamificationData }
  }

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    // Aggregate stats from existing tables in parallel
    const [mashupResult, followersResult, followingResult, likesResult] = await Promise.all([
      supabase.from("mashups").select("id, play_count", { count: "exact" }).eq("creator_id", userId),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
      supabase.from("likes").select("mashup_id, mashups!inner(creator_id)", { count: "exact", head: true }).eq("mashups.creator_id", userId),
    ])

    const totalMashups = mashupResult.count ?? 0
    const totalPlays = (mashupResult.data ?? []).reduce((sum: number, m: Record<string, unknown>) => sum + ((m.play_count as number) ?? 0), 0)
    const followers = followersResult.count ?? 0
    const following = followingResult.count ?? 0
    const totalLikes = likesResult.count ?? 0

    // Calculate points from real activity
    const currentPoints =
      totalMashups * 10 +
      Math.floor(totalPlays / 100) * 5 +
      Math.floor(totalLikes / 10) * 5 +
      followers

    const currentTier = getTierForPoints(currentPoints)

    // Derive badges from stats
    const earnedBadges: Badge[] = []
    if (totalMashups >= 1) earnedBadges.push({ ...badges.first_mashup, unlockedAt: new Date().toISOString() })
    if (totalPlays >= 10000) earnedBadges.push({ ...badges.trending, unlockedAt: new Date().toISOString() })
    if (totalPlays >= 100000) earnedBadges.push({ ...badges.viral_hit, unlockedAt: new Date().toISOString() })
    if (totalLikes >= 1000) earnedBadges.push({ ...badges.community_favorite, unlockedAt: new Date().toISOString() })
    if (totalMashups >= 50) earnedBadges.push({ ...badges.pro_creator, unlockedAt: new Date().toISOString() })
    if (currentTier.level >= 5) earnedBadges.push({ ...badges.legend, unlockedAt: new Date().toISOString() })

    return {
      userId,
      currentPoints,
      currentTier,
      badges: earnedBadges,
      stats: {
        totalMashups,
        totalPlays,
        totalLikes,
        battleWins: 0,
        battleParticipations: 0,
        remixesCreated: 0,
        followers,
        following,
      },
      recentActivity: [],
    }
  } catch {
    return { userId, ...mockGamificationData }
  }
}

// Sync alias for backward compatibility
export function getMockUserGamification(userId: string): UserGamification {
  return { userId, ...mockGamificationData }
}

// Points calculation
export function calculatePointsForAction(action: string): number {
  const pointsMap: Record<string, number> = {
    "upload_mashup": 10,
    "mashup_play_100": 5,
    "mashup_play_1000": 25,
    "mashup_play_10000": 100,
    "mashup_like_10": 5,
    "mashup_like_100": 50,
    "battle_entry": 20,
    "battle_win": 200,
    "battle_2nd": 100,
    "battle_3rd": 50,
    "remix_created": 15,
    "comment_posted": 2,
    "follower_gained": 1,
    "playlist_created": 5,
    "stem_separation": 3,
  }
  return pointsMap[action] || 0
}
