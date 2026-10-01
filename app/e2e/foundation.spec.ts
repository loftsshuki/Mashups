import { expect, test } from "@playwright/test"
import { checkoutSchema } from "../src/lib/billing/checkout-contract"

test("paid plan buttons send valid product IDs and display the API failure", async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/pricing")
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  for (const [button, targetId] of [["Choose Creator", "pro_creator"], ["Choose Studio", "pro_studio"]]) {
    const responsePromise = page.waitForResponse((response) => response.url().endsWith("/api/billing/checkout") && response.request().method() === "POST")
    await page.getByRole("button", { name: button }).click()
    const response = await responsePromise
    const payload = response.request().postDataJSON()
    expect(checkoutSchema.safeParse(payload).success).toBe(true)
    expect(payload).toMatchObject({ sessionType: "subscription", targetId })
    // Anonymous / unconfigured test environments must fail before charging.
    expect([401, 503]).toContain(response.status())
    const body = await response.json()
    await expect(page.getByRole("alert").filter({ hasText: body.error })).toHaveText(body.error)
    await expect(page.getByRole("button", { name: button })).toBeEnabled()
  }
  await expect(page.locator('[data-nextjs-dialog]')).toHaveCount(0)
  expect(errors).toEqual([])
  await page.screenshot({ path: testInfo.outputPath("pricing.png"), fullPage: true })
})

test("checkout rejects mismatched products before authentication or billing", async ({ request }) => {
  for (const [sessionType, targetId] of [["subscription", "creator"], ["subscription", "organic_shorts"], ["license", "pro_studio"]]) {
    const response = await request.post("/api/billing/checkout", { data: { sessionType, targetId } })
    expect(response.status()).toBe(400)
    expect(await response.json()).toMatchObject({ error: "Invalid checkout payload." })
  }
})

test("event API exposes persistence failure and protects private reporting", async ({ request }) => {
  const response = await request.post("/api/green/events", { data: { eventName: "video_export_failed", sessionId: "foundation-browser-session", visitorId: "foundation-browser-visitor", eventId: "50000000-0000-4000-8000-000000000001", properties: { reason: "verification" } } })
  expect(response.status()).toBe(503)
  expect(await response.json()).toMatchObject({ accepted: false, persisted: false, reason: "unavailable" })
  expect((await request.get("/api/green/metrics")).status()).toBe(403)
  expect((await request.get("/api/admin/green-room")).status()).toBe(403)
})

test("health reports independent auth and database states without exposing configuration", async ({ request }) => {
  const response = await request.get("/api/health")
  expect(response.status()).toBe(503)
  const body = await response.json()
  expect(body).toMatchObject({ status: "degraded", services: { auth: "unconfigured", database: "unconfigured" } })
  expect(JSON.stringify(body)).not.toMatch(/supabase\.co|service_role|apikey|eyJ/)
})

test("creation sends stable visitor identity and retries a lost persistence receipt", async ({ page }) => {
  const events: Record<string, unknown>[] = []
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.route("**/api/green/events", async (route) => {
    events.push(route.request().postDataJSON())
    await route.fulfill({ status: 202, json: { accepted: true, persisted: events.length > 1 } })
  })
  await page.goto("/create")
  await expect(page.getByTestId("generate-mashups")).toBeVisible()
  await expect.poll(() => events.some((event, index) => index > 0 && event.eventId === events[0]?.eventId)).toBe(true)
  expect(events[0]).toMatchObject({ eventName: "create_viewed" })
  const retry = events.find((event, index) => index > 0 && event.eventId === events[0].eventId)
  expect(retry).toEqual(events[0])
  await page.reload()
  await expect.poll(() => events.some((event) => event.eventId !== events[0].eventId && event.visitorId === events[0].visitorId && event.sessionId === events[0].sessionId)).toBe(true)
  expect(events.some((event) => event.eventName === "share_started")).toBe(false)
  await expect(page.locator('[data-nextjs-dialog]')).toHaveCount(0)
  expect(errors).toEqual([])
})
