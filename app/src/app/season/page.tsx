import { Sparkles, Calendar, Trophy, Music, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentSeason, getSeasons } from "@/lib/data/seasons"
import { CollectiveProgress } from "@/components/season/collective-progress"
import Link from "next/link"

export default async function SeasonPage() {
  const season = await getCurrentSeason()
  const allSeasons = await getSeasons()
  const pastSeasons = allSeasons.filter((s) => s.status === "completed")
  const upcomingSeasons = allSeasons.filter((s) => s.status === "upcoming")

  if (!season) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">No Active Season</h1>
        <p className="text-muted-foreground">Check back soon for the next creative season.</p>
      </div>
    )
  }

  const daysRemaining = season.ends_at
    ? Math.max(0, Math.ceil((new Date(season.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Season Hero */}
      <div className="mb-10 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-background p-8 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <p className="text-xs font-medium text-primary uppercase tracking-wider">
          Season {season.id.slice(-1)} — {season.theme}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {season.name}
        </h1>
        {season.description && (
          <p className="text-muted-foreground max-w-md mx-auto">{season.description}</p>
        )}
        {daysRemaining !== null && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{daysRemaining} days remaining</span>
          </div>
        )}
      </div>

      {/* Collective Progress */}
      {season.collective_goal && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-foreground mb-3">Community Goal</h2>
          <CollectiveProgress
            current={season.current_count}
            goal={season.collective_goal}
            label="Mashups created this season"
          />
        </div>
      )}

      {/* Season Stem Pack */}
      {season.stem_pack_ids.length > 0 && (
        <div className="mb-10 rounded-xl border border-border/70 bg-card/50 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Season Stem Pack</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {season.stem_pack_ids.length} exclusive stem pack{season.stem_pack_ids.length !== 1 ? "s" : ""} curated for this season.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/crates">
              Browse Stems
              <ArrowRight className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </div>
      )}

      {/* Top Contributors Placeholder */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-foreground">Top Contributors</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: "BeatAlchemist", mashups: 47 },
            { name: "SynthWitch", mashups: 39 },
            { name: "NeonDreamer", mashups: 34 },
          ].map((contributor, i) => (
            <div
              key={contributor.name}
              className="rounded-lg border border-border/50 bg-card/50 p-3 text-center space-y-1"
            >
              <div className="text-lg font-bold text-foreground">#{i + 1}</div>
              <p className="text-xs font-medium text-foreground truncate">{contributor.name}</p>
              <p className="text-[10px] text-muted-foreground">{contributor.mashups} mashups</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-center space-y-2">
        <p className="text-sm font-medium text-foreground">Ready to contribute?</p>
        <p className="text-xs text-muted-foreground">
          Create a mashup this season and help reach the community goal.
        </p>
        <Button size="sm" asChild>
          <Link href="/create">
            Start Creating
            <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </div>

      {/* Upcoming Seasons */}
      {upcomingSeasons.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-foreground mb-3">Coming Up</h2>
          <div className="space-y-2">
            {upcomingSeasons.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.theme}</p>
                </div>
                {s.starts_at && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(s.starts_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Seasons */}
      {pastSeasons.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-foreground mb-3">Past Seasons</h2>
          <div className="space-y-2">
            {pastSeasons.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-card/30 px-4 py-3 opacity-70">
                <div>
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.theme}</p>
                </div>
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
