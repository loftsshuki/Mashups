import { expect, test, type Page } from "@playwright/test"
import { greenProjectInputSchema } from "../src/lib/green-room/project-schema"

const pageErrors = new WeakMap<Page, string[]>()
test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  pageErrors.set(page, errors)
  page.on("pageerror", (error) => errors.push(error.message))
  await page.route("**/api/green/events", (route) => route.fulfill({ status: 202, json: { accepted: true, persisted: true } }))
})
test.afterEach(async ({ page }) => { expect(pageErrors.get(page)).toEqual([]) })

async function storedDraft(page: Page) {
  return page.evaluate(() => new Promise<{ input: { id: string; title: string; intensity: number; selectedArrangement: string | null; expectedRevision: number; sources: { leftId: string; rightId: string } }; audioSizes: number[] }>((resolve, reject) => {
    const request = indexedDB.open("mashups-projects", 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const tx = db.transaction(["settings", "drafts"], "readonly")
      const active = tx.objectStore("settings").get("active")
      active.onsuccess = () => {
        const row = tx.objectStore("drafts").get(active.result)
        row.onsuccess = () => resolve({ input: row.result.input, audioSizes: row.result.renders.map((render: { audioBlob: Blob }) => render.audioBlob.size) })
      }
      tx.oncomplete = () => db.close()
      tx.onerror = () => reject(tx.error)
    }
  }))
}
async function openStudio(page: Page, path = "/create?fresh=1") {
  await page.goto(path)
  await expect(page.getByTestId("generate-mashups")).toBeEnabled()
  await expect(page.getByTestId("device-save-status")).toHaveText("Saved on this device")
}

test("a kept mashup recovers its name, energy and playable audio after refresh", async ({ page }, testInfo) => {
  await openStudio(page)
  await page.getByLabel("My mashup name").fill("Boston after dark")
  await page.getByLabel("Room energy").fill("90")
  await page.getByTestId("generate-mashups").click()
  await expect(page.getByRole("button", { name: "Hear it", exact: true })).toHaveCount(3)
  await page.getByRole("button", { name: "Keep", exact: true }).last().click()
  await expect.poll(async () => (await storedDraft(page)).input.selectedArrangement).toBe("drop-swap")
  const before = await storedDraft(page)
  expect(before.audioSizes).toHaveLength(3)
  expect(before.audioSizes.every((size) => size > 1_000_000)).toBe(true)
  await page.reload()
  await expect(page.getByText("Recovered your device draft.")).toBeVisible()
  await expect(page.getByLabel("My mashup name")).toHaveValue("Boston after dark")
  await expect(page.getByLabel("Room energy")).toHaveValue("90")
  await expect(page.getByRole("button", { name: "Hear it", exact: true })).toHaveCount(3)
  await page.getByRole("button", { name: "Hear it", exact: true }).last().click()
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible()
  expect(await storedDraft(page)).toEqual(before)
  await page.screenshot({ path: testInfo.outputPath("recovered-studio.png"), fullPage: true })
  await page.getByRole("button", { name: "Swap source tracks" }).click()
  await expect.poll(async () => (await storedDraft(page)).audioSizes.length).toBe(0)
  await expect(page.getByRole("button", { name: "Hear it", exact: true }).first()).toBeDisabled()
})

test("save keeps the exact draft destination through login, signup and back to the studio", async ({ page }) => {
  await page.route("**/api/green/projects", (route) => route.fulfill({ status: 401, json: { code: "unauthenticated", error: "Sign in." } }))
  await openStudio(page)
  await page.getByLabel("My mashup name").fill("Keep this idea")
  await page.getByTestId("save-project").click()
  await expect(page).toHaveURL(/\/login\?next=/)
  const destination = new URL(page.url()).searchParams.get("next")!
  expect(destination).toMatch(/^\/create\?project=[a-f0-9-]{36}$/)
  await expect(page.locator('input[name="next"]')).toHaveValue(destination)
  await page.getByRole("link", { name: "Start free.", exact: true }).click()
  await expect(page).toHaveURL(/\/signup\?next=/)
  await expect(page.locator('input[name="next"]')).toHaveValue(destination)
  await page.getByRole("link", { name: "Back to Mashups", exact: true }).click()
  await expect(page.getByLabel("My mashup name")).toHaveValue("Keep this idea")
  await expect(page.getByTestId("device-save-status")).toHaveText("Saved on this device")
})

