"use client"

import { useEffect, useState } from "react"
import { FileCheck2, ShieldAlert } from "lucide-react"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import {
  NeonGrid,
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import { createClient } from "@/lib/supabase/client"
import { getClaimsForUser, getRightsDeclarationsForUser } from "@/lib/data/rights"
import type { RightsClaim, RightsDeclaration } from "@/lib/data/types"

function RightsContent() {
  const [declarations, setDeclarations] = useState<RightsDeclaration[]>([])
  const [claims, setClaims] = useState<RightsClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [mutatingClaimId, setMutatingClaimId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const userId = user?.id ?? "mock-user"
        const [d, c] = await Promise.all([
          getRightsDeclarationsForUser(userId),
          getClaimsForUser(userId),
        ])
        setDeclarations(d)
        setClaims(c)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  async function updateClaim(claimId: string, status: RightsClaim["status"]) {
    setMutatingClaimId(claimId)
    try {
      const response = await fetch(`/api/rights/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          resolution:
            status === "resolved"
              ? "Resolved by creator rights review."
              : "Rejected after rights verification.",
        }),
      })
      if (response.ok) {
        setClaims((prev) =>
          prev.map((claim) =>
            claim.id === claimId
              ? {
                  ...claim,
                  status,
                  resolved_at: new Date().toISOString(),
                }
              : claim,
          ),
        )
      }
    } finally {
      setMutatingClaimId(null)
    }
  }

  if (loading) {
    return <NeonPage className="max-w-6xl">Loading rights dashboard...</NeonPage>
  }

  return (
    <NeonPage className="max-w-6xl">
      <NeonHero
        eyebrow="Rights Ops"
        title="Track declarations, claim status, and policy exposure."
        description="Rights surfaces are now sectioned in the same style language as the homepage and pricing pages."
      />

      <NeonSectionHeader title="Rights Queue" />
      <NeonGrid className="md:grid-cols-2">
        <section className="rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Rights Declarations</h2>
          </div>
          <div className="space-y-2">
            {declarations.length > 0 ? (
              declarations.map((d) => (
                <div
                  key={d.id}
                  className="rounded-xl border border-border/70 bg-background/50 px-3 py-2 text-sm"
                >
                  <p className="font-medium text-foreground">
                    Mashup: {d.mashup_id} | Mode: {d.mode}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Status: {d.status} | Version: {d.attestation_version}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No declarations found.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Claims Queue</h2>
          </div>
          <div className="space-y-2">
            {claims.length > 0 ? (
              claims.map((claim) => (
                <div
                  key={claim.id}
                  className="rounded-xl border border-border/70 bg-background/50 px-3 py-2 text-sm"
                >
                  <p className="font-medium text-foreground">
                    Mashup: {claim.mashup_id} | Type: {claim.claim_type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Status: {claim.status} | Submitted:{" "}
                    {new Date(claim.submitted_at).toLocaleString()}
                  </p>
                  {claim.status === "open" || claim.status === "under_review" ? (
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={mutatingClaimId === claim.id}
                        onClick={() => updateClaim(claim.id, "rejected")}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-full"
                        disabled={mutatingClaimId === claim.id}
                        onClick={() => updateClaim(claim.id, "resolved")}
                      >
                        Resolve
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No claims in queue.</p>
            )}
          </div>
        </section>
      </NeonGrid>
    </NeonPage>
  )
}

export default function RightsDashboardPage() {
  return (
    <AuthGuard>
      <RightsContent />
    </AuthGuard>
  )
}

