import { expect, test } from "@playwright/test"

const conceptPath = process.env.E2E_CONCEPT_ROOT === "1" ? "/" : "/concepts/collision/index.html"
declare global {
  interface Window { collisionProbe: { starts: { when: number; offset: number }[]; gains: GainNode[] } }
}

test("audio sources start together, solo preserves position, and artwork can be frozen", async ({ page }) => {
  test.setTimeout(60000)
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.addInitScript(() => {
    window.collisionProbe = { starts: [], gains: [] }
    const BaseContext = window.AudioContext
    window.AudioContext = class extends BaseContext {
      createBufferSource() {
        const source = super.createBufferSource(), original = source.start.bind(source)
        source.start = (when = 0, offset = 0, duration?: number) => {
          window.collisionProbe.starts.push({ when, offset })
          original(when, offset, duration)
        }
        return source
      }
      createGain() { const node = super.createGain(); window.collisionProbe.gains.push(node); return node }
    }
  })
  await page.goto(conceptPath)
  await expect(page.locator("#stage")).toHaveAttribute("data-renderer", "webgl")
  await page.locator("#play").click()
  await expect(page.locator("#stage")).toHaveAttribute("data-playing", "true")
  const starts = await page.evaluate(() => window.collisionProbe.starts)
  expect(starts).toHaveLength(2)
  expect(starts[0]).toEqual(starts[1])
  await page.locator("#position").fill("7")
  const before = Number(await page.locator("#position").inputValue())
  await page.locator('[data-mix="lead"]').click()
  await expect.poll(() => page.evaluate(() => window.collisionProbe.gains[1].gain.value)).toBeLessThan(.01)
  await expect.poll(() => page.evaluate(() => window.collisionProbe.gains[2].gain.value)).toBeGreaterThan(.99)
  expect(Number(await page.locator("#position").inputValue())).toBeGreaterThanOrEqual(before)
  const animatedA = await page.locator("#world").screenshot()
  await page.waitForTimeout(180)
  const animatedB = await page.locator("#world").screenshot()
  expect(animatedA.equals(animatedB)).toBe(false)
  await page.locator('[data-view="still"]').click()
  await page.waitForTimeout(500)
  const stillA = await page.locator("#world").screenshot()
  await page.waitForTimeout(180)
  const stillB = await page.locator("#world").screenshot()
  expect(stillA.equals(stillB)).toBe(true)
  await expect(page.locator("#stage")).toHaveAttribute("data-playing", "true")
  await page.locator('[data-mix="both"]').click()
  await expect.poll(() => page.evaluate(() => window.collisionProbe.gains[1].gain.value)).toBeGreaterThan(.99)
  await page.locator("#play").click()
  await expect(page.locator("#stage")).toHaveAttribute("data-playing", "false")
  const paused = await page.locator("#position").inputValue()
  await page.waitForTimeout(180)
  expect(await page.locator("#position").inputValue()).toBe(paused)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(errors).toEqual([])
})

test("reduced motion starts with still artwork and audio remains usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(conceptPath)
  await expect(page.locator("#stage")).toHaveAttribute("data-view", "still")
  await page.locator("#play").click()
  await expect(page.locator("#stage")).toHaveAttribute("data-playing", "true")
  await page.locator("#position").fill("29.5")
  await expect(page.locator("#stage")).toHaveAttribute("data-playing", "false", { timeout: 5000 })
  await page.locator("#restart").click()
  await expect(page.locator("#stage")).toHaveAttribute("data-playing", "true")
  expect(Number(await page.locator("#position").inputValue())).toBeLessThan(3)
})

test("WebGL unavailability keeps audio and static artwork accessible", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", { value: function (type: string, ...options: unknown[]) {
      return type === "webgl" ? null : Reflect.apply(original, this, [type, ...options])
    } })
  })
  await page.goto(conceptPath)
  await expect(page.locator("#fallback")).toBeVisible()
  await expect(page.locator('[data-view="motion"]')).toBeDisabled()
  await page.locator("#play").click()
  await expect(page.locator("#stage")).toHaveAttribute("data-playing", "true")
})

test("unreadable audio displays an error and allows retry", async ({ page }) => {
  await page.route("**/demo.json", (route) => route.fulfill({ json: { mode: "files", duration: 30, bpm: 120, leadName: "Lead", backingName: "Backing", edition: "Test", credit: "Test", leadUrl: "./unreadable.mp3", backingUrl: "./unreadable.mp3" } }))
  await page.route("**/unreadable.mp3", (route) => route.fulfill({ body: "not audio", contentType: "audio/mpeg" }))
  await page.goto(conceptPath)
  await page.locator("#play").click()
  await expect(page.locator("#status")).toContainText(/decode|audio/i)
  await expect(page.locator("#play")).toBeEnabled()
  await expect(page.locator("#stage")).toHaveAttribute("data-playing", "false")
})
