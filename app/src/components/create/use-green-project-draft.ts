"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { buildGreenProjectPath, GREEN_PROTOTYPE_RENDERER_VERSION, type GreenArrangementId, type GreenProjectInput } from "@mashups/contracts"
import { buildAuthPath } from "@/lib/auth/return-path"
import type { GreenMashupRender } from "@/lib/audio/green-demo-engine"
import { greenSavedProjectSchema } from "@/lib/green-room/project-schema"
import { recipeFingerprint, renderFingerprint, writeLocalDraft, type GreenLocalDraft } from "@/lib/green-room/local-draft"

export function useGreenProjectDraft(initial: GreenLocalDraft, recipe: { leftId: string; rightId: string; intensity: number; selectedArrangement: GreenArrangementId | null }, renders: GreenMashupRender[], enabled: boolean) {
  const router = useRouter()
  const [identity, setIdentity] = useState({ id: initial.input.id, revision: initial.input.expectedRevision, cloudFingerprint: initial.cloudFingerprint })
  const [title, setTitle] = useState(initial.input.title)
  const [localStatus, setLocalStatus] = useState("Opening draft storage…")
  const [accountMessage, setAccountMessage] = useState<string | null>(null)
  const [savingAccount, setSavingAccount] = useState(false)
  const localRevision = useRef(initial.localRevision)
  const activeId = useRef(identity.id)
  const queue = useRef<Promise<unknown>>(Promise.resolve())
  const mounted = useRef(true)
  const sources = useMemo(() => ({ ...initial.input.sources, leftId: recipe.leftId, rightId: recipe.rightId }), [initial.input.sources, recipe.leftId, recipe.rightId])
  const input: GreenProjectInput = useMemo(() => ({ id: identity.id, title: title.trim() || "Untitled mashup", sources, intensity: recipe.intensity, selectedArrangement: recipe.selectedArrangement, expectedRevision: identity.revision }), [identity.id, identity.revision, title, sources, recipe.intensity, recipe.selectedArrangement])
  const snapshot = useMemo<GreenLocalDraft>(() => ({ ...initial, input, rendererVersion: GREEN_PROTOTYPE_RENDERER_VERSION, renders: renders.map(({ audioUrl: _url, ...render }) => render), renderKey: renderFingerprint(input), cloudFingerprint: identity.cloudFingerprint }), [initial, input, renders, identity.cloudFingerprint])
  const latest = useRef(snapshot)
  useEffect(() => { latest.current = snapshot }, [snapshot])

  const persist = useCallback((value: GreenLocalDraft): Promise<boolean> => {
    const attempt = queue.current.catch(() => {}).then(async () => {
      if (activeId.current !== value.input.id) return false
      if (mounted.current) setLocalStatus("Saving on this device…")
      try {
        const revision = await writeLocalDraft(value, localRevision.current)
        if (activeId.current === value.input.id) {
          localRevision.current = revision
          if (mounted.current) {
            setLocalStatus("Saved on this device")
            if (window.location.pathname === "/create") window.history.replaceState(null, "", buildGreenProjectPath(value.input.id))
          }
        }
        return true
      } catch (error) {
        if (mounted.current && activeId.current === value.input.id) setLocalStatus(error instanceof Error ? error.message : "Device save failed. Keep this tab open.")
        return false
      }
    })
    queue.current = attempt
    return attempt
  }, [])

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])
  useEffect(() => { if (enabled) void persist(snapshot) }, [snapshot, persist, enabled])

  async function saveToAccount() {
    if (savingAccount || !enabled) return
    setSavingAccount(true)
    setAccountMessage(null)
    const captured = latest.current
    const localSaved = await persist(captured)
    try {
      const response = await fetch("/api/green/projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(captured.input), signal: AbortSignal.timeout(10_000) })
      const body = await response.json()
      if (response.status === 401) {
        if (!localSaved) { setAccountMessage("Enable device storage before leaving for sign-in so your audio can be recovered."); return }
        router.push(buildAuthPath("login", buildGreenProjectPath(captured.input.id)))
        return
      }
      if (!response.ok) { setAccountMessage(body.error ?? "Account save failed. Your device copy is unchanged."); return }
      const saved = greenSavedProjectSchema.parse(body.project)
      if (saved.id !== captured.input.id) throw new Error("Unexpected save receipt")
      if (activeId.current !== saved.id) return
      setIdentity({ id: saved.id, revision: saved.revision, cloudFingerprint: recipeFingerprint(captured.input) })
      window.history.replaceState(null, "", buildGreenProjectPath(saved.id))
      setAccountMessage("Recipe saved to your account. Preview audio stays on this device.")
    } catch {
      setAccountMessage(localSaved ? "Account save could not be confirmed. Your device draft is available. Retry the same recipe, or save a new copy if it changed elsewhere." : "The account save could not be confirmed and device storage failed. Keep this tab open.")
    } finally {
      setSavingAccount(false)
    }
  }

  async function saveNewCopy() {
    if (savingAccount || !enabled) return
    await queue.current
    const id = crypto.randomUUID()
    activeId.current = id
    localRevision.current = 0
    setIdentity({ id, revision: 0, cloudFingerprint: null })
    setAccountMessage("New copy started on this device. Save it to your account when ready.")
  }

  return { title, setTitle, localStatus, accountMessage, savingAccount, saveToAccount, saveNewCopy,
    accountCurrent: identity.cloudFingerprint === recipeFingerprint(input), projectPath: buildGreenProjectPath(identity.id) }
}
