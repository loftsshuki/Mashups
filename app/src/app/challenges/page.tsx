import Link from "next/link"
import { Clock3, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MashupCard } from "@/components/mashup-card"
import {
  NeonGrid,
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import { getChallengeEntries, mockChallenges } from "@/lib/data/challenges"

export default function ChallengesPage() {
  const active = mockChallenges.find((c) => c.status === "active")
  const entries = active ? getChallengeEntries(active.id) : []

  return (
    <NeonPage>
      <NeonHero
        eyebrow="Challenges"
        title="Weekly prompts to drive remix discovery."
        description="Challenge surfaces follow the same section parity as the homepage with hero, cards, and proof blocks."
      />

      <NeonSectionHeader
        title="Current and Upcoming"
        description="Launch recurring creator loops with clear deadlines and incentives."
      />
      <NeonGrid className="md:grid-cols-2">
        {mockChallenges.map((challenge) => (
          <div key={challenge.id} className="neon-panel rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{challenge.title}</h2>
              <Badge variant={challenge.status === "active" ? "default" : "secondary"}>
                {challenge.status}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{challenge.description}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              <span>Ends {new Date(challenge.endsAt).toLocaleDateString()}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">Prize: {challenge.prizeText}</p>
            {challenge.status === "active" ? (
              <div className="mt-3">
                <Button asChild size="sm" className="rounded-full">
                  <Link href={`/create?challenge=${challenge.id}`}>Submit Entry</Link>
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </NeonGrid>

      {active ? (
        <section className="mt-10">
          <NeonSectionHeader
            title={`Top Entries: ${active.title}`}
            description="Highest-performing entries in the current challenge window."
            action={
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Trophy className="h-3.5 w-3.5 text-primary" />
                Ranked by engagement
              </span>
            }
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {entries.map((mashup) => (
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
        </section>
      ) : null}
    </NeonPage>
  )
}

