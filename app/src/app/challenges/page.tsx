import { Trophy, Clock3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MashupCard } from "@/components/mashup-card"
import { mockChallenges, getChallengeEntries } from "@/lib/data/challenges"

export default function ChallengesPage() {
  const active = mockChallenges.find((c) => c.status === "active")
  const entries = active ? getChallengeEntries(active.id) : []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <Trophy className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Challenges</h1>
          <p className="text-sm text-muted-foreground">Weekly prompts to drive remix discovery.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mockChallenges.map((challenge) => (
          <div key={challenge.id} className="rounded-lg border border-border/50 bg-card p-4">
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
            {challenge.status === "active" && (
              <div className="mt-3">
                <Button asChild size="sm">
                  <Link href={`/create?challenge=${challenge.id}`}>Submit Entry</Link>
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {active && (
        <section className="mt-10">
          <h3 className="mb-4 text-xl font-semibold text-foreground">Top Entries: {active.title}</h3>
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
      )}
    </div>
  )
}
