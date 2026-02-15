import Link from "next/link"
import { ArrowLeft, Calendar, Users, Clock, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getPlatformChallenges, getPlatformChallengeById } from "@/lib/data/platform-challenges"
import { ChallengeWorkspace } from "@/components/challenges/challenge-workspace"
import { notFound } from "next/navigation"

export async function generateStaticParams() {
  const challenges = await getPlatformChallenges()
  return challenges.map((c) => ({ id: c.id }))
}

interface ChallengeDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ChallengeDetailPage({ params }: ChallengeDetailPageProps) {
  const { id } = await params
  const challenge = await getPlatformChallengeById(id)

  if (!challenge) {
    notFound()
  }

  const isActive = challenge.status === "active"
  const endsAt = challenge.ends_at ? new Date(challenge.ends_at) : null
  const timeRemaining = endsAt ? Math.max(0, endsAt.getTime() - Date.now()) : null
  const daysRemaining = timeRemaining ? Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)) : null

  // Convert challenge stem_ids to workspace format
  const workspaceStems = (challenge.stem_ids ?? []).map((stemId, i) => ({
    id: stemId,
    title: `Stem ${i + 1}`,
    instrument: "other",
  }))

  const typeLabels: Record<string, string> = {
    flip: "Flip Challenge",
    collision: "Collision",
    chain: "Chain Remix",
    roulette: "Roulette",
  }

  const typeColors: Record<string, string> = {
    flip: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    collision: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    chain: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    roulette: "bg-green-500/10 text-green-500 border-green-500/20",
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/challenges">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All Challenges
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge
            variant="outline"
            className={typeColors[challenge.type] ?? ""}
          >
            {typeLabels[challenge.type] ?? challenge.type}
          </Badge>
          {isActive ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              {challenge.status}
            </Badge>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {challenge.title}
        </h1>

        {challenge.description && (
          <p className="text-muted-foreground">{challenge.description}</p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {daysRemaining !== null && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
            </div>
          )}
          {challenge.max_entries && (
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Max {challenge.max_entries} entries
            </div>
          )}
          {challenge.starts_at && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Started {new Date(challenge.starts_at).toLocaleDateString()}
            </div>
          )}
        </div>

        {challenge.prize_description && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-200">{challenge.prize_description}</span>
          </div>
        )}
      </div>

      {/* Rules */}
      {challenge.rules && (
        <div className="mb-8 rounded-xl border border-border/50 bg-card/50 p-5">
          <h2 className="text-sm font-semibold text-foreground mb-2">Rules</h2>
          <div className="text-sm text-muted-foreground whitespace-pre-line">
            {JSON.stringify(challenge.rules, null, 2)}
          </div>
        </div>
      )}

      {/* Workspace */}
      {isActive && workspaceStems.length > 0 && (
        <ChallengeWorkspace
          challengeId={challenge.id}
          challengeTitle={challenge.title}
          stems={workspaceStems}
          className="mb-8"
        />
      )}

      {/* Enter CTA for active challenges without specific stems */}
      {isActive && workspaceStems.length === 0 && (
        <div className="mb-8">
          <Link href={`/create?challenge=${challenge.id}`}>
            <Button size="lg" className="w-full">
              <Trophy className="mr-2 h-5 w-5" />
              Enter This Challenge
            </Button>
          </Link>
        </div>
      )}

      {/* Entries placeholder */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          Entries
        </h2>
        <p className="text-sm text-muted-foreground">
          No entries yet. Be the first to create something!
        </p>
      </div>
    </div>
  )
}
