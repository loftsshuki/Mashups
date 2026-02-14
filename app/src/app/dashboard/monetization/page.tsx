"use client"

import { useEffect, useMemo, useState } from "react"
import { BadgeDollarSign, Download, FileText, Wallet } from "lucide-react"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NeonGrid,
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import {
  getEntitlementSummaryForUser,
  getInvoiceSummariesForUser,
  type EntitlementSummary,
  type InvoiceSummary,
} from "@/lib/data/billing"
import { createClient } from "@/lib/supabase/client"
import {
  getEarningsLedgerForUser,
  getPayoutsForUser,
  summarizeEarnings,
} from "@/lib/data/earnings"
import {
  buildMonetizationStatementCsv,
  filterInvoicesByDateRange,
  filterLedgerByDateRange,
  filterPayoutsByDateRange,
} from "@/lib/data/statement-export"
import {
  DEFAULT_PAYOUT_THRESHOLD_CENTS,
  getPayoutEligibility,
  sanitizeThresholdDollars,
} from "@/lib/data/payout-threshold"
import {
  getReferralRevenueSummary,
  type ReferralRevenueSummary,
} from "@/lib/growth/referral-revenue"
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
  const [entitlement, setEntitlement] = useState<EntitlementSummary | null>(null)
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([])
  const [referralRevenue, setReferralRevenue] = useState<ReferralRevenueSummary | null>(null)
  const [thresholdDollars, setThresholdDollars] = useState<string>(
    (DEFAULT_PAYOUT_THRESHOLD_CENTS / 100).toString(),
  )
  const [statementStartDate, setStatementStartDate] = useState("")
  const [statementEndDate, setStatementEndDate] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const userId = user?.id ?? "mock-user"
        const [ledgerRows, payoutRows, entitlementSummary, invoiceRows, referralSummary] =
          await Promise.all([
          getEarningsLedgerForUser(userId),
          getPayoutsForUser(userId),
          getEntitlementSummaryForUser(userId),
          getInvoiceSummariesForUser(userId),
          getReferralRevenueSummary(),
        ])
        setEntries(ledgerRows)
        setPayouts(payoutRows)
        setEntitlement(entitlementSummary)
        setInvoices(invoiceRows)
        setReferralRevenue(referralSummary)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const filteredEntries = useMemo(
    () =>
      filterLedgerByDateRange(entries, {
        startDate: statementStartDate,
        endDate: statementEndDate,
      }),
    [entries, statementEndDate, statementStartDate],
  )
  const filteredPayouts = useMemo(
    () =>
      filterPayoutsByDateRange(payouts, {
        startDate: statementStartDate,
        endDate: statementEndDate,
      }),
    [payouts, statementEndDate, statementStartDate],
  )
  const filteredInvoices = useMemo(
    () =>
      filterInvoicesByDateRange(invoices, {
        startDate: statementStartDate,
        endDate: statementEndDate,
      }),
    [invoices, statementEndDate, statementStartDate],
  )

  const summary = summarizeEarnings(filteredEntries)
  const payoutGate = useMemo(
    () => getPayoutEligibility(entries, sanitizeThresholdDollars(thresholdDollars)),
    [entries, thresholdDollars],
  )

  function downloadStatementCsv() {
    const csv = buildMonetizationStatementCsv({
      entries: filteredEntries,
      payouts: filteredPayouts,
      invoices: filteredInvoices,
    })
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    const suffix = [
      statementStartDate || "start-any",
      statementEndDate || "end-any",
    ].join("_")
    anchor.href = objectUrl
    anchor.download = `mashups-statement-${suffix}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(objectUrl)
  }

  if (loading) {
    return <NeonPage className="max-w-6xl">Loading monetization dashboard...</NeonPage>
  }

  return (
    <NeonPage className="max-w-6xl">
      <NeonHero
        eyebrow="Monetization"
        title="Earnings ledger, available balance, and payout history."
        description="Payout and ledger pages now follow the same visual section structure as the rest of the site."
      />

      <NeonSectionHeader title="Revenue Snapshot" />
      <NeonGrid className="sm:grid-cols-3">
        <div className="neon-panel rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Total Earnings</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatMoney(summary.total)}
          </p>
        </div>
        <div className="neon-panel rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Available</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatMoney(summary.available)}
          </p>
        </div>
        <div className="neon-panel rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatMoney(summary.pending)}
          </p>
        </div>
      </NeonGrid>

      <section className="neon-panel mt-6 rounded-2xl p-4">
        <NeonSectionHeader
          title="Statement Range"
          description="Filter records by date and export a consolidated CSV statement."
          action={
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={downloadStatementCsv}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          }
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">From</p>
            <Input
              type="date"
              value={statementStartDate}
              onChange={(event) => setStatementStartDate(event.target.value)}
              className="h-9 rounded-lg"
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">To</p>
            <Input
              type="date"
              value={statementEndDate}
              onChange={(event) => setStatementEndDate(event.target.value)}
              className="h-9 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-full"
              onClick={() => {
                setStatementStartDate("")
                setStatementEndDate("")
              }}
              disabled={!statementStartDate && !statementEndDate}
            >
              Clear Range
            </Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Showing {filteredEntries.length} ledger rows, {filteredPayouts.length} payouts, and{" "}
          {filteredInvoices.length} invoices in the current statement window.
        </p>
      </section>

      <section className="neon-panel mt-6 rounded-2xl p-4">
        <NeonSectionHeader
          title="Creator Referral Revenue"
          description="Recurring share generated by invited creators' subscription and licensing spend."
        />
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Invited Creators</p>
            <p className="text-lg font-semibold text-foreground">
              {referralRevenue?.invitedCreators ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Active Invited</p>
            <p className="text-lg font-semibold text-foreground">
              {referralRevenue?.activeInvitedCreators ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Recurring Revenue</p>
            <p className="text-lg font-semibold text-foreground">
              {formatMoney(referralRevenue?.recurringRevenueCents ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Projected Monthly</p>
            <p className="text-lg font-semibold text-foreground">
              {formatMoney(referralRevenue?.monthlyProjectedCents ?? 0)}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Conversion rate: {((referralRevenue?.inviteConversionRate ?? 0) * 100).toFixed(1)}%
        </p>
      </section>

      <NeonGrid className="mt-6 md:grid-cols-2">
        <section className="neon-panel rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-semibold text-foreground">Entitlements</h2>
            <Badge variant={entitlement?.status === "active" ? "default" : "secondary"}>
              {entitlement?.status ?? "none"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Current plan</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {entitlement?.planName ?? "Free"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Seats: {entitlement?.seats ?? 1}
            {entitlement?.renewsAt
              ? ` | Renews ${new Date(entitlement.renewsAt).toLocaleDateString()}`
              : ""}
          </p>
          {entitlement?.featureFlags?.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {entitlement.featureFlags.slice(0, 5).map((feature) => (
                <Badge key={feature} variant="outline">
                  {feature}
                </Badge>
              ))}
            </div>
          ) : null}
        </section>

        <section className="neon-panel rounded-2xl p-4">
          <h2 className="font-semibold text-foreground">Payout Threshold Gate</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Configure minimum available balance required for payout requests.
          </p>
          <div className="mt-3 flex items-end gap-2">
            <div className="flex-1">
              <p className="mb-1 text-xs text-muted-foreground">Threshold (USD)</p>
              <Input
                value={thresholdDollars}
                onChange={(event) => setThresholdDollars(event.target.value)}
                inputMode="decimal"
                className="h-9 rounded-lg"
              />
            </div>
            <Button
              size="sm"
              className="rounded-full"
              disabled={!payoutGate.eligible}
              title={
                payoutGate.eligible
                  ? "Eligible for payout"
                  : `Need ${formatMoney(payoutGate.shortfallCents)} more available`
              }
            >
              Request Payout
            </Button>
          </div>
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            <p>Available: {formatMoney(payoutGate.availableCents)}</p>
            <p>Pending: {formatMoney(payoutGate.pendingCents)}</p>
            <p>Threshold: {formatMoney(payoutGate.thresholdCents)}</p>
            {!payoutGate.eligible ? (
              <p className="text-primary">
                Shortfall: {formatMoney(payoutGate.shortfallCents)} before payout unlock.
              </p>
            ) : (
              <p className="text-primary">Threshold met. You can trigger a payout request.</p>
            )}
          </div>
        </section>
      </NeonGrid>

      <NeonGrid className="mt-6 md:grid-cols-2">
        <section className="neon-panel rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <BadgeDollarSign className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Ledger Entries</h2>
          </div>
          <div className="space-y-2">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-border/70 bg-background/50 px-3 py-2 text-sm"
                >
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

        <section className="neon-panel rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Payout History</h2>
          </div>
          <div className="space-y-2">
            {filteredPayouts.length > 0 ? (
              filteredPayouts.map((payout) => (
                <div
                  key={payout.id}
                  className="rounded-xl border border-border/70 bg-background/50 px-3 py-2 text-sm"
                >
                  <p className="font-medium text-foreground">
                    {formatMoney(payout.amount_cents)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payout.status} | Requested{" "}
                    {new Date(payout.requested_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No payouts yet.</p>
            )}
          </div>
        </section>
      </NeonGrid>

      <section className="neon-panel mt-6 rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-foreground">Invoice Timeline</h2>
        </div>
        <div className="space-y-2">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="rounded-xl border border-border/70 bg-background/50 px-3 py-2 text-sm"
              >
                <p className="font-medium text-foreground">
                  {invoice.description} | {formatMoney(invoice.amountCents, invoice.currency)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {invoice.status} | {new Date(invoice.issuedAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          )}
        </div>
      </section>
    </NeonPage>
  )
}

export default function MonetizationPage() {
  return (
    <AuthGuard>
      <MonetizationContent />
    </AuthGuard>
  )
}
