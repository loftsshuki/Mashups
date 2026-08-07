import { expect, test } from "@playwright/test"

const errors = new WeakMap<object, string[]>()

test.beforeEach(async ({ page }) => {
  const messages: string[] = []
  errors.set(page, messages)
  page.on("pageerror", (error) => messages.push(error.message))
  page.on("console", (message) => { if (message.type() === "error") messages.push(message.text()) })
})

test.afterEach(async ({ page }) => {
  expect(errors.get(page) ?? []).toEqual([])
})

test("founding intake hands a qualified campaign to the operator", async ({ page }) => {
  await page.goto("/pilot/new?demo=1")
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/BRING\s*THE\s*TRACK/)
  await expect(page.getByText("Device-local / no server write")).toBeVisible()
  await page.getByLabel("Campaign name").fill("Playwright Local Pilot")
  await page.getByTestId("submit-pilot").click()
  await expect(page.getByTestId("pilot-result")).toContainText("Saved on this device")
  await page.getByRole("link", { name: "Open operator setup" }).click()
  await expect(page).toHaveURL(/\/operator\?demo=1/)
  await page.getByTestId("restore-operator").click()
  await expect(page.getByText("Operator desk / Playwright Local Pilot")).toBeVisible()
  await page.getByTestId("save-operator").click()
  await expect(page.getByTestId("operator-result")).toContainText("Readiness is 88%")
  const packetDownload = page.waitForEvent("download")
  await page.getByTestId("export-packet-md").click()
  expect((await packetDownload).suggestedFilename()).toBe("nia-vale-midnight-velocity-mashups-pilot.md")
})

test("outreach pipeline advances targets and exports a clean CSV", async ({ page, request }) => {
  await page.goto("/outreach?demo=1")
  await expect(page.getByTestId("outreach-pipeline")).toBeVisible()
  await expect(page.getByText("Device-local / labeled seed")).toBeVisible()
  await page.getByTestId("advance-prospect-5").click()
  await expect(page.getByTestId("outreach-result")).toContainText("moved to qualified")

  await page.getByRole("button", { name: "Add target" }).click()
  await page.getByLabel("Entity").fill("Playwright Records")
  await page.getByLabel("Genres").fill("House")
  await page.getByTestId("save-prospect").click()
  await expect(page.getByText("Playwright Records")).toBeVisible()
  await page.reload()
  await page.getByTestId("restore-outreach").click()
  await expect(page.getByText("Playwright Records")).toBeVisible()

  await page.getByTestId("import-outreach-input").setInputFiles({ name: "prospects.csv", mimeType: "text/csv", buffer: Buffer.from("entity_name,entity_type,genres,priority\nImported Signal,label,House | Dance,5") })
  await expect(page.getByText("Imported Signal")).toBeVisible()
  const csvDownload = page.waitForEvent("download")
  await page.getByTestId("export-outreach").click()
  expect((await csvDownload).suggestedFilename()).toBe("mashups-outreach-pipeline.csv")

  const response = await request.get("/api/pilot/outreach/export?demo=1")
  expect(response.status()).toBe(200)
  expect(response.headers()["content-type"]).toContain("text/csv")
  expect(await response.text()).toContain("Night Current Records")
})

test("readiness board reports real blockers instead of masking them", async ({ page }, testInfo) => {
  await page.goto("/readiness?demo=1")
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/SHIP\s*NOTHING\s*ON FAITH/)
  await expect(page.getByRole("heading", { name: "Production Supabase reachable" })).toBeVisible()
  await expect(page.getByText("Hard blockers")).toBeVisible()
  if (testInfo.project.name.startsWith("mobile")) {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  }
})

test("all fourteen domination systems remain visible", async ({ page }) => {
  await page.goto("/domination?demo=1")
  await expect(page.getByTestId("domination-system")).toHaveCount(14)
})

test("rightsholder offer explains fit and opens the portable intake", async ({ page }, testInfo) => {
  await page.goto("/partner")
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/YOUR TRACK\s*DESERVES\s*A FAIR TEST/)
  await expect(page.getByRole("link", { name: "Build a private brief" })).toHaveAttribute("href", "/pilot/new?demo=1")
  await expect(page.getByText("We guarantee the work. Never the fantasy.")).toBeVisible()
  if (testInfo.project.name.startsWith("mobile")) {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  }
})
