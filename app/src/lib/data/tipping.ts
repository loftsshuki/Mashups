// Tipping System - Direct support between users
// Instant micro-transactions with platform fee

export interface Tip {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  recipientId: string
  recipientName: string
  amount: number // in cents
  currency: string
  message?: string
  isAnonymous: boolean
  isPublic: boolean // Show on profile or private
  createdAt: string
  status: "pending" | "completed" | "failed" | "refunded"
  transactionId?: string
  // For display
  formattedAmount?: string
}

export interface TipStats {
  totalTipsReceived: number
  totalTipsSent: number
  totalAmountReceived: number // in cents
  totalAmountSent: number // in cents
  averageTipAmount: number
  topSupporters: TipperRanking[]
  recentTippers: Tip[]
}

export interface TipperRanking {
  userId: string
  displayName: string
  avatarUrl: string
  totalTipped: number
  tipCount: number
  streakMonths: number
  badge?: string
}

export interface TipPreset {
  amount: number
  label: string
  emoji: string
  isPopular?: boolean
}

// Platform fee on tips (5%)
const PLATFORM_TIP_FEE_PERCENT = 5

// Tip presets (in cents)
export const TIP_PRESETS: TipPreset[] = [
  { amount: 100, label: "Coffee", emoji: "☕", isPopular: true },
  { amount: 500, label: "Lunch", emoji: "🍕" },
  { amount: 1000, label: "Dinner", emoji: "🍽️" },
  { amount: 2000, label: "Studio Time", emoji: "🎧" },
  { amount: 5000, label: "Equipment", emoji: "🎹" },
  { amount: 10000, label: "Legend", emoji: "👑" },
]

// Custom tip validation
export const MIN_TIP_AMOUNT = 50 // $0.50
export const MAX_TIP_AMOUNT = 100000 // $1,000

// Send a tip
export async function sendTip(
  senderId: string,
  recipientId: string,
  amount: number,
  options: {
    message?: string
    isAnonymous?: boolean
    isPublic?: boolean
    paymentMethod: "card" | "wallet" | "balance"
  }
): Promise<{ tip: Tip | null; success: boolean; error?: string }> {
  // Validate amount
  if (amount < MIN_TIP_AMOUNT || amount > MAX_TIP_AMOUNT) {
    return {
      tip: null,
      success: false,
      error: `Tip amount must be between $${(MIN_TIP_AMOUNT / 100).toFixed(2)} and $${(MAX_TIP_AMOUNT / 100).toFixed(2)}`,
    }
  }

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))

  const platformFee = Math.round(amount * (PLATFORM_TIP_FEE_PERCENT / 100))
  const recipientAmount = amount - platformFee

  const tip: Tip = {
    id: `tip_${Date.now()}`,
    senderId: options.isAnonymous ? "anonymous" : senderId,
    senderName: options.isAnonymous ? "Anonymous" : "You",
    senderAvatar: options.isAnonymous ? "" : "",
    recipientId,
    recipientName: "", // Would fetch
    amount: recipientAmount, // Net amount after fee
    currency: "USD",
    message: options.message?.slice(0, 280), // Max 280 chars
    isAnonymous: options.isAnonymous ?? false,
    isPublic: options.isPublic ?? true,
    createdAt: new Date().toISOString(),
    status: "completed",
    transactionId: `tx_${Math.random().toString(36).slice(2)}`,
    formattedAmount: formatTipAmount(recipientAmount),
  }

  return { tip, success: true }
}

// Get tip history for user
export async function getUserTips(
  userId: string,
  direction: "sent" | "received" | "all" = "all",
  limit: number = 20
): Promise<Tip[]> {
  await new Promise(resolve => setTimeout(resolve, 300))

  const tips: Tip[] = mockTips.filter(tip => {
    if (direction === "sent") return tip.senderId === userId
    if (direction === "received") return tip.recipientId === userId
    return tip.senderId === userId || tip.recipientId === userId
  })

  return tips.slice(0, limit)
}

// Get tip stats for creator
export async function getTipStats(userId: string): Promise<TipStats> {
  await new Promise(resolve => setTimeout(resolve, 200))

  const received = mockTips.filter(t => t.recipientId === userId && t.status === "completed")
  const sent = mockTips.filter(t => t.senderId === userId && t.status === "completed")

  const totalReceived = received.reduce((sum, t) => sum + t.amount, 0)
  const totalSent = sent.reduce((sum, t) => sum + t.amount, 0)

  return {
    totalTipsReceived: received.length,
    totalTipsSent: sent.length,
    totalAmountReceived: totalReceived,
    totalAmountSent: totalSent,
    averageTipAmount: received.length > 0 ? totalReceived / received.length : 0,
    topSupporters: mockTopSupporters,
    recentTippers: received.slice(0, 5),
  }
}

// Format tip amount
export function formatTipAmount(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

// Get tip message suggestions
export const TIP_MESSAGES = [
  "This track is fire! 🔥",
  "Thanks for the inspiration!",
  "Can't stop listening to this",
  "Your work means a lot to me",
  "Keep creating! 💜",
  "This helped me through a tough time",
  "Amazing production quality",
  "You're so talented!",
  "More of this please!",
  "Instant save to my playlist",
]

// Mock data
const mockTips: Tip[] = [
  {
    id: "tip_001",
    senderId: "user_002",
    senderName: "MusicLover42",
    senderAvatar: "https://placehold.co/100x100/10b981/white?text=ML",
    recipientId: "user_001",
    recipientName: "DJ Neon",
    amount: 1000,
    currency: "USD",
    message: "This track is fire! 🔥",
    isAnonymous: false,
    isPublic: true,
    createdAt: "2026-02-13T14:30:00Z",
    status: "completed",
  },
  {
    id: "tip_002",
    senderId: "user_003",
    senderName: "BeatFan99",
    senderAvatar: "https://placehold.co/100x100/f59e0b/white?text=BF",
    recipientId: "user_001",
    recipientName: "DJ Neon",
    amount: 500,
    currency: "USD",
    message: "Keep creating! 💜",
    isAnonymous: false,
    isPublic: true,
    createdAt: "2026-02-12T09:15:00Z",
    status: "completed",
  },
  {
    id: "tip_003",
    senderId: "user_004",
    senderName: "Anonymous",
    senderAvatar: "",
    recipientId: "user_001",
    recipientName: "DJ Neon",
    amount: 2000,
    currency: "USD",
    message: "Your work means a lot to me",
    isAnonymous: true,
    isPublic: true,
    createdAt: "2026-02-10T18:45:00Z",
    status: "completed",
  },
]

const mockTopSupporters: TipperRanking[] = [
  {
    userId: "user_002",
    displayName: "MusicLover42",
    avatarUrl: "https://placehold.co/100x100/10b981/white?text=ML",
    totalTipped: 5000,
    tipCount: 12,
    streakMonths: 3,
    badge: "🥇 Top Fan",
  },
  {
    userId: "user_005",
    displayName: "RemixQueen",
    avatarUrl: "https://placehold.co/100x100/ec4899/white?text=RQ",
    totalTipped: 3200,
    tipCount: 8,
    streakMonths: 2,
    badge: "🥈 Supporter",
  },
  {
    userId: "user_006",
    displayName: "BassHead",
    avatarUrl: "https://placehold.co/100x100/3b82f6/white?text=BH",
    totalTipped: 1800,
    tipCount: 5,
    streakMonths: 1,
    badge: "🥉 Fan",
  },
]
