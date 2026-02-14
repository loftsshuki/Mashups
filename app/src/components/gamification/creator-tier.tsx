"use client"

import { Star, TrendingUp, Award, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { 
  creatorTiers, 
  getTierForPoints, 
  getPointsToNextTier,
  calculateTierProgress,
  type UserGamification 
} from "@/lib/data/gamification"

interface CreatorTierCardProps {
  gamification: UserGamification
  className?: string
}

export function CreatorTierCard({ gamification, className }: CreatorTierCardProps) {
  const { currentPoints, currentTier, stats } = gamification
  const pointsToNext = getPointsToNextTier(currentPoints)
  const progress = calculateTierProgress(currentPoints)
  const nextTier = creatorTiers.find(t => t.level === currentTier.level + 1)
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Creator Tier</span>
          <Badge className={currentTier.color}>
            {currentTier.badge} {currentTier.name}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Tier Display */}
        <div className={cn(
          "relative overflow-hidden rounded-xl p-6 bg-gradient-to-br",
          currentTier.bgGradient
        )}>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-6xl">{currentTier.badge}</div>
              <div>
                <p className={cn("text-2xl font-bold", currentTier.color)}>
                  {currentTier.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Level {currentTier.level}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{currentPoints.toLocaleString()} XP</span>
                {nextTier && (
                  <span className="text-muted-foreground">
                    {nextTier.minPoints.toLocaleString()} XP for {nextTier.name}
                  </span>
                )}
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
              {pointsToNext > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  {pointsToNext.toLocaleString()} points to next tier
                </p>
              )}
            </div>
          </div>
          
          {/* Decorative background */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -left-8 -top-8 w-24 h-24 rounded-full bg-white/5 blur-xl" />
        </div>
        
        {/* Tier Benefits */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Current Benefits
          </h4>
          <ul className="space-y-2">
            {currentTier.benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-3 w-3 text-primary shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted text-center">
            <p className="text-2xl font-bold">{stats.totalMashups}</p>
            <p className="text-xs text-muted-foreground">Mashups</p>
          </div>
          <div className="p-3 rounded-lg bg-muted text-center">
            <p className="text-2xl font-bold">{(stats.totalPlays / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted-foreground">Total Plays</p>
          </div>
          <div className="p-3 rounded-lg bg-muted text-center">
            <p className="text-2xl font-bold">{stats.battleParticipations}</p>
            <p className="text-xs text-muted-foreground">Battles</p>
          </div>
          <div className="p-3 rounded-lg bg-muted text-center">
            <p className="text-2xl font-bold">{stats.followers}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Mini tier display for profile headers
export function TierBadge({ points }: { points: number }) {
  const tier = getTierForPoints(points)
  
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        "bg-gradient-to-r",
        tier.bgGradient
      )}
    >
      <span>{tier.badge}</span>
      <span className={tier.color}>{tier.name}</span>
    </div>
  )
}

// Tier progression timeline
export function TierProgression({ currentPoints }: { currentPoints: number }) {
  const currentTier = getTierForPoints(currentPoints)
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {creatorTiers.map((tier, index) => {
          const isActive = tier.level === currentTier.level
          const isCompleted = tier.level < currentTier.level
          
          return (
            <div key={tier.level} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                isActive && "ring-2 ring-primary ring-offset-2",
                isCompleted ? tier.bgColor : "bg-muted",
                isActive || isCompleted ? tier.color : "text-muted-foreground"
              )}>
                {tier.badge}
              </div>
              {index < creatorTiers.length - 1 && (
                <div className={cn(
                  "w-8 h-0.5 mx-1",
                  isCompleted ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        {creatorTiers.map(tier => (
          <span key={tier.level} className="w-8 text-center">
            {tier.minPoints}
          </span>
        ))}
      </div>
    </div>
  )
}

// Points breakdown
export function PointsBreakdown({ gamification }: { gamification: UserGamification }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Points Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {gamification.recentActivity.map((activity, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="font-medium text-sm">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="secondary" className="text-green-600">
                +{activity.points} XP
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
