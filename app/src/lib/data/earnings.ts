import { createClient } from "@/lib/supabase/client"
import type { EarningsLedgerEntry, Payout } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const mockLedger: EarningsLedgerEntry[] = [
  {
    id: "el-001",
    user_id: "mock-user",
    source_type: "tip",
    source_id: "tip-122",
    amount_cents: 1500,
    currency: "USD",
    status: "available",
    available_at: "2026-02-11T00:00:00Z",
    created_at: "2026-02-10T12:00:00Z",
  },
  {
    id: "el-002",
    user_id: "mock-user",
    source_type: "marketplace_sale",
    source_id: "pack-03",
    amount_cents: 7200,
    currency: "USD",
    status: "pending",
    available_at: "2026-02-20T00:00:00Z",
    created_at: "2026-02-13T08:15:00Z",
  },
]

const mockPayouts: Payout[] = [
  {
    id: "po-001",
    user_id: "mock-user",
    amount_cents: 4800,
    method: "stripe_connect",
    status: "paid",
    requested_at: "2026-02-01T09:00:00Z",
    paid_at: "2026-02-02T12:30:00Z",
  },
]

export async function getEarningsLedgerForUser(
  userId: string,
): Promise<EarningsLedgerEntry[]> {
  if (!isSupabaseConfigured()) return mockLedger

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("earnings_ledger")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data as EarningsLedgerEntry[]
  } catch {
    return []
  }
}

export async function getPayoutsForUser(userId: string): Promise<Payout[]> {
  if (!isSupabaseConfigured()) return mockPayouts

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("payouts")
      .select("*")
      .eq("user_id", userId)
      .order("requested_at", { ascending: false })

    if (error || !data) return []
    return data as Payout[]
  } catch {
    return []
  }
}

export function summarizeEarnings(entries: EarningsLedgerEntry[]) {
  return entries.reduce(
    (acc, entry) => {
      acc.total += entry.amount_cents
      if (entry.status === "available") acc.available += entry.amount_cents
      if (entry.status === "pending") acc.pending += entry.amount_cents
      return acc
    },
    { total: 0, available: 0, pending: 0 },
  )
}
