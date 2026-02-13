import { createClient } from "@/lib/supabase/client"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export interface EntitlementSummary {
  planId: string | null
  planName: string
  status: "active" | "trialing" | "past_due" | "canceled" | "none"
  renewsAt: string | null
  interval: "month" | "year" | null
  seats: number
  featureFlags: string[]
}

export interface InvoiceSummary {
  id: string
  sessionType: "subscription" | "license"
  targetId: string
  amountCents: number
  currency: string
  status: "pending" | "paid" | "failed"
  issuedAt: string
  description: string
}

const mockEntitlement: EntitlementSummary = {
  planId: "pro_creator",
  planName: "Pro Creator",
  status: "active",
  renewsAt: "2026-03-15T00:00:00Z",
  interval: "month",
  seats: 1,
  featureFlags: ["advanced_mixer", "creator_analytics", "priority_discovery"],
}

const mockInvoices: InvoiceSummary[] = [
  {
    id: "inv-mock-001",
    sessionType: "subscription",
    targetId: "Pro Creator",
    amountCents: 1200,
    currency: "USD",
    status: "paid",
    issuedAt: "2026-02-01T12:00:00Z",
    description: "Pro Creator monthly subscription",
  },
  {
    id: "inv-mock-002",
    sessionType: "license",
    targetId: "organic_shorts",
    amountCents: 2500,
    currency: "USD",
    status: "pending",
    issuedAt: "2026-02-09T15:45:00Z",
    description: "Creator license checkout",
  },
]

function normalizeSubscriptionStatus(value: unknown): EntitlementSummary["status"] {
  if (value === "active" || value === "trialing" || value === "past_due" || value === "canceled") {
    return value
  }
  return "none"
}

function normalizeCheckoutStatus(value: unknown): InvoiceSummary["status"] {
  if (value === "completed") return "paid"
  if (value === "failed") return "failed"
  return "pending"
}

function resolveInvoiceAmount(sessionType: InvoiceSummary["sessionType"], targetId: string): number {
  if (sessionType === "license") {
    return targetId === "paid_ads_shorts" ? 4900 : 2500
  }

  const normalized = targetId.toLowerCase()
  if (normalized.includes("studio")) return 2900
  if (normalized.includes("creator")) return 1200
  return 1500
}

export async function startCheckout(
  sessionType: "subscription" | "license",
  targetId: string,
): Promise<{ checkoutUrl?: string; error?: string }> {
  try {
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionType, targetId }),
    })

    const data = (await response.json()) as { checkoutUrl?: string; error?: string }
    if (!response.ok) return { error: data.error ?? "Failed to start checkout" }
    return data
  } catch {
    return { error: "Failed to start checkout" }
  }
}

export async function getEntitlementSummaryForUser(
  userId: string,
): Promise<EntitlementSummary> {
  if (!isSupabaseConfigured()) return mockEntitlement

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan_id,status,current_period_end,subscription_plans(name,interval,features)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return {
        planId: null,
        planName: "Free",
        status: "none",
        renewsAt: null,
        interval: null,
        seats: 1,
        featureFlags: [],
      }
    }

    const record = data as Record<string, unknown>
    const linked = record.subscription_plans
    const planRecord = (Array.isArray(linked) ? linked[0] : linked) as
      | Record<string, unknown>
      | undefined
    const planId = typeof record.plan_id === "string" ? record.plan_id : null
    const planName =
      typeof planRecord?.name === "string"
        ? planRecord.name
        : planId
          ? planId.replace(/_/g, " ")
          : "Free"
    const interval =
      planRecord?.interval === "month" || planRecord?.interval === "year"
        ? (planRecord.interval as "month" | "year")
        : null
    const featureFlags = Array.isArray(planRecord?.features)
      ? planRecord.features.filter((entry): entry is string => typeof entry === "string")
      : []
    const seats = planId?.toLowerCase().includes("studio") ? 5 : 1

    return {
      planId,
      planName,
      status: normalizeSubscriptionStatus(record.status),
      renewsAt: typeof record.current_period_end === "string" ? record.current_period_end : null,
      interval,
      seats,
      featureFlags,
    }
  } catch {
    return {
      planId: null,
      planName: "Free",
      status: "none",
      renewsAt: null,
      interval: null,
      seats: 1,
      featureFlags: [],
    }
  }
}

export async function getInvoiceSummariesForUser(
  userId: string,
): Promise<InvoiceSummary[]> {
  if (!isSupabaseConfigured()) return mockInvoices

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("checkout_sessions")
      .select("id,session_type,target_id,status,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error || !data) return []

    return (data as Record<string, unknown>[]).map((record) => {
      const sessionType = record.session_type === "license" ? "license" : "subscription"
      const targetId = typeof record.target_id === "string" ? record.target_id : "unknown"
      return {
        id: typeof record.id === "string" ? record.id : `inv-${Math.random()}`,
        sessionType,
        targetId,
        amountCents: resolveInvoiceAmount(sessionType, targetId),
        currency: "USD",
        status: normalizeCheckoutStatus(record.status),
        issuedAt:
          typeof record.created_at === "string"
            ? record.created_at
            : new Date().toISOString(),
        description:
          sessionType === "subscription"
            ? `Subscription checkout (${targetId})`
            : `License checkout (${targetId})`,
      }
    })
  } catch {
    return []
  }
}
