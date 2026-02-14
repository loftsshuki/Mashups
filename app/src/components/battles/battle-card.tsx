"use client"

import Link from "next/link"
import { Trophy, Users, Clock, Gift, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Battle } from "@/lib/data/battles"
import { getBattleStatusDisplay } from "@/lib/data/battles"
import { CountdownCompact } from "./countdown-timer"

interface BattleCardProps {
  battle: Battle
  className?: string
  featured?: boolean
}

export function BattleCard({ battle, className, featured = false }: BattleCardProps) {
  const statusDisplay = getBattleStatusDisplay(battle.status)
  const isVoting = battle.status === "voting"
  const isActive = battle.status === "active"
  
  const deadline = isVoting ? battle.votingEnd : isActive ? battle.submissionEnd : battle.votingEnd
  
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-lg",
        featured && "border-primary/50 shadow-md",
        className
      )}
    >
      {/* Cover Image */}
      <div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-muted">
        {battle.coverUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${battle.coverUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge 
            className={cn(
              "font-medium",
              statusDisplay.bgColor,
              statusDisplay.color
            )}
          >
            {statusDisplay.label}
          </Badge>
        </div>
        
        {/* Prize Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="gap-1">
            <Gift className="h-3 w-3" />
            ${battle.prizePool}
          </Badge>
        </div>
        
        {/* Type Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="outline" className="text-xs">
            {battle.type === "1v1" ? "1v1 Duel" : "Tournament"}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">
              {battle.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {battle.description}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Theme Tag */}
        {battle.themeValue && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Theme:</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {battle.themeValue}
            </span>
          </div>
        )}
        
        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{battle.entries.length}/{battle.maxEntries} entries</span>
          </div>
          {battle.totalVotes > 0 && (
            <div className="flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" />
              <span>{battle.totalVotes.toLocaleString()} votes</span>
            </div>
          )}
        </div>
        
        {/* Countdown */}
        <div className="flex items-center gap-1 text-xs">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <CountdownCompact 
            targetDate={deadline}
            prefix={isVoting ? "Voting ends in" : isActive ? "Submissions close in" : "Ended"}
          />
        </div>
        
        {/* Action Button */}
        <Link href={`/battles/${battle.id}`}>
          <Button 
            className="w-full mt-2"
            variant={featured ? "default" : "outline"}
          >
            {isVoting ? "Vote Now" : isActive ? "Join Battle" : "View Results"}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

// Compact version for sidebars
export function BattleCardCompact({ battle }: { battle: Battle }) {
  const statusDisplay = getBattleStatusDisplay(battle.status)
  
  return (
    <Link href={`/battles/${battle.id}`}>
      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center shrink-0">
          <Trophy className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{battle.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant="secondary" 
              className={cn("text-[10px] px-1.5 py-0", statusDisplay.bgColor, statusDisplay.color)}
            >
              {statusDisplay.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              ${battle.prizePool}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
