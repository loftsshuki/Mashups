import { GREEN_PROJECT_SCHEMA_VERSION, GREEN_PROTOTYPE_RENDERER_VERSION, type GreenProjectInput } from "@mashups/contracts"
import type { GreenMashupRender } from "@/lib/audio/green-demo-engine"
import { buildGreenArrangementPlans } from "@/lib/audio/green-arrangements"
import { GREEN_CATALOG_MANIFEST } from "@/lib/catalog/catalog-manifest"
import { assessGreenPair, getGreenTrack } from "@/lib/catalog/green-catalog"
import { greenProjectInputSchema } from "./project-schema"

export type StoredRender = Omit<GreenMashupRender, "audioUrl">
export type GreenLocalDraft = {
  schemaVersion: typeof GREEN_PROJECT_SCHEMA_VERSION
  rendererVersion: string
  input: GreenProjectInput
  renders: StoredRender[]
  renderKey: string
  cloudFingerprint: string | null
  localRevision: number
  savedAt: string
}

export function recipeFingerprint(input: GreenProjectInput) {
  return JSON.stringify([input.title, input.sources, input.intensity, input.selectedArrangement])
}

export function renderFingerprint(input: GreenProjectInput) {
  return JSON.stringify([GREEN_PROTOTYPE_RENDERER_VERSION, input.sources, input.intensity])
}

export function newLocalDraft(leftId: string, rightId: string): GreenLocalDraft {
  const input: GreenProjectInput = {
    id: crypto.randomUUID(), title: `${getGreenTrack(leftId)?.title ?? "Source A"} × ${getGreenTrack(rightId)?.title ?? "Source B"}`,
    sources: { kind: "prototype", leftId, rightId, catalogVersion: GREEN_CATALOG_MANIFEST.catalogVersion },
    intensity: 82, selectedArrangement: null, expectedRevision: 0,
  }
  return { schemaVersion: GREEN_PROJECT_SCHEMA_VERSION, rendererVersion: GREEN_PROTOTYPE_RENDERER_VERSION, input, renders: [], renderKey: renderFingerprint(input), cloudFingerprint: null, localRevision: 0, savedAt: new Date().toISOString() }
}

export function parseLocalDraft(value: unknown): GreenLocalDraft | null {
  if (!value || typeof value !== "object") return null
  const row = value as Partial<GreenLocalDraft>
  const parsed = greenProjectInputSchema.safeParse(row.input)
  if (row.schemaVersion !== GREEN_PROJECT_SCHEMA_VERSION || !parsed.success || parsed.data.sources.kind !== "prototype"
    || !Number.isInteger(row.localRevision) || Number(row.localRevision) < 1 || typeof row.savedAt !== "string"
    || !Number.isFinite(Date.parse(row.savedAt))) return null
  const input = parsed.data
  const sources = input.sources
  if (sources.kind !== "prototype") return null
  const left = getGreenTrack(sources.leftId)
  const right = getGreenTrack(sources.rightId)
  if (!left || !right) return null
  const plans = buildGreenArrangementPlans(left, right, assessGreenPair(left, right))
  const cacheCurrent = row.rendererVersion === GREEN_PROTOTYPE_RENDERER_VERSION && row.renderKey === renderFingerprint(input) && sources.catalogVersion === GREEN_CATALOG_MANIFEST.catalogVersion
  const stored = Array.isArray(row.renders) ? row.renders : []
  const renders = cacheCurrent ? stored.filter((render): render is StoredRender => Boolean(render && typeof render === "object"
    && render.audioBlob instanceof Blob && render.audioBlob.type === "audio/wav" && render.audioBlob.size > 44 && render.audioBlob.size <= 12_000_000
    && ["vocal-a-over-b", "vocal-b-over-a", "drop-swap"].includes(render.style)
    && typeof render.title === "string" && typeof render.description === "string"
    && Number.isFinite(render.duration) && render.duration > 0 && render.duration < 120
    && Number.isFinite(render.qualityScore) && render.metrics && Number.isFinite(render.metrics.peakDb)
    && Number.isFinite(render.metrics.rmsDb) && Number.isInteger(render.metrics.clippedSamples) && render.metrics.clippedSamples >= 0)).slice(0, 3) : []
  const uniqueRenders = [...new Map(renders.map((render) => {
    const plan = plans.find((candidate) => candidate.id === render.style)!
    return [render.style, { ...render, plan, title: plan.title, description: plan.description, qualityScore: plan.qualityScore }]
  })).values()]
  const currentInput = { ...input, sources: { ...sources, catalogVersion: GREEN_CATALOG_MANIFEST.catalogVersion } }
  return { schemaVersion: GREEN_PROJECT_SCHEMA_VERSION, rendererVersion: GREEN_PROTOTYPE_RENDERER_VERSION,
    input: currentInput,
    renders: uniqueRenders, renderKey: renderFingerprint(currentInput), cloudFingerprint: typeof row.cloudFingerprint === "string" ? row.cloudFingerprint : null,
    localRevision: row.localRevision!, savedAt: row.savedAt,
  }
}

