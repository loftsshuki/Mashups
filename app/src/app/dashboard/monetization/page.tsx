"use client"

import { useEffect, useState } from "react"
import { Wallet, BadgeDollarSign } from "lucide-react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { createClient } from "@/lib/supabase/client"
import { getEarningsLedgerForUser, getPayoutsForUser, summarizeEarnings } from "@/lib/data/earnings"
import type { EarningsLedgerEntry, Payout } from "@/lib/data/types"

function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100)
}

function MonetizationContent() {
  const [entries, setEntries] = useState<EarningsLedgerEntry[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const userId = user?.id ?? "mock-user"
        const [ledgerRows, payoutRows] = await Promise.all([
          getEarningsLedgerForUser(userId),
          getPayoutsForUser(userId),
        ])
        setEntries(ledgerRows)
        setPayouts(payoutRows)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-8 pb-24">Loading monetization dashboard...</div>
  }

  const summary = summarizeEarnings(entries)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Monetization</h1>
      <p className="mt-2 text-muted-foreground">
        Earnings ledger, available balance, and payout history.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Earnings</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{formatMoney(summary.total)}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <p className="text-xs text-muted-foreground">Available</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{formatMoney(summary.available)}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{formatMoney(summary.pending)}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-border/50 bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <BadgeDollarSign className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Ledger Entries</h2>
          </div>
          <div className="space-y-2">
            {entries.length > 0 ? (
              entries.map((entry) => (
                <div key={entry.id} className="rounded-md border border-border px-3 py-2 text-sm">
                  <p className="font-medium text-foreground">
                    {entry.source_type} | {formatMoney(entry.amount_cents, entry.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.status} | {new Date(entry.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No earnings yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-border/50 bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Payout History</h2>
          </div>
          <div className="space-y-2">
            {payouts.length > 0 ? (
              payouts.map((payout) => (
                <div key={payout.id} className="rounded-md border border-border px-3 py-2 text-sm">
                  <p className="font-medium text-foreground">{formatMoney(payout.amount_cents)}</p>
                  <p className="text-xs text-muted-foreground">
                    {payout.status} | Requested {new Date(payout.requested_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No payouts yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default function MonetizationPage() {
  return (
    <AuthGuard>
      <MonetizationContent />
    </AuthGuard>
  )
}
