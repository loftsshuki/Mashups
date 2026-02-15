"use client"

import { useState, useEffect } from "react"
import { Trophy, Flame, Clock, History, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BattleCard } from "@/components/battles/battle-card"
import {
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import {
  getActiveBattles,
  getUpcomingBattles,
  getCompletedBattles,
  type Battle,
} from "@/lib/data/battles"

export default function BattlesPage() {
  const [activeBattles, setActiveBattles] = useState<Battle[]>([])
  const [upcomingBattles, setUpcomingBattles] = useState<Battle[]>([])
  const [completedBattles, setCompletedBattles] = useState<Battle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")

  useEffect(() => {
    async function loadBattles() {
      setIsLoading(true)
      try {
        const [active, upcoming, completed] = await Promise.all([
          getActiveBattles(),
          getUpcomingBattles(),
          getCompletedBattles(),
        ])
        setActiveBattles(active)
        setUpcomingBattles(upcoming)
        setCompletedBattles(completed)
      } finally {
        setIsLoading(false)
      }
    }

    loadBattles()
  }, [])

  return (
    <NeonPage>
      <NeonHero
        eyebrow="Competitions"
        title="Mashup Battles"
        description="Enter competitions, vote for your favorites, and win prizes. Show the community what you've got!"
      />

      {/* Live Thunderdome Banner */}
      <section className="mb-8 rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 to-background p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase italic tracking-wider text-white">
                Thunderdome is Live
              </h2>
              <p className="text-sm text-zinc-400">
                Want real-time 1v1 action? Challenge producers in the live arena.
              </p>
            </div>
          </div>
          <Button variant="destructive" className="whitespace-nowrap rounded-full" asChild>
            <a href="/thunderdome">Enter Arena</a>
          </Button>
        </div>
      </section>

      {/* Create Battle CTA */}
      <section className="mb-8 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Host Your Own Battle</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Create a competition, set the rules, and watch the community compete.
            </p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Battle
          </Button>
        </div>
      </section>

      {/* Battles Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="active" className="gap-2">
            <Flame className="h-4 w-4" />
            <span className="hidden sm:inline">Active</span>
            {activeBattles.length > 0 && (
              <span className="ml-1 text-xs bg-primary/20 px-1.5 py-0.5 rounded-full">
                {activeBattles.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Upcoming</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Completed</span>
          </TabsTrigger>
        </TabsList>

        {/* Active Battles */}
        <TabsContent value="active" className="space-y-6">
          <NeonSectionHeader
            title="Active Battles"
            description="Join now or vote on submissions"
          />

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 rounded-lg" />
                </div>
              ))}
            </div>
          ) : activeBattles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeBattles.map((battle) => (
                <BattleCard
                  key={battle.id}
                  battle={battle}
                  featured={battle.status === "voting"}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl px-6 py-16 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No active battles</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back soon or browse upcoming battles.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Upcoming Battles */}
        <TabsContent value="upcoming" className="space-y-6">
          <NeonSectionHeader
            title="Upcoming Battles"
            description="Get ready for these upcoming competitions"
          />

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 rounded-lg" />
                </div>
              ))}
            </div>
          ) : upcomingBattles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingBattles.map((battle) => (
                <BattleCard key={battle.id} battle={battle} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl px-6 py-16 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No upcoming battles</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your own battle to get started!
              </p>
            </div>
          )}
        </TabsContent>

        {/* Completed Battles */}
        <TabsContent value="completed" className="space-y-6">
          <NeonSectionHeader
            title="Battle History"
            description="Past competitions and winners"
          />

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 rounded-lg" />
                </div>
              ))}
            </div>
          ) : completedBattles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedBattles.map((battle) => (
                <BattleCard key={battle.id} battle={battle} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl px-6 py-16 text-center">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No completed battles</p>
              <p className="text-sm text-muted-foreground mt-2">
                Battle history will appear here.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* How It Works */}
      <section className="mt-16">
        <NeonSectionHeader
          title="How Battles Work"
          description="Join the competition in 3 easy steps"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              title: "Join a Battle",
              description: "Browse active battles and submit your best mashup that fits the theme.",
            },
            {
              step: "2",
              title: "Vote Blind",
              description: "Listen to entries without seeing creator names. Vote for your favorites fairly.",
            },
            {
              step: "3",
              title: "Win Prizes",
              description: "Top entries win cash prizes, badges, and featured placement on the platform.",
            },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">{item.step}</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </NeonPage>
  )
}
