"use client"

import { useState } from "react"
import { Crown, Heart, TrendingUp, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TierCard } from "@/components/subscriptions/tier-card"
import {
  mockSubscriptionPlans,
  getUserSubscriptions,
  subscribeToPlan,
  type SubscriptionPlan,
} from "@/lib/data/subscriptions"
import { TipButton } from "@/components/monetization/tip-button"

// Mock creators with subscription plans
const MOCK_CREATORS = [
  {
    id: "user_001",
    name: "DJ Neon",
    avatar: "https://placehold.co/100x100/7c3aed/white?text=DN",
    bio: "Electronic music producer & remix artist",
    subscriberCount: 346,
    monthlyRevenue: 2840,
    plans: mockSubscriptionPlans,
  },
  {
    id: "user_007",
    name: "BeatMaster Pro",
    avatar: "https://placehold.co/100x100/10b981/white?text=BM",
    bio: "Hip-hop beats & trap instrumentals",
    subscriberCount: 128,
    monthlyRevenue: 890,
    plans: [
      { ...mockSubscriptionPlans[0], id: "plan_007_basic", creatorId: "user_007", subscriberCount: 89 },
      { ...mockSubscriptionPlans[1], id: "plan_007_premium", creatorId: "user_007", subscriberCount: 35 },
    ],
  },
  {
    id: "user_008",
    name: "SynthWave Queen",
    avatar: "https://placehold.co/100x100/ec4899/white?text=SW",
    bio: "Retro synthwave & 80s nostalgia",
    subscriberCount: 520,
    monthlyRevenue: 4200,
    plans: [
      { ...mockSubscriptionPlans[0], id: "plan_008_basic", creatorId: "user_008", subscriberCount: 380 },
      { ...mockSubscriptionPlans[1], id: "plan_008_premium", creatorId: "user_008", subscriberCount: 120, isPopular: true },
      { ...mockSubscriptionPlans[2], id: "plan_008_vip", creatorId: "user_008", subscriberCount: 20, maxSubscribers: 25 },
    ],
  },
]

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("discover")
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null)

  const filteredCreators = MOCK_CREATORS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.bio.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubscribe = async (planId: string) => {
    const result = await subscribeToPlan("current_user", planId, {
      type: "card",
      token: "mock_token",
    })
    if (result.success) {
      alert("Subscribed successfully!")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Crown className="h-8 w-8 text-yellow-500" />
                Creator Subscriptions
              </h1>
              <p className="text-muted-foreground mt-1">
                Support your favorite creators and unlock exclusive content
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Active subs</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-right">
                <p className="text-2xl font-bold">$23</p>
                <p className="text-sm text-muted-foreground">Monthly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="discover">
              <TrendingUp className="h-4 w-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="following">
              <Heart className="h-4 w-4 mr-2" />
              Following
            </TabsTrigger>
            <TabsTrigger value="manage">
              <Crown className="h-4 w-4 mr-2" />
              My Subscriptions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-8">
            {/* Search */}
            <div className="max-w-md">
              <Input
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Creators Grid */}
            <div className="grid gap-8">
              {filteredCreators.map((creator) => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  onSubscribe={handleSubscribe}
                  isSelected={selectedCreator === creator.id}
                  onSelect={() => setSelectedCreator(
                    selectedCreator === creator.id ? null : creator.id
                  )}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="following">
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No subscriptions yet</h3>
              <p className="text-muted-foreground">
                Subscribe to creators to see them here
              </p>
              <Button
                className="mt-4"
                onClick={() => setActiveTab("discover")}
              >
                Discover Creators
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manage">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold mb-4">Active Subscriptions</h2>
              <div className="space-y-4">
                <SubscriptionRow
                  creator={MOCK_CREATORS[0]}
                  tier="premium"
                  price={10}
                  nextBilling="2026-03-15"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface CreatorCardProps {
  creator: typeof MOCK_CREATORS[0]
  onSubscribe: (planId: string) => void
  isSelected: boolean
  onSelect: () => void
}

function CreatorCard({ creator, onSubscribe, isSelected, onSelect }: CreatorCardProps) {
  return (
    <div className={cn(
      "rounded-xl border bg-card overflow-hidden transition-all",
      isSelected && "ring-2 ring-primary"
    )}>
      {/* Creator Header */}
      <div className="p-6 flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={creator.avatar} />
          <AvatarFallback>{creator.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">{creator.name}</h3>
            <Badge variant="secondary">
              <Users className="h-3 w-3 mr-1" />
              {creator.subscriberCount}
            </Badge>
          </div>
          <p className="text-muted-foreground">{creator.bio}</p>
          <div className="flex items-center gap-4 mt-2">
            <TipButton
              recipientId={creator.id}
              recipientName={creator.name}
              recipientAvatar={creator.avatar}
              variant="compact"
              showLabel={false}
            />
            <Button variant="link" className="h-auto p-0" onClick={onSelect}>
              {isSelected ? "Hide tiers" : "View tiers"}
            </Button>
          </div>
        </div>
      </div>

      {/* Subscription Tiers */}
      {isSelected && (
        <div className="px-6 pb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {creator.plans.map((plan) => (
              <TierCard
                key={plan.id}
                plan={plan}
                isPopular={plan.isPopular}
                onSubscribe={onSubscribe}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface SubscriptionRowProps {
  creator: typeof MOCK_CREATORS[0]
  tier: string
  price: number
  nextBilling: string
}

function SubscriptionRow({ creator, tier, price, nextBilling }: SubscriptionRowProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={creator.avatar} />
          <AvatarFallback>{creator.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{creator.name}</p>
          <p className="text-sm text-muted-foreground">
            {tier.charAt(0).toUpperCase() + tier.slice(1)} • ${price}/month
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-muted-foreground">Next billing</p>
        <p className="font-medium">{new Date(nextBilling).toLocaleDateString()}</p>
      </div>
    </div>
  )
}
