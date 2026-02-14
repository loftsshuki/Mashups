
"use client"

import { NeonPage, NeonSectionHeader } from "@/components/marketing/neon-page"
import { DailyChallengeHero } from "@/components/daily/daily-challenge"
import { DailyLeaderboard } from "@/components/daily/daily-leaderboard"

export default function DailyFlipPage() {
    return (
        <NeonPage>
            <div className="space-y-12">
                <DailyChallengeHero />

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <NeonSectionHeader
                            title="Today's Leaderboard"
                            description="Top flips ranked by the community. Voting closes in 5 hours."
                        />
                        <DailyLeaderboard />
                    </div>

                    <div className="space-y-8">
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h3 className="mb-2 text-lg font-semibold">Your Streak</h3>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold text-primary">12</span>
                                <span className="mb-1 text-sm text-muted-foreground">days</span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Keep flipping to unlock the "Consistent Creator" badge.
                            </p>

                            <div className="mt-4 flex justify-between gap-1">
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-2 flex-1 rounded-full ${i < 5 ? "bg-primary" : "bg-muted"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-6">
                            <h3 className="mb-4 text-lg font-semibold">Previous Winners</h3>
                            <div className="space-y-4">
                                {[
                                    { day: "Day 41", track: "Retro Funk", user: "@funky_cat" },
                                    { day: "Day 40", track: "Cyber Punk", user: "@neon_rider" },
                                    { day: "Day 39", track: "Jazz Hop", user: "@chill_beats" },
                                ].map((winner) => (
                                    <div key={winner.day} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">{winner.track}</p>
                                            <p className="text-xs text-muted-foreground">{winner.day}</p>
                                        </div>
                                        <span className="text-xs font-semibold text-primary">
                                            {winner.user}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </NeonPage>
    )
}
