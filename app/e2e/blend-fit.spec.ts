import { expect, test } from "@playwright/test"

function wav(silent = false) {
  const sr = 11025, length = sr * 16
  const buffer = Buffer.alloc(44 + length * 2)
  buffer.write("RIFF"); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write("WAVEfmt ", 8)
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sr, 24); buffer.writeUInt32LE(sr * 2, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34)
  buffer.write("data", 36); buffer.writeUInt32LE(length * 2, 40)
  if (!silent) for (let i = 0; i < length; i++) {
    const beat = (i / sr) % 0.5
    buffer.writeInt16LE(Math.round(Math.sin(i * 1.9) * Math.exp(-beat * 120) * 16000), 44 + i * 2)
  }
  return buffer
}

test("local files are analyzed in the browser and edits invalidate the result", async ({ page }) => {
  const errors: string[] = [], writes: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("request", (request) => { if (request.method() === "POST" && !request.url().includes("__nextjs")) writes.push(request.url()) })
  await page.goto("/create/blend-fit")
  await expect(page.getByTestId("blend-fit-workbench")).toHaveClass(/ph-no-capture/)
  const check = page.getByRole("button", { name: "Check Blend Fit", exact: true })
  await expect(check).toBeDisabled()
  await page.getByLabel("Lead audio file", { exact: true }).setInputFiles({ name: "own-vocal.wav", mimeType: "audio/wav", buffer: wav() })
  await page.getByLabel("Backing audio file", { exact: true }).setInputFiles({ name: "own-backing.wav", mimeType: "audio/wav", buffer: wav() })
  await expect(check).toBeEnabled()
  await check.click()
  const result = page.getByTestId("blend-fit-result")
  await expect(result.getByRole("heading", { name: "Uncertain", exact: true })).toBeVisible({ timeout: 30000 })
  await expect(result).toContainText("no pitch shift is recommended")
  await expect(result).toContainText("120")
  await page.getByLabel("Target tempo / BPM").fill("130")
  await expect(result).toHaveCount(0)
  await page.getByLabel("lead section start", { exact: true }).fill("15")
  await check.click()
  await expect(page.getByTestId("blend-fit-workbench").getByRole("alert")).toContainText("within the file")
  await expect(result).toHaveCount(0)
  expect(writes).toEqual([])
  expect(errors).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test("silence, decode failure and replacement never reuse a previous fit", async ({ page }) => {
  await page.goto("/create/blend-fit")
  await page.getByRole("button", { name: "Try demo ingredients" }).click()
  await expect(page.getByLabel("lead section length", { exact: true })).toHaveValue("12")
  await page.getByRole("button", { name: "Check Blend Fit", exact: true }).click()
  await expect(page.getByTestId("blend-fit-result")).toBeVisible({ timeout: 30000 })
  await page.getByLabel("Lead audio file", { exact: true }).setInputFiles({ name: "broken.wav", mimeType: "audio/wav", buffer: Buffer.from("not audio") })
  await expect(page.getByTestId("blend-fit-workbench").getByRole("alert")).toContainText("could not read")
  await expect(page.getByTestId("blend-fit-result")).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Check Blend Fit", exact: true })).toBeDisabled()
  await page.getByLabel("Lead audio file", { exact: true }).setInputFiles({ name: "silence.wav", mimeType: "audio/wav", buffer: wav(true) })
  await page.getByRole("button", { name: "Check Blend Fit", exact: true }).click()
  await expect(page.getByTestId("blend-fit-result").getByRole("heading", { name: "Difficult pairing" })).toBeVisible({ timeout: 30000 })
  await expect(page.getByTestId("blend-fit-result")).toContainText("almost no audible signal")
})

test("the creation flow checks the selected demo parts before generation and resets on a new pair", async ({ page }) => {
  await page.route("**/api/green/events", (route) => route.fulfill({ status: 202, json: { accepted: true } }))
  await page.goto("/create?fresh=1")
  await expect(page.getByText("Prototype recipe check")).toBeVisible()
  await expect(page.getByText(/phrase lock/)).toHaveCount(0)
  await page.getByRole("button", { name: "Open Blend Fit" }).click()
  await page.getByRole("button", { name: "Load this demo pair" }).click()
  await expect(page.getByText("Signal Bloom — synthesized lead.wav", { exact: true })).toBeVisible()
  await expect(page.getByText("Heat Map — synthesized backing.wav", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Check Blend Fit", exact: true }).click()
  await expect(page.getByTestId("blend-fit-result")).toBeVisible({ timeout: 30000 })
  await expect(page.getByTestId("generate-mashups")).toBeEnabled()
  const deck = page.getByRole("combobox", { name: "B / Groove track" })
  const options = await deck.locator("option").evaluateAll((nodes) => nodes.map((n) => (n as HTMLOptionElement).value))
  await deck.selectOption(options.find((id) => id !== "heat-map" && id !== "signal-bloom")!)
  await expect(page.getByTestId("blend-fit-result")).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Check Blend Fit", exact: true })).toBeDisabled()
})

test("cancelled analysis cannot repopulate a stale result", async ({ page }) => {
  await page.addInitScript(() => {
    const OriginalWorker = window.Worker
    window.Worker = class extends OriginalWorker {
      postMessage(message: unknown, options?: Transferable[] | StructuredSerializeOptions) {
        setTimeout(() => { if (Array.isArray(options)) super.postMessage(message, options); else super.postMessage(message, options) }, 400)
      }
    }
  })
  await page.goto("/create/blend-fit")
  await page.getByRole("button", { name: "Try demo ingredients" }).click()
  await page.getByRole("button", { name: "Check Blend Fit", exact: true }).click()
  await page.getByRole("button", { name: "Cancel check" }).click()
  await page.getByLabel("Target tempo / BPM").fill("114")
  await expect(page.getByTestId("blend-fit-result")).toHaveCount(0)
  await page.getByRole("button", { name: "Check Blend Fit", exact: true }).click()
  await expect(page.getByTestId("blend-fit-result")).toContainText("114 BPM", { timeout: 30000 })
})
