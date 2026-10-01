import type { GreenEventInput, GreenEventReceipt } from "@mashups/contracts"

export async function deliverGreenEvent(
  input: GreenEventInput,
  dependencies: { fetcher?: typeof fetch; delay?: () => Promise<void> } = {},
): Promise<boolean> {
  const fetcher = dependencies.fetcher ?? fetch
  const delay = dependencies.delay ?? (() => new Promise<void>((resolve) => setTimeout(resolve, 1000)))
  const body = JSON.stringify(input)
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetcher("/api/green/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
        signal: AbortSignal.timeout(4000),
      })
      if (!response.ok && response.status < 500) return false
      const receipt = await response.json() as Partial<GreenEventReceipt>
      if (response.ok && receipt.persisted === true) return true
    } catch { /* A retry reuses the event ID, including after a lost receipt. */ }
    if (attempt === 0) await delay()
  }
  return false
}
