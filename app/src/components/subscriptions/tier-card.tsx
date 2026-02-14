"use client"

import { Check, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  formatPrice,
  getTierColor,
  getTierBadge,
  type SubscriptionPlan,
  type SubscriptionTier,
} from "@/lib/data/subscriptions"

interface TierCardProps {
  plan: SubscriptionPlan
  isPopular?: boolean
  currentTier?: SubscriptionTier
  onSubscribe: (planId: string) => void
  className?: string
}

export function TierCard({
  plan,
  isPopular,
  currentTier,
  onSubscribe,
  className,
}: TierCardProps) {
  const isCurrentPlan = currentTier === plan.tier
  const isUpgrade = currentTier && getTierValue(plan.tier) > getTierValue(currentTier)
  const isDowngrade = currentTier && getTierValue(plan.tier) < getTierValue(currentTier)
  
  const atCapacity = !!(plan.maxSubscribers && plan.subscriberCount >= plan.maxSubscribers)
  
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-lg",
        isPopular && "border-primary shadow-md scale-105",
        className
      )}
    >
      {/* Popular Badge */}
      {(isPopular || plan.isPopular) && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
          Most Popular
        </div>
      )}
      
      {/* Limited Availability Badge */}
      {plan.maxSubscribers && (
        <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-br-lg">
          {plan.maxSubscribers - plan.subscriberCount} spots left
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{getTierBadge(plan.tier)}</span>
          <Badge className={cn("capitalize", getTierColor(plan.tier))}>
            {plan.tier}
          </Badge>
        </div>
        <h3 className="text-xl font-bold">{plan.name}</h3>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Price */}
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">
              {formatPrice(plan.price, plan.currency)}
            </span>
            <span className="text-muted-foreground">/{plan.interval}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            or {formatPrice(plan.price * 10, plan.currency)}/year (save 17%)
          </p>
        </div>
        
        {/* Subscriber Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{plan.subscriberCount} subscribers</span>
        </div>
        
        {/* Features */}
        <ul className="space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        {/* Discord Integration */}
        {plan.discordRole && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#5865F2]/10 text-[#5865F2]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            <span className="text-sm font-medium">{plan.discordRole} Discord role</span>
          </div>
        )}
        
        {/* Subscribe Button */}
        <Button
          className="w-full"
          size="lg"
          variant={isCurrentPlan ? "outline" : "default"}
          disabled={isCurrentPlan || atCapacity}
          onClick={() => onSubscribe(plan.id)}
        >
          {atCapacity ? (
            "Sold Out"
          ) : isCurrentPlan ? (
            "Current Plan"
          ) : isUpgrade ? (
            "Upgrade"
          ) : isDowngrade ? (
            "Downgrade"
          ) : (
            "Subscribe"
          )}
        </Button>
        
        {atCapacity && (
          <p className="text-xs text-center text-muted-foreground">
            This tier is at capacity. Check back later!
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function getTierValue(tier: SubscriptionTier): number {
  const values: Record<SubscriptionTier, number> = {
    basic: 1,
    premium: 2,
    vip: 3,
  }
  return values[tier]
}

// Compact tier badge for profile headers
export function TierBadge({ tier }: { tier: SubscriptionTier }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
      getTierColor(tier)
    )}>
      {getTierBadge(tier)}
      <span className="capitalize">{tier}</span>
    </span>
  )
}

// Subscription status indicator
export function SubscriptionStatus({
  status,
  nextBilling,
}: {
  status: string
  nextBilling?: string
}) {
  const statusColors: Record<string, string> = {
    active: "text-green-500 bg-green-500/10",
    cancelled: "text-red-500 bg-red-500/10",
    expired: "text-gray-500 bg-gray-500/10",
    paused: "text-yellow-500 bg-yellow-500/10",
  }
  
  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm", statusColors[status] || statusColors.expired)}>
      <span className="capitalize">{status}</span>
      {nextBilling && status === "active" && (
        <span className="text-muted-foreground">
          • Renews {new Date(nextBilling).toLocaleDateString()}
        </span>
      )}
    </div>
  )
}
