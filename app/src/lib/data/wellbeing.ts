export interface WellbeingStatus {
  consecutiveDays: number
  shouldPromptSabbatical: boolean
  daysSinceLastVisit: number
  showWelcomeBack: boolean
  whileAwayStats: {
    newPlays: number
    newFollowers: number
    newComments: number
    trendingMashups: string[]
  } | null
}

const SABBATICAL_THRESHOLD = 30
const WELCOME_BACK_THRESHOLD = 3

export async function getWellbeingStatus(_userId: string): Promise<WellbeingStatus> {
  // Mock: simulate a user with 32 consecutive days
  const consecutiveDays = 32
  const daysSinceLastVisit = 0

  return {
    consecutiveDays,
    shouldPromptSabbatical: consecutiveDays >= SABBATICAL_THRESHOLD,
    daysSinceLastVisit,
    showWelcomeBack: daysSinceLastVisit >= WELCOME_BACK_THRESHOLD,
    whileAwayStats: daysSinceLastVisit >= WELCOME_BACK_THRESHOLD
      ? {
          newPlays: 1247,
          newFollowers: 8,
          newComments: 23,
          trendingMashups: ["Neon Dreams Remix", "Bass Drop Fusion", "Retro Wave Mix"],
        }
      : null,
  }
}

// Second mock: user who has been away
export async function getWelcomeBackStatus(_userId: string): Promise<WellbeingStatus> {
  return {
    consecutiveDays: 0,
    shouldPromptSabbatical: false,
    daysSinceLastVisit: 5,
    showWelcomeBack: true,
    whileAwayStats: {
      newPlays: 1247,
      newFollowers: 8,
      newComments: 23,
      trendingMashups: ["Neon Dreams Remix", "Bass Drop Fusion", "Retro Wave Mix"],
    },
  }
}
