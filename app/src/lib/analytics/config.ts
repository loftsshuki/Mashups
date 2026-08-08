const PLACEHOLDER_KEYS = new Set([
  "placeholder",
  "changeme",
  "your_posthog_key",
  "your-posthog-key",
])

export function normalizePostHogKey(value: string | null | undefined): string | null {
  const key = value?.trim()
  if (!key || PLACEHOLDER_KEYS.has(key.toLowerCase())) return null
  return key
}
