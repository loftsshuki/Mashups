// Fan Subscriptions - Patreon-style creator membership system

export type SubscriptionTier = "basic" | "premium" | "vip"
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "paused"

export interface SubscriptionPlan {
  id: string
  creatorId: string
  creatorName: string
  creatorAvatar: string
  tier: SubscriptionTier
  name: string
  description: string
  price: number
  currency: string
  interval: "month" | "year"
  features: string[]
  discordRole?: string
  exclusiveContent: boolean
  earlyAccess: boolean
  directMessaging: boolean
  subscriberCount: number
  maxSubscribers?: number // Limited availability
  isPopular: boolean
  createdAt: string
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  startDate: string
  endDate?: string
  nextBillingDate: string
  totalPaid: number
  paymentMethod: {
    type: "card" | "paypal"
    last4?: string
    brand?: string
  }
  cancelAtPeriodEnd: boolean
}

export interface SubscriberBenefit {
  id: string
  title: string
  description: string
  type: "content" | "discord" | "download" | "event" | "merch"
  unlockedAt: string
  expiresAt?: string
}

// Default subscription tiers pricing
export const DEFAULT_TIER_PRICING: Record<SubscriptionTier, { price: number; yearlyDiscount: number }> = {
  basic: { price: 3, yearlyDiscount: 0.17 }, // $3/mo or $30/yr (17% off)
  premium: { price: 10, yearlyDiscount: 0.20 }, // $10/mo or $96/yr (20% off)
  vip: { price: 25, yearlyDiscount: 0.25 }, // $25/mo or $225/yr (25% off)
}

// Tier feature templates
export const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  basic: [
    "Exclusive subscriber badge",
    "Access to subscriber-only posts",
    "Early access to new mashups (24h)",
    "Discord community access",
  ],
  premium: [
    "Everything in Basic",
    "Early access to new mashups (1 week)",
    "Download stems & project files",
    "Monthly Q&A livestream",
    "Discord VIP channel",
    "Behind-the-scenes content",
  ],
  vip: [
    "Everything in Premium",
    "Early access to all content",
    "1-on-1 monthly video call",
    "Custom mashup request (1 per month)",
    "Producer feedback on your tracks",
    "Exclusive VIP Discord role",
    "Signed merch (annual subscribers)",
  ],
}

// Mock subscription plans
export const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: "plan_001_basic",
    creatorId: "user_001",
    creatorName: "DJ Neon",
    creatorAvatar: "https://placehold.co/100x100/7c3aed/white?text=DN",
    tier: "basic",
    name: "Supporter",
    description: "Support my work and get exclusive perks",
    price: 3,
    currency: "USD",
    interval: "month",
    features: TIER_FEATURES.basic,
    discordRole: "Subscriber",
    exclusiveContent: true,
    earlyAccess: true,
    directMessaging: false,
    subscriberCount: 245,
    isPopular: false,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "plan_001_premium",
    creatorId: "user_001",
    creatorName: "DJ Neon",
    creatorAvatar: "https://placehold.co/100x100/7c3aed/white?text=DN",
    tier: "premium",
    name: "Producer",
    description: "For aspiring producers who want to learn",
    price: 10,
    currency: "USD",
    interval: "month",
    features: TIER_FEATURES.premium,
    discordRole: "Producer",
    exclusiveContent: true,
    earlyAccess: true,
    directMessaging: false,
    subscriberCount: 89,
    isPopular: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "plan_001_vip",
    creatorId: "user_001",
    creatorName: "DJ Neon",
    creatorAvatar: "https://placehold.co/100x100/7c3aed/white?text=DN",
    tier: "vip",
    name: "Inner Circle",
    description: "Direct access and personalized mentorship",
    price: 25,
    currency: "USD",
    interval: "month",
    features: TIER_FEATURES.vip,
    discordRole: "VIP",
    exclusiveContent: true,
    earlyAccess: true,
    directMessaging: true,
    subscriberCount: 12,
    maxSubscribers: 20,
    isPopular: false,
    createdAt: "2026-01-01T00:00:00Z",
  },
]

// Mock user subscriptions
export const mockUserSubscriptions: Subscription[] = [
  {
    id: "sub_001",
    userId: "current_user",
    planId: "plan_001_premium",
    plan: mockSubscriptionPlans[1],
    status: "active",
    startDate: "2026-01-15T00:00:00Z",
    nextBillingDate: "2026-03-15T00:00:00Z",
    totalPaid: 20,
    paymentMethod: {
      type: "card",
      last4: "4242",
      brand: "visa",
    },
    cancelAtPeriodEnd: false,
  },
]

// Create subscription plan
export async function createSubscriptionPlan(
  creatorId: string,
  tier: SubscriptionTier,
  customPrice?: number,
  customFeatures?: string[]
): Promise<SubscriptionPlan> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const pricing = DEFAULT_TIER_PRICING[tier]
  const features = customFeatures || TIER_FEATURES[tier]
  
  return {
    id: `plan_${Date.now()}`,
    creatorId,
    creatorName: "", // Would fetch from profile
    creatorAvatar: "",
    tier,
    name: tier === "basic" ? "Supporter" : tier === "premium" ? "Producer" : "Inner Circle",
    description: "",
    price: customPrice || pricing.price,
    currency: "USD",
    interval: "month",
    features,
    exclusiveContent: tier !== "basic",
    earlyAccess: true,
    directMessaging: tier === "vip",
    subscriberCount: 0,
    isPopular: false,
    createdAt: new Date().toISOString(),
  }
}

