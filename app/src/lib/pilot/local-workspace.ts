import type { OutreachProspect, PilotIntake, PilotOperatorConfig } from "@/lib/pilot/types"

export const LOCAL_PILOT_WORKSPACE_KEY = "mashups_pilot_workspace_v1"

export interface LocalPilotWorkspace {
  version: 1
  updatedAt: string
  intake?: PilotIntake
  operatorConfig?: PilotOperatorConfig
  prospects?: OutreachProspect[]
}

type LocalPilotPatch = Partial<Pick<LocalPilotWorkspace, "intake" | "operatorConfig" | "prospects">>

export function parseLocalPilotWorkspace(raw: string | null): LocalPilotWorkspace | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (parsed.version !== 1 || typeof parsed.updatedAt !== "string") return null
    const workspace: LocalPilotWorkspace = { version: 1, updatedAt: parsed.updatedAt }
    if (isPilotIntake(parsed.intake)) workspace.intake = parsed.intake
    if (isOperatorConfig(parsed.operatorConfig)) workspace.operatorConfig = parsed.operatorConfig
    if (Array.isArray(parsed.prospects)) workspace.prospects = parsed.prospects.filter(isOutreachProspect)
    return workspace
  } catch {
    return null
  }
}

export function readLocalPilotWorkspace(): LocalPilotWorkspace | null {
  if (typeof window === "undefined") return null
  try { return parseLocalPilotWorkspace(window.localStorage.getItem(LOCAL_PILOT_WORKSPACE_KEY)) }
  catch { return null }
}

export function updateLocalPilotWorkspace(patch: LocalPilotPatch): boolean {
  if (typeof window === "undefined") return false
  try {
    const current = readLocalPilotWorkspace()
    const next: LocalPilotWorkspace = { ...current, ...patch, version: 1, updatedAt: new Date().toISOString() }
    window.localStorage.setItem(LOCAL_PILOT_WORKSPACE_KEY, JSON.stringify(next))
    return true
  } catch { return false }
}

export function clearLocalPilotWorkspace(): boolean {
  if (typeof window === "undefined") return false
  try { window.localStorage.removeItem(LOCAL_PILOT_WORKSPACE_KEY); return true }
  catch { return false }
}

export function downloadTextFile(filename: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

function isPilotIntake(value: unknown): value is PilotIntake {
  return isObject(value) && typeof value.id === "string" && typeof value.campaignName === "string" && typeof value.artistName === "string" && typeof value.trackTitle === "string" && Array.isArray(value.targetMarkets)
}

function isOperatorConfig(value: unknown): value is PilotOperatorConfig {
  return isObject(value) && typeof value.intakeId === "string" && isObject(value.guaranteedLaunch) && isObject(value.growthLicense) && Array.isArray(value.partnerRails)
}

function isOutreachProspect(value: unknown): value is OutreachProspect {
  return isObject(value) && typeof value.id === "string" && typeof value.entityName === "string" && typeof value.entityType === "string" && typeof value.stage === "string" && Array.isArray(value.genres)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}
