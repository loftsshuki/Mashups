"use client"

import { useState, useEffect } from "react"
import { Sparkles, TrendingUp, Zap, Users, Target, Gem, Flame } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { NeonHero, NeonPage } from "@/components/marketing/neon-page"
import {
  getRecommendations,
  getTrendingAnalysis,
  getRecommendationColor,
  getRecommendationIcon,
  type Recommendation,
  type RecommendationType,
} from "@/lib/data/recommendations"

const typeIcons: Record<RecommendationType, typeof Sparkles> = {
  trending: Flame,
  skill_building: Zap,
  compatible: Target,
  similar_creators: Users,
  daily_challenge: Target,
  undiscovered: Gem,
}

export default function FeedPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [trending, setTrending] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [recs, trendData] = await Promise.all([
          getRecommendations("current_user", {
            preferredGenres: ["Electronic", "Hip-Hop"],
            preferredBPM: { min: 120, max: 140 },
            favoriteCreators: [],
            recentActivity: [],
            skillLevel: "intermediate",
          }),
          getTrendingAnalysis(),
        ])
        setRecommendations(recs)
        setTrending(trendData)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <NeonPage>
      <NeonHero
        eyebrow="For You"
        title="Your Personalized Feed"
        description="AI-powered recommendations based on your taste, skill level, and what's trending now."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommended For You
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => {
                const Icon = typeIcons[rec.type]
                return (
                  <Card key={rec.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Left accent bar */}
                        <div className={"w-1 " + getRecommendationColor(rec.type).split(" ")[1]} />
                        
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{getRecommendationIcon(rec.type)}</span>
                                <Badge 
                                  variant="secondary" 
                                  className={getRecommendationColor(rec.type)}
                                >
                                  {rec.type.replace("_", " ")}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {rec.confidence}% match
                                </span>
                              </div>
                              
                              <h3 className="font-semibold text-lg">{rec.title}</h3>
                              <p className="text-muted-foreground mt-1">{rec.description}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                💡 {rec.reason}
                              </p>

                              <div className="flex flex-wrap gap-2 mt-4">
                                {rec.actions.map((action) => (
                                  <Link key={action.label} href={action.href}>
                                    <Button size="sm">
                                      {action.label}
                                    </Button>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar - Trending */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Trending Now
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <Skeleton className="h-20" />
              ) : (
                <>
                  <div>
                    <h4 className="text-sm font-medium mb-2">🔥 Hot Genres</h4>
                    <div className="space-y-2">
                      {trending?.trendingGenres.slice(0, 3).map((g: any) => (
                        <div key={g.genre} className="flex items-center justify-between text-sm">
                          <span>{g.genre}</span>
                          <Badge variant="secondary" className="text-green-600">
                            +{g.growth}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">📈 Rising Creators</h4>
                    <div className="space-y-2">
                      {trending?.risingCreators.slice(0, 2).map((c: any) => (
                        <div key={c.creatorId} className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground">
                              +{c.followerGrowth} followers
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">🎵 Viral Sounds</h4>
                    <div className="space-y-2">
                      {trending?.viralSounds.slice(0, 2).map((s: any) => (
                        <div key={s.trackId} className="text-sm">
                          <p className="font-medium">{s.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.artist} • {s.platform}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Daily Challenge Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Daily Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">Speed Demon</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create a mashup with only 150+ BPM tracks
              </p>
              <Link href="/battles/daily">
                <Button className="w-full mt-4" variant="secondary">
                  Accept Challenge
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </NeonPage>
  )
}