// Subscribe to a plan
export async function subscribeToPlan(
  userId: string,
  planId: string,
  paymentMethod: { type: "card" | "paypal"; token: string }
): Promise<{ subscription: Subscription; success: boolean; error?: string }> {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const plan = mockSubscriptionPlans.find(p => p.id === planId)
  if (!plan) {
    return { subscription: null as unknown as Subscription, success: false, error: "Plan not found" }
  }
  
  // Check if plan is at capacity
  if (plan.maxSubscribers && plan.subscriberCount >= plan.maxSubscribers) {
    return { subscription: null as unknown as Subscription, success: false, error: "Plan is at capacity" }
  }
  
  const subscription: Subscription = {
    id: `sub_${Date.now()}`,
    userId,
    planId,
    plan,
    status: "active",
    startDate: new Date().toISOString(),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    totalPaid: plan.price,
    paymentMethod: {
      type: paymentMethod.type,
      last4: "4242",
      brand: "visa",
    },
    cancelAtPeriodEnd: false,
  }
  
  // Update subscriber count
  plan.subscriberCount++
  
  return { subscription, success: true }
}

// Cancel subscription
export async function cancelSubscription(
  subscriptionId: string,
  immediate: boolean = false
): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const sub = mockUserSubscriptions.find(s => s.id === subscriptionId)
  if (!sub) return false
  
  if (immediate) {
    sub.status = "cancelled"
    sub.endDate = new Date().toISOString()
    sub.plan.subscriberCount--
  } else {
    sub.cancelAtPeriodEnd = true
  }
  
  return true
}

// Get user's active subscriptions
export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  return mockUserSubscriptions.filter(s => s.userId === userId && s.status === "active")
}

// Get creator's subscribers
export async function getCreatorSubscribers(creatorId: string): Promise<{
  totalSubscribers: number
  monthlyRevenue: number
  subscribers: Subscription[]
}> {
  const plans = mockSubscriptionPlans.filter(p => p.creatorId === creatorId)
  const totalSubscribers = plans.reduce((sum, p) => sum + p.subscriberCount, 0)
  const monthlyRevenue = plans.reduce((sum, p) => sum + (p.price * p.subscriberCount), 0)
  
  return {
    totalSubscribers,
    monthlyRevenue,
    subscribers: [], // Would fetch actual subscriber list
  }
}

// Get creator's subscription plans
export async function getCreatorPlans(creatorId: string): Promise<SubscriptionPlan[]> {
  return mockSubscriptionPlans.filter(p => p.creatorId === creatorId)
}

// Check if user has active subscription to creator
export async function hasActiveSubscription(
  userId: string,
  creatorId: string
): Promise<{ hasSubscription: boolean; tier?: SubscriptionTier }> {
  const subs = await getUserSubscriptions(userId)
  const activeSub = subs.find(s => s.plan.creatorId === creatorId && s.status === "active")
  
  return {
    hasSubscription: !!activeSub,
    tier: activeSub?.plan.tier,
  }
}

// Get subscription benefits
export async function getSubscriberBenefits(
  subscriptionId: string
): Promise<SubscriberBenefit[]> {
  const benefits: SubscriberBenefit[] = [
    {
      id: "benefit_001",
      title: "Exclusive Mashup: Midnight Mix",
      description: "Subscriber-only extended version",
      type: "content",
      unlockedAt: "2026-02-01T00:00:00Z",
    },
    {
      id: "benefit_002",
      title: "Discord VIP Access",
      description: "Join the exclusive subscriber channel",
      type: "discord",
      unlockedAt: "2026-02-01T00:00:00Z",
    },
  ]
  
  return benefits
}

// Calculate creator earnings
export function calculateCreatorEarnings(subscriptions: Subscription[]): {
  monthlyRecurring: number
  annualRecurring: number
  totalSubscribers: number
  churnRate: number
  averageRevenuePerUser: number
} {
  const monthly = subscriptions
    .filter(s => s.plan.interval === "month")
    .reduce((sum, s) => sum + s.plan.price, 0)
  
  const annual = subscriptions
    .filter(s => s.plan.interval === "year")
    .reduce((sum, s) => sum + (s.plan.price / 12), 0)
  
  const total = subscriptions.length
  const arpu = total > 0 ? (monthly + annual) / total : 0
  
  return {
    monthlyRecurring: monthly + annual,
    annualRecurring: (monthly + annual) * 12,
    totalSubscribers: total,
    churnRate: 0.05, // Mock 5% churn
    averageRevenuePerUser: arpu,
  }
}

// Format subscription price
export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price)
}

// Get tier color
export function getTierColor(tier: SubscriptionTier): string {
  switch (tier) {
    case "basic": return "text-blue-500 bg-blue-500/10 border-blue-500/20"
    case "premium": return "text-purple-500 bg-purple-500/10 border-purple-500/20"
    case "vip": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
    default: return "text-gray-500 bg-gray-500/10"
  }
}

// Get tier badge
export function getTierBadge(tier: SubscriptionTier): string {
  switch (tier) {
    case "basic": return "🌟"
    case "premium": return "💎"
    case "vip": return "👑"
    default: return "⭐"
  }
}
