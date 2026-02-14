type Bucket = {
  count: number
  resetAt: number
}

const globalStore = globalThis as typeof globalThis & {
  __mashups_rate_limit_store__?: Map<string, Bucket>
}

function getStore(): Map<string, Bucket> {
  if (!globalStore.__mashups_rate_limit_store__) {
    globalStore.__mashups_rate_limit_store__ = new Map<string, Bucket>()
  }
  return globalStore.__mashups_rate_limit_store__
}

export function consumeRateLimit(input: {
  key: string
  limit: number
  windowMs: number
}): {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
} {
  const now = Date.now()
  const store = getStore()
  const bucket = store.get(input.key)

  if (!bucket || bucket.resetAt <= now) {
    store.set(input.key, {
      count: 1,
      resetAt: now + input.windowMs,
    })
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
  store.set(input.key, bucket)
  return {
    allowed: true,
    remaining: Math.max(0, input.limit - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  }
}

export function resolveRateLimitKey(request: Request, namespace: string, userId?: string | null): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || "unknown-ip"
  return `${namespace}:${userId ?? "anon"}:${ip}`
}