test("confirmed account recipes track revisions and keep local changes after a conflict", async ({ page }) => {
  let saves = 0
  await page.route("**/api/green/projects", async (route) => {
    const input = greenProjectInputSchema.parse(route.request().postDataJSON())
    expect(input.expectedRevision).toBe(saves)
    saves += 1
    if (saves === 2) { await route.fulfill({ status: 409, json: { code: "conflict", error: "This project changed elsewhere. Save a new copy." } }); return }
    const { expectedRevision: _revision, ...recipe } = input
    await route.fulfill({ json: { project: { ...recipe, revision: 1, status: "draft", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } } })
  })
  await openStudio(page)
  await page.getByTestId("save-project").click()
  await expect(page.getByTestId("account-save-status")).toHaveText("Account recipe is up to date")
  await page.getByLabel("My mashup name").fill("A later idea")
  await expect(page.getByTestId("account-save-status")).toContainText("changes on this device")
  await page.getByTestId("save-project").click()
  await expect(page.getByText("This project changed elsewhere. Save a new copy.", { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByLabel("My mashup name")).toHaveValue("A later idea")
  await expect(page.getByTestId("account-save-status")).toContainText("changes on this device")
})

test("an account recipe opens on a new device without pretending its audio is cached", async ({ page }) => {
  await openStudio(page)
  const { input: { id: _id, expectedRevision: _revision, ...input } } = await storedDraft(page)
  const id = "50000000-0000-4000-8000-000000000009"
  await page.route(`**/api/green/projects?id=${id}`, (route) => route.fulfill({ json: { project: { ...input, id, title: "From another device", selectedArrangement: "drop-swap", revision: 4, status: "draft", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } } }))
  await openStudio(page, `/create?project=${id}`)
  await expect(page.getByLabel("My mashup name")).toHaveValue("From another device")
  await expect(page.getByText(/Generate the audio to hear it on this device/)).toBeVisible()
  await expect(page.getByTestId("account-save-status")).toHaveText("Account recipe is up to date")
  await expect(page.getByRole("button", { name: "Hear it", exact: true }).first()).toBeDisabled()
  expect((await storedDraft(page)).input.expectedRevision).toBe(4)
  await page.getByTestId("generate-mashups").click()
  await expect.poll(async () => (await storedDraft(page)).audioSizes.length).toBe(3)
  expect((await storedDraft(page)).input.selectedArrangement).toBe("drop-swap")
})

test("another tab cannot overwrite a device draft and can preserve edits in a new copy", async ({ page, context }) => {
  await openStudio(page)
  const originalId = (await storedDraft(page)).input.id
  const other = await context.newPage()
  await other.route("**/api/green/events", (route) => route.fulfill({ status: 202, json: { accepted: true, persisted: true } }))
  await openStudio(other, `/create?project=${originalId}`)
  await other.getByLabel("My mashup name").fill("Saved in tab two")
  await expect.poll(async () => (await storedDraft(other)).input.title).toBe("Saved in tab two")
  await page.getByLabel("My mashup name").fill("My conflicting idea")
  await expect(page.getByTestId("device-save-status")).toContainText("Another tab changed this draft")
  expect((await storedDraft(page)).input.title).toBe("Saved in tab two")
  await page.getByRole("button", { name: "Save a new copy" }).click()
  await expect.poll(async () => (await storedDraft(page)).input.id).not.toBe(originalId)
  await page.goto("/projects")
  await expect(page.getByRole("heading", { name: "Saved in tab two" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "My conflicting idea" })).toBeVisible()
  await other.close()
})

test("blocked device storage never reports a successful local save or abandons audio for sign-in", async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, "indexedDB", { get() { throw new DOMException("Device storage is blocked", "SecurityError") } }) })
  await page.route("**/api/green/projects", (route) => route.fulfill({ status: 401, json: { code: "unauthenticated", error: "Sign in." } }))
  await page.goto("/create?fresh=1")
  await expect(page.getByTestId("generate-mashups")).toBeEnabled()
  await expect(page.getByTestId("device-save-status")).toContainText("Device storage is blocked")
  await page.getByTestId("save-project").click()
  await expect(page.getByText(/Enable device storage before leaving for sign-in/)).toBeVisible()
  await expect(page).toHaveURL(/\/create\?fresh=1$/)
  await expect(page.getByTestId("account-save-status")).not.toContainText("up to date")
})

test("signup validates matching passwords and auth callbacks cannot leave this app", async ({ page, request }) => {
  await page.goto("/signup?next=%2Fprojects")
  await page.getByLabel("Your handle").fill("night-mix")
  await page.getByLabel("Email", { exact: true }).fill("test@example.com")
  await page.getByLabel("Password", { exact: true }).fill("long-password")
  await page.getByLabel("Confirm password", { exact: true }).fill("different-password")
  await page.getByRole("checkbox").check()
  await page.getByTestId("auth-submit").click()
  await expect(page.getByRole("alert").filter({ hasText: "Your passwords do not match." })).toBeVisible()
  const response = await request.get("/auth/callback?next=https://outside.example", { maxRedirects: 0 })
  expect(response.status()).toBe(307)
  expect(response.headers().location).toMatch(/^\/login\?/)
  const target = new URL(response.headers().location, page.url())
  expect(target.origin).toBe(new URL(page.url()).origin)
  expect(target.pathname).toBe("/login")
  expect(target.searchParams.get("next")).toBe("/create")
})

test("project endpoints require identity and never return an invented save receipt", async ({ request }) => {
  for (const response of [await request.get("/api/green/projects"), await request.put("/api/green/projects", { data: { title: "Anonymous project" } })]) {
    expect([401, 503]).toContain(response.status())
    expect(response.headers()["cache-control"]).toContain("no-store")
    const body = await response.json()
    expect(body.code).toMatch(/^(unauthenticated|unavailable)$/)
    expect(body.project).toBeUndefined()
  }
})

test("the offline shell never substitutes a personal project or account page", async ({ page }) => {
  await openStudio(page)
  const { input: { id } } = await storedDraft(page)
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)
  const project = await page.goto(`/create?project=${id}`)
  expect(project?.fromServiceWorker()).toBe(false)
  await expect(page.getByTestId("generate-mashups")).toBeEnabled()
  const library = await page.goto("/projects")
  expect(library?.fromServiceWorker()).toBe(false)
  const shell = await page.goto("/create?source=pwa")
  expect(shell?.fromServiceWorker()).toBe(true)
  const cachedShell = await page.evaluate(async () => {
    const response = await (await caches.open("mashups-shell-v3")).match("/create")
    return response ? { url: response.url, html: await response.text() } : null
  })
  expect(cachedShell).not.toBeNull()
  expect(cachedShell?.url).not.toContain("project=")
  expect(cachedShell?.html).not.toContain(id)
})
