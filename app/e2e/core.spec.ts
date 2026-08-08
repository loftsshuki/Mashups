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

test("canonical product routes load without silent sample data", async ({ page }) => {
  await page.goto("/explore")
  await expect(page).toHaveURL(/\/discover$/)
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Find a sound")
  await expect(page.getByText("Demo", { exact: true })).toHaveCount(0)
})

test("public creation starts inside the green catalog", async ({ page }) => {
  await page.goto("/create")

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Pick two")
  await expect(page.getByText(/No rips. No mystery samples/i)).toBeVisible()
  await expect(page.getByTestId("generate-mashups")).toBeEnabled()
  await expect(page.getByText("MASH-GREEN-0001", { exact: true })).toBeVisible()
  await expect(page.getByText("MASH-GREEN-0002", { exact: true })).toBeVisible()
})

test("legacy arbitrary-upload creation redirects into the green studio", async ({ page }) => {
  await page.goto("/create/ai")
  await expect(page).toHaveURL(/\/create$/)
  await expect(page.getByTestId("generate-mashups")).toBeEnabled()
})

test("creator completes and exports the labeled demo campaign", async ({ page }) => {
  await page.goto("/campaigns/new?demo=1")

  await expect(page.getByText(/Demo data is labeled/i)).toBeVisible()
  await page.getByTestId("load-demo").click()
  await expect(page.getByText(/Demo track loaded/i)).toBeVisible()

  await page.getByTestId("campaign-next").click()
  await page.getByTestId("generate-hooks").click()
  await expect(page.getByTestId("hook-0")).toBeVisible()
  await page.getByTestId("hook-0").click()

  await page.getByTestId("campaign-next").click()
  await page.getByRole("button", { name: /I own this source/i }).click()
  await page.getByTestId("confirm-rights").click()
  await expect(page.getByText(/MASH-OWNED/i)).toBeVisible()

  await page.getByTestId("campaign-next").click()
  await page.getByTestId("build-package").click()
  await expect(page.getByText(/Attributed campaign link/i)).toBeVisible()

  const downloadPromise = page.waitForEvent("download")
  await page.getByTestId("export-package").click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe("neon-run-launch.json")

  await page.getByTestId("campaign-next").click()
  await expect(page.getByText(/What to post next/i)).toBeVisible()
  await expect(page.getByText(/Winning structure/i)).toBeVisible()
})

test("mobile demo discovery retains navigation and labeled data", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Mobile-only viewport check")
  await page.goto("/discover?demo=1")
  await expect(page.getByText(/Demo data is labeled/i)).toBeVisible()
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  await expect(page.getByRole("button", { name: /menu/i })).toBeVisible()
})

test("sample analytics require explicit demo mode", async ({ request }) => {
  const liveResponse = await request.get("/api/analytics/creator")
  expect([401, 503]).toContain(liveResponse.status())

  const demoResponse = await request.get("/api/analytics/creator?demo=1")
  expect(demoResponse.status()).toBe(200)
  await expect(demoResponse.json()).resolves.toMatchObject({ mode: "demo" })
})
