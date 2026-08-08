"use client"

import { trackProductEvent, type ProductEvent } from "./events"
import type { GreenFunnelEvent } from "@/lib/green-room/types"

const SESSION_KEY = "mashups.green.session.v1"

export function trackGreenEvent(eventName: GreenFunnelEvent, properties: Record<string, string | number | boolean | null> = {}) {
  const sessionId = getGreenSessionId()
  trackProductEvent(eventName as ProductEvent, properties)
  void fetch("/api/green/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventName, sessionId, properties }), keepalive: true }).catch(() => undefined)
}

function getGreenSessionId() {
  const existing = window.localStorage.getItem(SESSION_KEY)
  if (existing) return existing
  const id = globalThis.crypto?.randomUUID?.() ?? `green-${Date.now()}-${Math.random().toString(36).slice(2)}`
  window.localStorage.setItem(SESSION_KEY, id)
  return id
}
