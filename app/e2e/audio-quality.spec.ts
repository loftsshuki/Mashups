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

test("@smoke quality lab exposes deterministic evidence and safe rejects", async ({ page }) => {
  await page.goto("/lab/audio")

  await expect(page.getByRole("heading", { level: 1 })).toContainText("GOOD IS")
  await expect(page.getByText("72", { exact: true })).toBeVisible()
  await expect(page.getByText("100%", { exact: true })).toBeVisible()
  await page.getByTestId("lab-filter-rejected").click()
  await page.locator('[data-testid^="lab-case-"]').first().click()
  await expect(page.getByText("Preflight rejected", { exact: true })).toBeVisible()
})

test("@smoke signed Green Catalog and install metadata are public", async ({ request }) => {
  const catalog = await request.get("/api/green/catalog")
  expect(catalog.status()).toBe(200)
  const catalogPayload = await catalog.json()
  expect(catalogPayload).toMatchObject({
    mode: "prototype",
    verification: { verified: true },
  })
  expect(catalogPayload.tracks).toHaveLength(4)
  expect(catalogPayload.tracks[0]).toMatchObject({ rightsPassportId: "MASH-GREEN-0001" })

  const manifest = await request.get("/manifest.webmanifest")
  expect(manifest.status()).toBe(200)
  await expect(manifest.json()).resolves.toMatchObject({ short_name: "Mashups", start_url: "/create?source=pwa" })
})

test("three arrangements render and unlock video-only sharing", async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto("/create")

  await expect(page.getByText(/Three controlled experiments/i)).toBeVisible()
  await page.getByTestId("generate-mashups").click()
  await expect(page.getByText(/Quality \d+ \/ 100/)).toHaveCount(3, { timeout: 90_000 })
  await expect(page.getByRole("button", { name: /Render and share/i })).toBeVisible()
  await expect(page.getByText(/no WAV, MP3, stems/i)).toBeVisible()
  await expect(page.getByRole("link", { name: /Download WAV|Download MP3/i })).toHaveCount(0)
})

test("@smoke artist pilot package exposes every operating document", async ({ page }) => {
  await page.goto("/partner/green-room")

  await expect(page.getByRole("heading", { level: 1 })).toContainText("OPEN THE SONG")
  await expect(page.locator('a[download]')).toHaveCount(5)
  await expect(page.getByRole("link", { name: /Rights Passport CSV/i })).toHaveAttribute("href", "/downloads/green-room-rights-passport.csv")
  await expect(page.getByText(/Video leaves/i)).toBeVisible()
})
