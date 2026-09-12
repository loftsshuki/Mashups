import assert from "node:assert/strict"
import test from "node:test"

import { checkoutSchema, getCheckoutPriceId } from "../src/lib/billing/checkout-contract.ts"
import { checkSupabaseHealth } from "../src/lib/config/service-health.ts"
import { createGreenSessionManager, GREEN_SESSION_IDLE_MS } from "../src/lib/analytics/green-session.ts"
import { deliverGreenEvent } from "../src/lib/analytics/green-delivery.ts"
import { greenEventSchema } from "../src/lib/green-room/schemas.ts"
import { GREEN_FUNNEL_EVENTS } from "../packages/contracts/src/index.ts"

test("checkout resolves only the requested product and never substitutes a different plan", () => {
  const env = { STRIPE_PRICE_ID_PRO_CREATOR: "price_creator", STRIPE_PRICE_ID_PRO_STUDIO: "price_studio", STRIPE_PRICE_ID_LICENSE_ORGANIC_SHORTS: "price_organic" }
  assert.equal(getCheckoutPriceId("subscription", "pro_creator", env), "price_creator")
  assert.equal(getCheckoutPriceId("subscription", "pro_studio", env), "price_studio")
  assert.equal(getCheckoutPriceId("license", "organic_shorts", env), "price_organic")
  for (const targetId of ["creator", "studio", "free", "unknown", "organic_shorts"]) {
    assert.equal(checkoutSchema.safeParse({ sessionType: "subscription", targetId }).success, false)
    assert.equal(getCheckoutPriceId("subscription", targetId, env), null)
  }
  assert.equal(getCheckoutPriceId("license", "pro_creator", env), null)
  assert.equal(getCheckoutPriceId("subscription", "pro_studio", { STRIPE_PRICE_ID_PRO_CREATOR: "price_creator" }), null)
  assert.equal(getCheckoutPriceId("subscription", "pro_studio", { STRIPE_PRICE_ID_PRO_STUDIO: " " }), null)
})

test("health authenticates its probes and does not confuse Auth health with schema health", async () => {
  const calls: { url: string; options?: RequestInit }[] = []
  const fetcher: typeof fetch = async (url, options) => {
    calls.push({ url: String(url), options })
    return new Response("{}", { status: String(url).includes("/auth/") ? 200 : 404 })
  }
  const result = await checkSupabaseHealth({ NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co/", NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key" }, fetcher)
  assert.deepEqual(result, { auth: "healthy", database: "schema_missing" })
  assert.equal(calls.length, 2)
  assert.equal(calls[1].url, "https://test.supabase.co/rest/v1/profiles?select=id&limit=0")
  for (const call of calls) {
    assert.equal(new Headers(call.options?.headers).get("apikey"), "test-anon-key")
    assert.equal(call.options?.cache, "no-store")
  }
  assert.equal(JSON.stringify(result).includes("test-anon-key"), false)
})

test("health distinguishes missing configuration, rejected credentials and network failure", async () => {
  const env = { NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key" }
  assert.deepEqual(await checkSupabaseHealth({}, async () => { throw new Error("should not fetch") }), { auth: "unconfigured", database: "unconfigured" })
  assert.deepEqual(await checkSupabaseHealth(env, async () => new Response(null, { status: 401 })), { auth: "unauthorized", database: "unauthorized" })
  assert.deepEqual(await checkSupabaseHealth(env, async () => { throw new TypeError("DNS failure") }), { auth: "unreachable", database: "unreachable" })
  assert.deepEqual(await checkSupabaseHealth(env, async () => new Response("[]")), { auth: "healthy", database: "healthy" })
})

function memoryStorage(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed))
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) } }
}

test("returning visitors keep their identity while activity sessions expire after inactivity", () => {
  const visitorStorage = memoryStorage()
  const sessionStorage = memoryStorage()
  let nextId = 0
  const makeId = () => `identity-${++nextId}`
  const first = createGreenSessionManager({ visitorStorage, sessionStorage, makeId })
  const identity = first.getIdentity(100)
  assert.deepEqual(first.getIdentity(1000), identity)
  const reload = createGreenSessionManager({ visitorStorage, sessionStorage, makeId })
  assert.deepEqual(reload.getIdentity(2000), identity)
  const returned = reload.getIdentity(2000 + GREEN_SESSION_IDLE_MS)
  assert.equal(returned.visitorId, identity.visitorId)
  assert.notEqual(returned.sessionId, identity.sessionId)
  assert.notEqual(reload.getIdentity(100).sessionId, returned.sessionId)
})

test("legacy visitor identity survives migration and blocked storage does not break creation", () => {
  const legacy = createGreenSessionManager({ visitorStorage: memoryStorage({ "mashups.green.session.v1": "legacy-visitor" }), sessionStorage: memoryStorage({ "mashups.green.activity.v1": "{broken" }) })
  assert.equal(legacy.getIdentity().visitorId, "legacy-visitor")
  const blockedStorage = { getItem() { throw new Error("blocked") }, setItem() { throw new Error("blocked") } }
  const blocked = createGreenSessionManager({ visitorStorage: blockedStorage, sessionStorage: blockedStorage })
  assert.deepEqual(blocked.getIdentity(1000), blocked.getIdentity(1001))
})

test("every shared event validates, while oversized properties and invalid identities are rejected", () => {
  for (const eventName of GREEN_FUNNEL_EVENTS) {
    assert.equal(greenEventSchema.safeParse({ eventName, sessionId: "session-123" }).success, true)
  }
  for (const payload of [
    { eventName: "invented", sessionId: "session-123" },
    { eventName: "create_viewed", sessionId: "session-123", eventId: "not-a-uuid" },
    { eventName: "create_viewed", sessionId: "session-123", properties: { detail: "x".repeat(1025) } },
    { eventName: "create_viewed", sessionId: "session-123", properties: Object.fromEntries(Array.from({ length: 33 }, (_, i) => [i, true])) },
  ]) assert.equal(greenEventSchema.safeParse(payload).success, false)
})

const event = { eventName: "create_viewed" as const, eventId: "a0000000-0000-4000-8000-000000000001", visitorId: "visitor-123", sessionId: "session-123", properties: {} }

test("event delivery retries unavailable storage with the same ID, then requires a durable receipt", async () => {
  const bodies: string[] = []
  let delays = 0
  const fetcher: typeof fetch = async (_url, options) => {
    bodies.push(String(options?.body))
    return Response.json({ persisted: bodies.length === 2 }, { status: bodies.length === 2 ? 202 : 503 })
  }
  assert.equal(await deliverGreenEvent(event, { fetcher, delay: async () => { delays++ } }), true)
  assert.equal(delays, 1)
  assert.equal(bodies.length, 2)
  assert.equal(bodies[0], bodies[1])
  assert.equal(JSON.parse(bodies[0]).eventId, event.eventId)
})

test("event delivery reports unpersisted success responses and network failures as failure", async () => {
  for (const fetcher of [async () => Response.json({ accepted: true, persisted: false }, { status: 202 }), async () => { throw new Error("offline") }]) {
    assert.equal(await deliverGreenEvent(event, { fetcher, delay: async () => {} }), false)
  }
  let attempts = 0
  assert.equal(await deliverGreenEvent(event, { fetcher: async () => { attempts++; return new Response(null, { status: 429 }) }, delay: async () => {} }), false)
  assert.equal(attempts, 1)
})
