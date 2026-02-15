export interface EmergingCreator {
  id: string
  username: string
  displayName: string
  avatarUrl: string
  growthVelocity: number // play count acceleration
  qualityScore: number // avg play-through rate
  consistencyScore: number // regular creation frequency
  engagementScore: number // collabs + challenges
  overallScore: number
  mashupCount: number
  totalPlays: number
  recentGrowth: string // e.g. "+340% this week"
  topGenre: string
}

const mockEmergingCreators: EmergingCreator[] = [
  {
    id: "em-1",
    username: "crystalbeats",
    displayName: "Crystal Beats",
    avatarUrl: "https://placehold.co/100x100/8b5cf6/white?text=CB",
    growthVelocity: 0.92,
    qualityScore: 0.88,
    consistencyScore: 0.95,
    engagementScore: 0.78,
    overallScore: 0.88,
    mashupCount: 14,
    totalPlays: 8420,
    recentGrowth: "+340% this week",
    topGenre: "Electronic",
  },
  {
    id: "em-2",
    username: "vinylwhisper",
    displayName: "Vinyl Whisper",
    avatarUrl: "https://placehold.co/100x100/ec4899/white?text=VW",
    growthVelocity: 0.85,
    qualityScore: 0.91,
    consistencyScore: 0.82,
    engagementScore: 0.88,
    overallScore: 0.86,
    mashupCount: 9,
    totalPlays: 5200,
    recentGrowth: "+280% this week",
    topGenre: "Lo-fi",
  },
  {
    id: "em-3",
    username: "bassarchitect",
    displayName: "Bass Architect",
    avatarUrl: "https://placehold.co/100x100/f59e0b/white?text=BA",
    growthVelocity: 0.88,
    qualityScore: 0.82,
    consistencyScore: 0.90,
    engagementScore: 0.85,
    overallScore: 0.86,
    mashupCount: 18,
    totalPlays: 11800,
    recentGrowth: "+210% this week",
    topGenre: "Bass",
  },
  {
    id: "em-4",
    username: "sonicweaver",
    displayName: "Sonic Weaver",
    avatarUrl: "https://placehold.co/100x100/10b981/white?text=SW",
    growthVelocity: 0.79,
    qualityScore: 0.93,
    consistencyScore: 0.76,
    engagementScore: 0.91,
    overallScore: 0.84,
    mashupCount: 7,
    totalPlays: 3900,
    recentGrowth: "+520% this week",
    topGenre: "Ambient",
  },
  {
    id: "em-5",
    username: "rhythmhacker",
    displayName: "Rhythm Hacker",
    avatarUrl: "https://placehold.co/100x100/ef4444/white?text=RH",
    growthVelocity: 0.83,
    qualityScore: 0.79,
    consistencyScore: 0.88,
    engagementScore: 0.82,
    overallScore: 0.83,
    mashupCount: 22,
    totalPlays: 14300,
    recentGrowth: "+175% this week",
    topGenre: "Hip-Hop",
  },
]

export async function getEmergingCreators(limit = 10): Promise<EmergingCreator[]> {
  return mockEmergingCreators
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, limit)
}
