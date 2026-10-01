import { readFile } from "node:fs/promises"
import { expect, test } from "@playwright/test"

const path = "/reports/listening-bench/index.html"

test("listening comparison plays, switches, saves, reloads, and exports on this device", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", error => errors.push(error.message))
  await page.goto(path)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Same loop. Different processing.")
  await expect(page.getByText(/real-song and stem-quality trials are still ahead/)).toBeVisible()
  await expect(page.getByRole("button", { name: "Download results" })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Sample A", exact: true })).toBeDisabled()
  await expect(page.getByText("Playback measurements", { exact: true })).toBeHidden()
  await page.getByLabel("I listen as a").selectOption("producer")
  await page.getByRole("button", { name: "Play A", exact: true }).click()
  await expect(page.locator(".listen-status")).toContainText("Sample A: 3.0 / 3 seconds", { timeout: 15000 })
  const position = await page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.currentTime)
  await page.getByRole("button", { name: "Play B", exact: true }).click()
  await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.currentTime), { timeout: 10000 }).toBeGreaterThanOrEqual(position - .2)
  await expect(page.locator(".listen-status")).toContainText("You have heard every sample", { timeout: 15000 })
  await page.getByRole("button", { name: "Sample B", exact: true }).click()
  await page.getByLabel("What did you hear?").fill("Automated UI check; this is not a listener quality rating.")
  await expect(page.getByText("1 of 1 compared")).toBeVisible()
  await page.reload()
  await expect(page.getByRole("button", { name: "Sample B", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByLabel("I listen as a")).toHaveValue("producer")
  const fileEvent = page.waitForEvent("download")
  await page.getByRole("button", { name: "Download results" }).click()
  const file = await fileEvent
  const results = JSON.parse(await readFile((await file.path())!, "utf8"))
  expect(results.listenerRole).toBe("producer")
  const response = results.responses["tempo-calibration"]
  expect(response.notes).toContain("not a listener quality rating")
  expect(Object.values(response.heardSeconds).every(seconds => typeof seconds === "number" && seconds >= 3)).toBe(true)
  const bundle = await page.locator("#bench-data").textContent()
  expect(bundle).not.toMatch(/rubberband|coupled-rate|operator|sourceSha256/i)
  expect(errors).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test("missing playback stays unvotable and explains the failure", async ({ page }) => {
  await page.route("**/audio/*.wav", route => route.fulfill({ status: 404, body: "Audio unavailable" }))
  await page.goto(path)
  await page.getByRole("button", { name: "Play A", exact: true }).click()
  await expect(page.locator(".listen-status")).toContainText("Playback did not start")
  await expect(page.getByRole("button", { name: "Sample A", exact: true })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Download results" })).toBeDisabled()
})

test("blocked browser storage gives an explicit download reminder", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("Storage blocked for this test") }
    Storage.prototype.setItem = () => { throw new Error("Storage blocked for this test") }
  })
  await page.goto(path)
  await expect(page.locator("#storage-status")).toContainText("Download your results before closing this page")
  await expect(page.getByRole("button", { name: "Play A", exact: true })).toBeEnabled()
})

test("the shortest supported excerpt can unlock a preference after playback", async ({ page }) => {
  const html = await readFile(new URL("../public/reports/listening-bench/index.html", import.meta.url), "utf8")
  const shortHtml = html.replaceAll('"durationSeconds":7,', '"durationSeconds":3,')
  await page.route(`**${path}`, route => route.fulfill({ contentType: "text/html", body: shortHtml }))
  await page.route("**/audio/*.wav", async route => {
    const filename = new URL(route.request().url()).pathname.split("/").at(-1)!
    const audio = await readFile(new URL(`../public/reports/listening-bench/audio/${filename}`, import.meta.url))
    let offset = 12
    while (audio.toString("ascii", offset, offset + 4) !== "data") offset += 8 + audio.readUInt32LE(offset + 4) + audio.readUInt32LE(offset + 4) % 2
    const byteLength = 3 * 44100 * 6
    const clip = Buffer.from(audio.subarray(0, offset + 8 + byteLength))
    clip.writeUInt32LE(clip.length - 8, 4); clip.writeUInt32LE(byteLength, offset + 4)
    await route.fulfill({ contentType: "audio/wav", body: clip })
  })
  await page.goto(path)
  await page.getByRole("button", { name: "Play A", exact: true }).click()
  await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.ended)).toBe(true)
  await page.getByRole("button", { name: "Play B", exact: true }).click()
  await expect(page.getByRole("button", { name: "Neither", exact: true })).toBeEnabled({ timeout: 10000 })
})
