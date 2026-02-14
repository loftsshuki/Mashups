"use client"

import { useState } from "react"
import { Lock, Check, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  badges, 
  getRarityColor, 
  getRarityBg,
  type Badge as BadgeType 
} from "@/lib/data/gamification"

interface BadgeShowcaseProps {
  unlockedBadges: BadgeType[]
  className?: string
}

export function BadgeShowcase({ unlockedBadges, className }: BadgeShowcaseProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null)
  
  const allBadges = Object.values(badges)
  const unlockedIds = new Set(unlockedBadges.map(b => b.id))
  
  const unlocked = allBadges.filter(b => unlockedIds.has(b.id))
  const locked = allBadges.filter(b => !unlockedIds.has(b.id))
  
  const shareBadge = (badge: BadgeType) => {
    // Mock share functionality
    console.log(`Sharing badge: ${badge.name}`)
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Badge Collection</span>
          <Badge variant="secondary">
            {unlocked.length}/{allBadges.length} Unlocked
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="unlocked" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unlocked">
              Unlocked ({unlocked.length})
            </TabsTrigger>
            <TabsTrigger value="locked">
              Locked ({locked.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="unlocked" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {unlocked.map((badge) => {
                const Icon = badge.icon
                const userBadge = unlockedBadges.find(b => b.id === badge.id)
                
                return (
                  <Dialog key={badge.id}>
                    <DialogTrigger asChild>
                      <button
                        className={cn(
                          "relative p-4 rounded-xl border-2 transition-all hover:scale-105",
                          "flex flex-col items-center gap-2 text-center",
                          getRarityBg(badge.rarity),
                          getRarityColor(badge.rarity)
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center",
                          badge.bgColor
                        )}>
                          <Icon className={cn("h-6 w-6", badge.color)} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{badge.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {badge.rarity}
                          </p>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            badge.bgColor
                          )}>
                            <Icon className={cn("h-5 w-5", badge.color)} />
                          </div>
                          {badge.name}
                        </DialogTitle>
                        <DialogDescription>
                          {badge.description}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium">Rarity</p>
                          <p className={cn("text-sm capitalize", badge.color)}>
                            {badge.rarity}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">How to Unlock</p>
                          <p className="text-sm text-muted-foreground">
                            {badge.requirements}
                          </p>
                        </div>
                        {userBadge?.unlockedAt && (
                          <div>
                            <p className="text-sm font-medium">Unlocked On</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(userBadge.unlockedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        <Button 
                          className="w-full"
                          variant="outline"
                          onClick={() => shareBadge(badge)}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share Badge
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="locked" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {locked.map((badge) => {
                const Icon = badge.icon
                
                return (
                  <Dialog key={badge.id}>
                    <DialogTrigger asChild>
                      <button
                        className={cn(
                          "relative p-4 rounded-xl border-2 border-muted",
                          "flex flex-col items-center gap-2 text-center",
                          "opacity-60 hover:opacity-80 transition-all"
                        )}
                      >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-muted">
                          <Icon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-muted-foreground">
                            {badge.name}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {badge.rarity}
                          </p>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <span className="text-muted-foreground">{badge.name}</span>
                        </DialogTitle>
                        <DialogDescription>
                          {badge.description}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium">Rarity</p>
                          <p className={cn("text-sm capitalize", badge.color)}>
                            {badge.rarity}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">How to Unlock</p>
                          <p className="text-sm text-muted-foreground">
                            {badge.requirements}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground">
                            Complete the requirement to unlock this badge!
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Compact badge display for profile cards
export function BadgeCompact({ badge }: { badge: BadgeType }) {
  const Icon = badge.icon
  
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        badge.bgColor,
        badge.color
      )}
      title={badge.description}
    >
      <Icon className="h-3 w-3" />
      {badge.name}
    </div>
  )
}

// Badge row for minimal display
export function BadgeRow({ badges: userBadges }: { badges: BadgeType[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {userBadges.slice(0, 5).map((badge) => {
        const Icon = badge.icon
        return (
          <div
            key={badge.id}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              badge.bgColor
            )}
            title={badge.name}
          >
            <Icon className={cn("h-4 w-4", badge.color)} />
          </div>
        )
      })}
      {userBadges.length > 5 && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-xs font-medium">
          +{userBadges.length - 5}
        </div>
      )}
    </div>
  )
}
