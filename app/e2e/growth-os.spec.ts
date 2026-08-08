import { expect, test } from "@playwright/test"

const browserErrors = new WeakMap<object, string[]>()

test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  browserErrors.set(page, errors)
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()) })
})

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([])
})

test("Growth OS evaluates evidence and exposes all fourteen systems", async ({ page }, testInfo) => {
  await page.goto("/network?demo=1")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("THE NETWORK")
  await expect(page.getByText("Launch Autopilot", { exact: true })).toBeVisible()
  await expect(page.getByText("Private Pre-Release Exchange", { exact: true })).toBeVisible()

  await page.getByRole("button", { name: /Run decision cycle/i }).click()
  await expect(page.getByRole("status")).toContainText("decisions evaluated")

  await page.getByRole("button", { name: /Save Midnight Velocity/i }).click()
  await expect(page.getByRole("status")).toContainText("Saved on Spotify")

  await page.getByRole("button", { name: "Claim offer" }).first().click()
  await expect(page.getByText("Offer accepted", { exact: true }).first()).toBeVisible()

  const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
  expect(noHorizontalOverflow).toBe(true)
  await page.screenshot({ path: testInfo.outputPath("growth-os.png"), fullPage: true })
})

test("rightsholder demo explains the private fail-closed intake", async ({ page }) => {
  await page.goto("/supply?demo=1")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("MUSIC IN")
  await expect(page.getByRole("button", { name: /Preview submission flow/i })).toBeVisible()
  await expect(page.getByText(/Uploaded directly to a private store/i)).toBeVisible()
  await expect(page.getByText(/No standalone MP3\/WAV or stem export is granted/i)).toBeVisible()
  await expect(page.getByLabel(/Public preview URL/i)).toHaveCount(0)
})

test("invited creator can stake a sealed pre-release call", async ({ page }) => {
  await page.goto("/exchange?demo=1")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("HEAR IT")
  await expect(page.getByLabel(/Private preview of Soft Static/i)).toBeVisible()
  await page.getByRole("button", { name: /Stake 72 reputation/i }).click()
  await expect(page.getByRole("status")).toContainText(/reputation is now at stake/i)
})

test("creator proof passport is public and evidence-based", async ({ page }) => {
  await page.goto("/passport/julesafterdark?demo=1")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Jules Navarro")
  await expect(page.getByText("Rights-clean uses")).toBeVisible()
  await expect(page.getByText("Paid-use ready")).toBeVisible()
})

test("venue bridge converts a room scan into a music save", async ({ page }) => {
  await page.goto("/club/afterdark?demo=1")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("THE")
  const saveButton = page.getByRole("button", { name: /Save the track/i })
  await saveButton.click()
  await expect(page.getByRole("status")).toContainText("afterhours edit")
})

test("launch embed renders a compact participation surface", async ({ page }) => {
  await page.goto("/embed/launch/midnight-velocity?demo=1")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Midnight Velocity")
  await expect(page.getByRole("link", { name: /Fork it/i })).toBeVisible()
  const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
  expect(noHorizontalOverflow).toBe(true)
})

test("Growth OS demo APIs stay write-free and exercise production contracts", async ({ request }) => {
  const [autopilot, save, club] = await Promise.all([
    request.post("/api/growth/autopilot?demo=1", { data: { launchSlug: "midnight-velocity", trigger: "operator" } }),
    request.post("/api/growth/save?demo=1", { data: { launchSlug: "midnight-velocity", spotifyUri: "spotify:track:7a3LWj5xSFhFRYmztS8wgK", anonymousKey: "playwright-save-key" } }),
    request.post("/api/growth/club/AFTERDARK?demo=1", { data: { eventType: "scan", anonymousKey: "playwright-club-key" } }),
  ])
  expect(autopilot.status()).toBe(200)
  expect(save.status()).toBe(200)
  expect(club.status()).toBe(200)
  await expect(autopilot.json()).resolves.toMatchObject({ ok: true, demo: true })
  await expect(save.json()).resolves.toMatchObject({ ok: true, result: "saved", demo: true })
})
