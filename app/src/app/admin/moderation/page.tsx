"use client"

import { useEffect, useState } from "react"
import { Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ClaimRow {
  id: string
  mashup_id: string
  claim_type: string
  claimant_contact: string
  status: "open" | "under_review" | "resolved" | "rejected"
  submitted_at: string
  mashup?: { id: string; title: string; creator_id: string } | null
}

export default function ModerationPage() {
  const [claims, setClaims] = useState<ClaimRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadClaims() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/admin/claims")
        const data = (await response.json()) as { claims?: ClaimRow[]; error?: string }
        if (!response.ok) {
          setError(data.error ?? "Failed to load claims")
          setClaims([])
        } else {
          setClaims(data.claims ?? [])
        }
      } catch {
        setError("Failed to load claims")
      } finally {
        setLoading(false)
      }
    }
    void loadClaims()
  }, [])

  async function moderateClaim(
    claim: ClaimRow,
    status: ClaimRow["status"],
    enforcementAction: "block" | "mute" | "geo_restrict" | "restore",
  ) {
    setActingId(claim.id)
    setError(null)
    try {
      const response = await fetch(`/api/admin/claims/${claim.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          resolution:
            status === "resolved"
              ? "Resolved through moderation review."
              : "Rejected by moderation review.",
          enforcementAction,
          strikeUserId: claim.mashup?.creator_id,
        }),
      })

      const data = (await response.json()) as { ok?: boolean; error?: string }
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Failed to apply moderation action")
        return
      }

      setClaims((prev) =>
        prev.map((item) =>
          item.id === claim.id
            ? { ...item, status }
            : item,
        ),
      )
    } catch {
      setError("Failed to apply moderation action")
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <div className="mb-6 flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Moderation</h1>
        <Button asChild variant="outline" size="sm" className="ml-auto rounded-full">
          <Link href="/admin/challenges">Challenge Ops</Link>
        </Button>
      </div>
      <p className="mb-6 text-muted-foreground">
        Claim triage and enforcement queue for copyright and rights incidents.
      </p>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading claims...</p>
      ) : claims.length === 0 ? (
        <div className="rounded-lg border border-border/50 bg-card px-4 py-6 text-sm text-muted-foreground">
          No claims available.
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <div key={claim.id} className="rounded-lg border border-border/50 bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {claim.mashup?.title ?? claim.mashup_id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Claim type: {claim.claim_type} | Status: {claim.status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {new Date(claim.submitted_at).toLocaleString()}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {claim.claimant_contact}
                </span>
              </div>

              {(claim.status === "open" || claim.status === "under_review") && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={actingId === claim.id}
                    onClick={() => moderateClaim(claim, "resolved", "restore")}
                  >
                    Resolve + Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actingId === claim.id}
                    onClick={() => moderateClaim(claim, "resolved", "block")}
                  >
                    Resolve + Block
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={actingId === claim.id}
                    onClick={() => moderateClaim(claim, "rejected", "mute")}
                  >
                    Reject + Strike
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
