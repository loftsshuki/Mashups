"use client"

import Link from "next/link"
import { useState } from "react"
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
import {
  getChallengeCadenceLabel,
  getChallengeEntries,
  getOpenChallengeCount,
  mockChallenges,
} from "@/lib/data/challenges"
import { mockMashups } from "@/lib/mock-data"

export default function ChallengesPage() {
  const [joiningChallengeId, setJoiningChallengeId] = useState<string | null>(null)
  const [joinedChallengeId, setJoinedChallengeId] = useState<string | null>(null)
  const active = mockChallenges.find((c) => c.status === "active")
  const entries = active ? getChallengeEntries(active.id) : []
  const openChallengeCount = getOpenChallengeCount()

  async function joinChallenge(challengeId: string) {
    setJoiningChallengeId(challengeId)
    try {
      const fallbackMashup = mockMashups[0]?.id ?? "mash-001"
      const response = await fetch("/api/challenges/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId,
          mashupId: fallbackMashup,
        }),
      })
      if (response.ok) {
        setJoinedChallengeId(challengeId)
        setTimeout(() => setJoinedChallengeId((prev) => (prev === challengeId ? null : prev)), 2500)
      }
    } finally {
      setJoiningChallengeId(null)
    }
  }

  return (
    <NeonPage>
      <NeonHero
        eyebrow="Challenges"
        title="High-frequency challenge engine with real prizes."
        description="Launch recurring creator loops with sponsor cash, brand packages, and rapid themed rounds."
        aside={
          <>
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Open Challenges
            </p>
            <p className="mt-2 text-3xl font-semibold">{openChallengeCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Rolling cadence across daily, 2x weekly, and weekly formats.
            </p>
          </>
        }
      />

      <NeonSectionHeader
        title="Current and Upcoming"
        description="Each challenge includes cadence, sponsor visibility, and one-click entry."
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
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="outline">{getChallengeCadenceLabel(challenge.frequency)}</Badge>
              <Badge variant="outline">{challenge.rewardType}</Badge>
              {challenge.sponsor ? <Badge variant="secondary">Sponsored by {challenge.sponsor}</Badge> : null}
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">Prize: {challenge.prizeText}</p>
            {challenge.status === "active" ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm" className="rounded-full">
                  <Link href={`/create?challenge=${challenge.id}`}>Submit Entry</Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => joinChallenge(challenge.id)}
                  disabled={joiningChallengeId === challenge.id}
                >
                  {joiningChallengeId === challenge.id
                    ? "Joining..."
                    : joinedChallengeId === challenge.id
                      ? "Joined"
                      : "Join Challenge"}
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
