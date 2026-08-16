import { isProduction } from "@/lib/config/runtime"
import { createAdminClient } from "@/lib/supabase/admin"

type Bucket = {
  count: number
  resetAt: number
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

const globalStore = globalThis as typeof globalThis & {
  __mashups_rate_limit_store__?: Map<string, Bucket>
}

function consumeLocalRateLimit(input: {
  key: string
  limit: number
  windowMs: number
}): RateLimitResult {
  const now = Date.now()
  const store =
    globalStore.__mashups_rate_limit_store__ ??
    (globalStore.__mashups_rate_limit_store__ = new Map<string, Bucket>())
  const bucket = store.get(input.key)

  if (!bucket || bucket.resetAt <= now) {
    store.set(input.key, { count: 1, resetAt: now + input.windowMs })
    return {
      allowed: true,
      remaining: Math.max(0, input.limit - 1),
      retryAfterSeconds: Math.ceil(input.windowMs / 1000),
    }
  }

  if (bucket.count >= input.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }

  bucket.count += 1
  return {
    allowed: true,
    remaining: Math.max(0, input.limit - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  }
}

/**
 * Uses a Supabase RPC in deployed environments so limits are shared by every
 * function instance. Local development falls back to an in-process bucket.
 */
export async function consumeRateLimit(input: {
  key: string
  limit: number
  windowMs: number
}): Promise<RateLimitResult> {
  if (process.env.E2E_TEST_MODE === "1" && process.env.VERCEL !== "1") {
    return consumeLocalRateLimit(input)
  }
  const admin = createAdminClient()
  if (!admin) {
    if (!isProduction()) return consumeLocalRateLimit(input)
    return { allowed: false, remaining: 0, retryAfterSeconds: 30 }
  }

  const { data, error } = await admin.rpc("consume_api_rate_limit", {
    p_rate_key: input.key,
    p_limit: input.limit,
    p_window_seconds: Math.max(1, Math.ceil(input.windowMs / 1000)),
  })

  if (error) {
    console.error("[RateLimit] Distributed limiter failed:", error.message)
    if (!isProduction()) return consumeLocalRateLimit(input)
    return { allowed: false, remaining: 0, retryAfterSeconds: 30 }
  }

  const row = Array.isArray(data) ? data[0] : data
  if (!row || typeof row !== "object") {
    return { allowed: false, remaining: 0, retryAfterSeconds: 30 }
  }

  const result = row as Record<string, unknown>
  return {
    allowed: result.allowed === true,
    remaining: Number(result.remaining ?? 0),
    retryAfterSeconds: Number(result.retry_after_seconds ?? 30),
  }
}

export function resolveRateLimitKey(
  request: Request,
  namespace: string,
  userId?: string | null,
): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || "unknown-ip"
  return `${namespace}:${userId ?? "anon"}:${ip}`
}
