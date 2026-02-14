"use client"

import { useEffect, useMemo, useState } from "react"
import { BadgeDollarSign, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Challenge {
  id: string
  title: string
  status: "active" | "upcoming" | "closed"
}

interface WinnerRow {
  challenge_id: string
  mashup_id: string
  creator_id: string | null
  prize_cents: number | null
  payout_status: "pending" | "paid" | "failed"
  sponsor_fulfillment_status: "pending" | "fulfilled"
  payout_reference: string | null
  selected_at: string
}

interface ChallengeOpsEventRow {
  id: string
  action: string
  payload: Record<string, unknown> | null
  created_at: string
}

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("")
  const [winners, setWinners] = useState<WinnerRow[]>([])
  const [events, setEvents] = useState<ChallengeOpsEventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [runningAction, setRunningAction] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [winnerMashupId, setWinnerMashupId] = useState("")
  const [winnerCreatorId, setWinnerCreatorId] = useState("")
  const [winnerPrizeDollars, setWinnerPrizeDollars] = useState("1000")
  const [payoutMashupId, setPayoutMashupId] = useState("")
  const [payoutStatus, setPayoutStatus] = useState<"pending" | "paid" | "failed">("paid")
  const [payoutReference, setPayoutReference] = useState("")
  const [fulfillmentMashupId, setFulfillmentMashupId] = useState("")
  const [fulfillmentStatus, setFulfillmentStatus] = useState<"pending" | "fulfilled">(
    "fulfilled",
  )

  const activeChallenge = useMemo(
    () => challenges.find((entry) => entry.id === selectedChallengeId) ?? null,
    [challenges, selectedChallengeId],
  )

  useEffect(() => {
    let cancelled = false

    async function loadChallenges() {
      setLoading(true)
      try {
        const response = await fetch("/api/challenges", { cache: "no-store" })
        const payload = (await response.json()) as { challenges?: Challenge[]; error?: string }
        if (!response.ok) {
          if (!cancelled) setError(payload.error ?? "Failed to load challenges.")
          return
        }

        const nextChallenges = payload.challenges ?? []
        if (!cancelled) {
          setChallenges(nextChallenges)
          if (nextChallenges.length > 0) {
            setSelectedChallengeId(nextChallenges[0]?.id ?? "")
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadChallenges()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!selectedChallengeId) return

    async function loadOps() {
      const response = await fetch(`/api/challenges/${selectedChallengeId}/ops`, {
        cache: "no-store",
      })
      const payload = (await response.json()) as {
        winners?: WinnerRow[]
        events?: ChallengeOpsEventRow[]
        error?: string
      }
      if (!response.ok) {
        if (!cancelled) setError(payload.error ?? "Failed to load challenge ops.")
        return
      }

      if (!cancelled) {
        setWinners(payload.winners ?? [])
        setEvents(payload.events ?? [])
      }
    }

    void loadOps()
    return () => {
      cancelled = true
    }
  }, [selectedChallengeId])

  async function runAction(action: "select_winner" | "mark_payout" | "mark_fulfillment") {
    if (!selectedChallengeId) return
    setRunningAction(action)
    setError(null)
    try {
      const body =
        action === "select_winner"
          ? {
              action,
              mashupId: winnerMashupId,
              creatorId: winnerCreatorId || undefined,
              prizeCents: Math.max(0, Math.round(Number(winnerPrizeDollars || "0") * 100)),
            }
          : action === "mark_payout"
            ? {
                action,
                mashupId: payoutMashupId,
                payoutStatus,
                payoutReference: payoutReference || undefined,
              }
            : {
                action,
                mashupId: fulfillmentMashupId,
                sponsorFulfillmentStatus: fulfillmentStatus,
              }

      const response = await fetch(`/api/challenges/${selectedChallengeId}/ops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(payload.error ?? "Action failed.")
        return
      }

      const refreshResponse = await fetch(`/api/challenges/${selectedChallengeId}/ops`, {
        cache: "no-store",
      })
      const refreshPayload = (await refreshResponse.json()) as {
        winners?: WinnerRow[]
        events?: ChallengeOpsEventRow[]
      }
      if (refreshResponse.ok) {
        setWinners(refreshPayload.winners ?? [])
        setEvents(refreshPayload.events ?? [])
      }
    } finally {
      setRunningAction(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <div className="mb-6 flex items-center gap-2">
        <Trophy className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Challenge Ops</h1>
      </div>
      <p className="mb-6 text-muted-foreground">
        Admin workflow for winner selection, payout status, and sponsor fulfillment.
      </p>

      {loading ? <p className="text-sm text-muted-foreground">Loading challenges...</p> : null}
      {error ? (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="mb-6 max-w-sm">
        <Label htmlFor="challenge">Challenge</Label>
        <Select value={selectedChallengeId} onValueChange={setSelectedChallengeId}>
          <SelectTrigger id="challenge" className="mt-1 rounded-xl">
            <SelectValue placeholder="Select challenge" />
          </SelectTrigger>
          <SelectContent>
            {challenges.map((challenge) => (
              <SelectItem key={challenge.id} value={challenge.id}>
                {challenge.title} ({challenge.status})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeChallenge ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">Select Winner</h2>
            <div className="mt-3 space-y-2">
              <Input
                placeholder="mashup_id"
                value={winnerMashupId}
                onChange={(event) => setWinnerMashupId(event.target.value)}
              />
              <Input
                placeholder="creator_id (optional)"
                value={winnerCreatorId}
                onChange={(event) => setWinnerCreatorId(event.target.value)}
              />
              <Input
                placeholder="Prize dollars"
                value={winnerPrizeDollars}
                onChange={(event) => setWinnerPrizeDollars(event.target.value)}
                inputMode="decimal"
              />
              <Button
                className="w-full rounded-full"
                onClick={() => runAction("select_winner")}
                disabled={runningAction === "select_winner" || !winnerMashupId}
              >
                {runningAction === "select_winner" ? "Saving..." : "Save Winner"}
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">Mark Payout</h2>
            <div className="mt-3 space-y-2">
              <Input
                placeholder="mashup_id"
                value={payoutMashupId}
                onChange={(event) => setPayoutMashupId(event.target.value)}
              />
              <Select value={payoutStatus} onValueChange={(value) => setPayoutStatus(value as typeof payoutStatus)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">pending</SelectItem>
                  <SelectItem value="paid">paid</SelectItem>
                  <SelectItem value="failed">failed</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Payout reference"
                value={payoutReference}
                onChange={(event) => setPayoutReference(event.target.value)}
              />
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => runAction("mark_payout")}
                disabled={runningAction === "mark_payout" || !payoutMashupId}
              >
                {runningAction === "mark_payout" ? "Saving..." : "Update Payout"}
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">Sponsor Fulfillment</h2>
            <div className="mt-3 space-y-2">
              <Input
                placeholder="mashup_id"
                value={fulfillmentMashupId}
                onChange={(event) => setFulfillmentMashupId(event.target.value)}
              />
              <Select
                value={fulfillmentStatus}
                onValueChange={(value) => setFulfillmentStatus(value as typeof fulfillmentStatus)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">pending</SelectItem>
                  <SelectItem value="fulfilled">fulfilled</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => runAction("mark_fulfillment")}
                disabled={runningAction === "mark_fulfillment" || !fulfillmentMashupId}
              >
                {runningAction === "mark_fulfillment" ? "Saving..." : "Update Fulfillment"}
              </Button>
            </div>
          </section>
        </div>
      ) : null}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Winners</h2>
        <div className="space-y-2">
          {winners.length > 0 ? (
            winners.map((winner) => (
              <div
                key={`${winner.challenge_id}:${winner.mashup_id}`}
                className="rounded-lg border border-border/60 bg-card px-4 py-3 text-sm"
              >
                <p className="font-medium text-foreground">
                  mashup: {winner.mashup_id} | payout: {winner.payout_status} | fulfillment:{" "}
                  {winner.sponsor_fulfillment_status}
                </p>
                <p className="text-xs text-muted-foreground">
                  prize: {winner.prize_cents ?? 0} cents | ref: {winner.payout_reference ?? "-"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No winners recorded yet.</p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-foreground">
          <BadgeDollarSign className="h-5 w-5 text-primary" />
          Ops Events
        </h2>
        <div className="space-y-2">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-border/60 bg-card px-4 py-3 text-xs text-muted-foreground"
              >
                <p className="font-medium text-foreground">
                  {event.action} | {new Date(event.created_at).toLocaleString()}
                </p>
                <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(event.payload ?? {}, null, 2)}
                </pre>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No ops events yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}
