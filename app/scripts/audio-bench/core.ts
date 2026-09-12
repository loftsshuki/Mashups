import { z } from "zod"

const id = z.string().regex(/^[a-z0-9][a-z0-9_-]{0,63}$/)
export const manifestSchema = z.object({
  version: z.literal(1),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(600),
  targetLufs: z.number().min(-30).max(-14).default(-20),
  peakCeilingDbtp: z.number().min(-6).max(-1).default(-1),
  cases: z.array(z.object({
    id,
    title: z.string().trim().min(1).max(160),
    prompt: z.string().trim().min(1).max(400),
    durationSeconds: z.number().min(3).max(90),
    variants: z.array(z.object({
      id,
      method: z.string().trim().min(1).max(300),
      path: z.string().min(1),
      startSeconds: z.number().min(0).default(0),
    }).strict()).min(2).max(4),
  }).strict()).min(1).max(50),
}).strict().superRefine((manifest, ctx) => {
  if (new Set(manifest.cases.map(c => c.id)).size !== manifest.cases.length) {
    ctx.addIssue({ code: "custom", message: "Case IDs must be unique." })
  }
  for (const entry of manifest.cases) {
    if (new Set(entry.variants.map(v => v.id)).size !== entry.variants.length) {
      ctx.addIssue({ code: "custom", message: `Variant IDs must be unique in ${entry.id}.` })
    }
  }
})

export type Manifest = z.infer<typeof manifestSchema>
export type Metrics = { integratedLufs: number; truePeakDbtp: number; loudnessRangeLu: number }
export type PublicSample = { id: string; label: string; url: string; durationSeconds: number; metrics: Metrics }
export type PublicPack = {
  version: 1
  id: string
  title: string
  description: string
  createdAt: string
  cases: { id: string; title: string; prompt: string; targetLufs: number; samples: PublicSample[] }[]
}

export function parseLoudness(stderr: string): Metrics {
  const record = stderr.match(/\{\s*"input_i"[\s\S]*?\}/g)?.at(-1)
  if (!record) throw new Error("FFmpeg did not return loudness measurements.")
  const raw = JSON.parse(record) as Record<string, unknown>
  const read = (key: string) => {
    const value = raw[key]
    if (typeof value !== "string" || value.trim() === "" || !Number.isFinite(Number(value))) {
      throw new Error("Audio is silent or its loudness could not be measured.")
    }
    return Number(value)
  }
  return { integratedLufs: read("input_i"), truePeakDbtp: read("input_tp"), loudnessRangeLu: read("input_lra") }
}

// One shared target prevents a high-crest-factor candidate from being limited
// or sounding louder than the others. Matching changes gain only, not dynamics.
export function sharedLoudnessTarget(metrics: Metrics[], requested: number, ceiling: number): number {
  if (metrics.length < 2 || ![requested, ceiling, ...metrics.flatMap(m => Object.values(m))].every(Number.isFinite)) {
    throw new Error("Finite measurements for at least two candidates are required.")
  }
  return Math.floor(Math.min(requested, ...metrics.map(m => m.integratedLufs + ceiling - 0.1 - m.truePeakDbtp)) * 100) / 100
}

export function validateMatchedAudio(metrics: Metrics[], target: number, ceiling: number) {
  if (metrics.some(m => !Object.values(m).every(Number.isFinite))) throw new Error("Output measurements are not finite.")
  if (metrics.some(m => Math.abs(m.integratedLufs - target) > 0.25)) throw new Error("Playback loudness matching failed; no listening bundle was released.")
  if (metrics.some(m => m.truePeakDbtp > ceiling + 0.05)) throw new Error("Playback exceeds the configured true-peak ceiling.")
}

export function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;")
}

export function inlineJson(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029")
}
