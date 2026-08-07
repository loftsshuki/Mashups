import { expect, test } from "@playwright/test"

const browserErrors = new WeakMap<object, string[]>()

test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  browserErrors.set(page, errors)
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
})

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([])
})

test("public viral launch supports the complete participation loop", async ({ page }, testInfo) => {
  await page.goto("/launches/midnight-velocity?demo=1")

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Midnight Velocity")
  await expect(page.getByText("Rights-routed source")).toBeVisible()
  await expect(page.getByRole("button", { name: /Make your version/i })).toBeVisible()

  const shareButton = page.getByRole("button", { name: /Send to a creator/i })
  await shareButton.click()

  await page.getByLabel("Branch name").fill("Playwright city branch")
  await page.getByLabel("Niche / city").fill("Baltimore nightlife")
  await page.getByLabel("Platform").selectOption("youtube")
  await page.getByRole("button", { name: /Build native package/i }).click()
  await expect(page.getByText(/Branch created from/i)).toBeVisible()

  await page.getByRole("button", { name: /Call winner/i }).first().click()
  await expect(page.getByText(/breakout call/i)).toBeVisible()

  await page.getByRole("button", { name: "Join", exact: true }).first().click()
  await expect(page.getByText(/You joined/i)).toBeVisible()

  const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
  expect(noHorizontalOverflow).toBe(true)
  await page.screenshot({ path: testInfo.outputPath("viral-launch.png"), fullPage: true })
})

test("demo viral event endpoint accepts public participation", async ({ request }) => {
  const response = await request.post("/api/viral/launches/midnight-velocity/events?demo=1", {
    data: {
      eventType: "save_click",
      anonymousKey: "playwright-anonymous-key",
      platform: "spotify",
    },
  })
  expect(response.status()).toBe(200)
  await expect(response.json()).resolves.toMatchObject({ ok: true, eventType: "save_click", demo: true })
})

test("operator can configure and ignite a labeled launch", async ({ page }) => {
  await page.goto("/launches/new?demo=1")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Test small")
  await expect(page.getByLabel("Spotify save URL")).toHaveValue(/spotify/)

  await page.getByRole("button", { name: /Ignition/i }).click()
  await expect(page.getByText(/Lock the protocol/i)).toBeVisible()
  const navigation = page.waitForURL(/\/launches\/midnight-velocity\?demo=1$/)
  const igniteButton = await page.getByRole("button", { name: /Ignite launch/i }).elementHandle()
  expect(igniteButton).not.toBeNull()
  await Promise.all([
    navigation,
    igniteButton!.evaluate((button) => (button as HTMLButtonElement).click()).catch(() => undefined),
  ])
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Midnight Velocity")
})
