"use client"

import { trackProductEvent, type ProductEvent } from "./events"
import type { GreenFunnelEvent } from "@/lib/green-room/types"
import { deliverGreenEvent } from "./green-delivery"
import { createAnalyticsId, createGreenSessionManager } from "./green-session"

let sessionManager: ReturnType<typeof createGreenSessionManager> | undefined
let reportedFailure = false

export function trackGreenEvent(eventName: GreenFunnelEvent, properties: Record<string, string | number | boolean | null> = {}) {
  if (typeof window === "undefined") return
  if (!sessionManager) {
    let visitorStorage: Storage | undefined
    let sessionStorage: Storage | undefined
    try { visitorStorage = window.localStorage } catch { /* Storage can be blocked. */ }
    try { sessionStorage = window.sessionStorage } catch { /* Storage can be blocked. */ }
    sessionManager = createGreenSessionManager({ visitorStorage, sessionStorage })
  }
  const identity = sessionManager.getIdentity()
  trackProductEvent(eventName as ProductEvent, properties)
  void deliverGreenEvent({ eventName, eventId: createAnalyticsId(), ...identity, properties }).then((persisted) => {
    if (!persisted && !reportedFailure) {
      reportedFailure = true
      console.warn("[Mashups analytics] Event storage is unavailable; these actions may be missing from reports.")
    }
  })
}
