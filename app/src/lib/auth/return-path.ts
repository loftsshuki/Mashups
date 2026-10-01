export function safeReturnPath(value: unknown, fallback = "/create"): string {
  if (typeof value !== "string" || value.length > 2048 || !value.startsWith("/") || value.startsWith("//")) return fallback
  const unsafe = (path: string) => path.includes("\\") || path.startsWith("//") || [...path].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)
  let decoded = value
  try {
    for (let i = 0; i < 3; i++) {
      if (unsafe(decoded)) return fallback
      const next = decodeURIComponent(decoded)
      if (next === decoded) break
      decoded = next
    }
    if (unsafe(decoded)) return fallback
    const parsed = new URL(value, "https://return.mashups.invalid")
    const decodedPath = new URL(decoded, "https://return.mashups.invalid").pathname
    if (parsed.origin !== "https://return.mashups.invalid" || /^\/(?:auth|login|signup)(?:\/|$)/.test(decodedPath)) return fallback
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}

export function buildAuthPath(mode: "login" | "signup", next: unknown) {
  return `/${mode}?${new URLSearchParams({ next: safeReturnPath(next) })}`
}

export function buildAuthCallbackUrl(origin: string, next: unknown) {
  const url = new URL("/auth/callback", origin)
  url.searchParams.set("next", safeReturnPath(next))
  return url.toString()
}
