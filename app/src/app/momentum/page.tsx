import { Flame, TrendingUp } from "lucide-react"

import { MashupCard } from "@/components/mashup-card"
import {
  NeonGrid,
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import { getMomentumFeed } from "@/lib/data/momentum-feed"

export default async function MomentumPage() {
  const ranked = await getMomentumFeed(16)
  const rising = ranked.slice(0, 8)
  const sponsoredEligible = ranked.filter((mashup) => mashup.sponsoredEligible)

  return (
    <NeonPage>
      <NeonHero
        eyebrow="Momentum Feed"
        title="Rising tracks first, not legacy popularity."
        description="Tracks are ranked by engagement velocity and freshness. Sponsored feature slots require quality threshold passing."
      />

      <section className="neon-panel mb-6 rounded-2xl p-4">
        <NeonSectionHeader
          title="Feed Health"
          description="Algorithm emphasizes growth speed, recency, and interaction density."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Rising tracks</p>
            <p className="text-lg font-semibold text-foreground">{rising.length}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Sponsored eligible</p>
            <p className="text-lg font-semibold text-foreground">{sponsoredEligible.length}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Quality threshold</p>
            <p className="text-lg font-semibold text-foreground">65+</p>
          </div>
        </div>
      </section>

      <NeonSectionHeader
        title="Rising Now"
        description="Engagement-weighted ranking for the last growth window."
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rising.map((mashup) => (
          <MashupCard
            key={mashup.id}
            id={mashup.id}
            title={mashup.title}
            coverUrl={mashup.coverUrl}
            audioUrl={mashup.audioUrl}
            genre={mashup.genre}
            duration={mashup.duration}
            playCount={mashup.playCount}
            creator={mashup.creator}
          />
        ))}
      </div>

      <section className="mt-8">
        <NeonSectionHeader
          title="Sponsor Slots"
          description="Pay-to-feature requests pass a viral readiness quality gate before entering the queue."
          action={
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="h-3.5 w-3.5 text-primary" />
              Quality-gated promotion
            </span>
          }
        />
        <NeonGrid className="md:grid-cols-2">
          {sponsoredEligible.slice(0, 4).map((mashup) => (
            <div key={mashup.id} className="neon-panel rounded-2xl p-4">
              <p className="text-sm font-semibold text-foreground">{mashup.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {mashup.creator.displayName} | momentum {(mashup.momentumScore / 1000).toFixed(1)}k
              </p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                <TrendingUp className="h-3.5 w-3.5" />
                Eligible for sponsored slot review
              </p>
            </div>
          ))}
        </NeonGrid>
      </section>
    </NeonPage>
  )
}
