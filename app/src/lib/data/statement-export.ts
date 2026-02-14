import type { InvoiceSummary } from "@/lib/data/billing"
import type { EarningsLedgerEntry, Payout } from "@/lib/data/types"

export interface StatementDateRange {
  startDate: string
  endDate: string
}

function parseBoundary(date: string, endOfDay: boolean): number | null {
  if (!date) return null
  const suffix = endOfDay ? "T23:59:59.999" : "T00:00:00.000"
  const parsed = new Date(`${date}${suffix}`)
  const ms = parsed.getTime()
  return Number.isFinite(ms) ? ms : null
}

export function isWithinDateRange(
  value: string,
  range: StatementDateRange,
): boolean {
  const instant = new Date(value).getTime()
  if (!Number.isFinite(instant)) return false

  const start = parseBoundary(range.startDate, false)
  const end = parseBoundary(range.endDate, true)
  if (start !== null && instant < start) return false
  if (end !== null && instant > end) return false
  return true
}

export function filterLedgerByDateRange(
  entries: EarningsLedgerEntry[],
  range: StatementDateRange,
): EarningsLedgerEntry[] {
  if (!range.startDate && !range.endDate) return entries
  return entries.filter((entry) => isWithinDateRange(entry.created_at, range))
}

export function filterPayoutsByDateRange(
  payouts: Payout[],
  range: StatementDateRange,
): Payout[] {
  if (!range.startDate && !range.endDate) return payouts
  return payouts.filter((entry) => isWithinDateRange(entry.requested_at, range))
}

export function filterInvoicesByDateRange(
  invoices: InvoiceSummary[],
  range: StatementDateRange,
): InvoiceSummary[] {
  if (!range.startDate && !range.endDate) return invoices
  return invoices.filter((entry) => isWithinDateRange(entry.issuedAt, range))
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replace(/"/g, "\"\"")}"`
  }
  return value
}

export function buildMonetizationStatementCsv(input: {
  entries: EarningsLedgerEntry[]
  payouts: Payout[]
  invoices: InvoiceSummary[]
}): string {
  const lines: string[] = [
    "category,id,date,status,amount_cents,currency,description",
  ]

  for (const entry of input.entries) {
    lines.push(
      [
        "ledger",
        entry.id,
        entry.created_at,
        entry.status,
        String(entry.amount_cents),
        entry.currency,
        entry.source_type,
      ]
        .map((field) => escapeCsv(field))
        .join(","),
    )
  }

  for (const invoice of input.invoices) {
    lines.push(
      [
        "invoice",
        invoice.id,
        invoice.issuedAt,
        invoice.status,
        String(invoice.amountCents),
        invoice.currency,
        invoice.description,
      ]
        .map((field) => escapeCsv(field))
        .join(","),
    )
  }

  for (const payout of input.payouts) {
    lines.push(
      [
        "payout",
        payout.id,
        payout.requested_at,
        payout.status,
        String(-Math.abs(payout.amount_cents)),
        "USD",
        payout.method,
      ]
        .map((field) => escapeCsv(field))
        .join(","),
    )
  }

  return `${lines.join("\n")}\n`
}