export async function restoreDraftAudio(draft: GreenLocalDraft): Promise<GreenMashupRender[]> {
  const renders = await Promise.all(draft.renders.map(async (render) => {
    const buffer = await render.audioBlob.slice(0, 44).arrayBuffer()
    if (buffer.byteLength !== 44) return null
    const bytes = new DataView(buffer)
    // This renderer writes PCM stereo WAV at 22,050 Hz. Reject incomplete caches.
    if (bytes.getUint32(0) !== 0x52494646 || bytes.getUint32(8) !== 0x57415645
      || bytes.getUint32(12) !== 0x666d7420 || bytes.getUint32(16, true) !== 16
      || bytes.getUint16(20, true) !== 1 || bytes.getUint16(22, true) !== 2
      || bytes.getUint32(24, true) !== 22050 || bytes.getUint16(34, true) !== 16
      || bytes.getUint32(36) !== 0x64617461 || bytes.getUint32(40, true) + 44 !== render.audioBlob.size) return null
    return render
  }))
  return renders.filter((render): render is StoredRender => render !== null).map((render) => ({ ...render, audioUrl: URL.createObjectURL(render.audioBlob) }))
}

export type LocalDraftSummary = { id: string; title: string; savedAt: string; audioCount: number }
export async function listLocalDrafts(): Promise<LocalDraftSummary[]> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("drafts", "readonly")
    const request = transaction.objectStore("drafts").openCursor()
    const summaries: LocalDraftSummary[] = []
    request.onsuccess = () => {
      const cursor = request.result
      if (!cursor) return
      const draft = parseLocalDraft(cursor.value)
      if (draft) summaries.push({ id: draft.input.id, title: draft.input.title, savedAt: draft.savedAt, audioCount: draft.renders.length })
      cursor.continue()
    }
    transaction.oncomplete = () => resolve(summaries.sort((a, b) => b.savedAt.localeCompare(a.savedAt)))
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

let databasePromise: Promise<IDBDatabase> | undefined
function openDatabase() {
  if (!databasePromise) databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("Browser storage is unavailable.")); return }
    const request = indexedDB.open("mashups-projects", 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore("drafts", { keyPath: "input.id" })
      request.result.createObjectStore("settings")
    }
    request.onsuccess = () => {
      request.result.onversionchange = () => { request.result.close(); databasePromise = undefined }
      resolve(request.result)
    }
    request.onerror = () => { databasePromise = undefined; reject(request.error) }
    request.onblocked = () => { databasePromise = undefined; reject(new Error("Close another Mashups tab to update draft storage.")) }
  })
  return databasePromise
}

export async function readLocalDraft(id?: string): Promise<GreenLocalDraft | null> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["drafts", "settings"], "readonly")
    let result: unknown
    const read = (key: string) => {
      const request = transaction.objectStore("drafts").get(key)
      request.onsuccess = () => { result = request.result }
    }
    if (id) read(id)
    else {
      const active = transaction.objectStore("settings").get("active")
      active.onsuccess = () => { if (typeof active.result === "string") read(active.result) }
    }
    transaction.oncomplete = () => {
      const parsed = parseLocalDraft(result)
      if (result && !parsed) reject(new Error("This device draft cannot be read. Start a new copy to continue."))
      else resolve(parsed)
    }
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

export async function writeLocalDraft(draft: GreenLocalDraft, expectedRevision: number): Promise<number> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["drafts", "settings"], "readwrite")
    const store = transaction.objectStore("drafts")
    const current = store.get(draft.input.id)
    let conflict = false
    current.onsuccess = () => {
      if ((current.result?.localRevision ?? 0) !== expectedRevision) { conflict = true; transaction.abort(); return }
      store.put({ ...draft, localRevision: expectedRevision + 1, savedAt: new Date().toISOString() })
      transaction.objectStore("settings").put(draft.input.id, "active")
    }
    transaction.oncomplete = () => resolve(expectedRevision + 1)
    transaction.onabort = () => reject(new Error(conflict ? "Another tab changed this draft. Save a new copy to preserve your edits." : "This browser could not save the audio. Keep this tab open."))
    transaction.onerror = () => reject(transaction.error ?? new Error("Draft storage is unavailable."))
  })
}
