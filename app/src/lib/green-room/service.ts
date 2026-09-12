import "server-only"

import { createHash, randomUUID } from "node:crypto"

import { GREEN_CATALOG, validateGreenCatalogBinding } from "@/lib/catalog/green-catalog"
import { verifyGreenCatalog } from "@/lib/catalog/signed-catalog"
import { createAdminClient } from "@/lib/supabase/admin"
import { logServerEvent } from "@/lib/observability/logger"
import type { GreenEventInput } from "@mashups/contracts"
import type { GreenCatalogSummary, GreenCatalogVerification, GreenPilotMetrics } from "./types"

type Row = Record<string, unknown>

export async function getPublicGreenCatalog(): Promise<{ mode: "live" | "prototype"; tracks: GreenCatalogSummary[]; verification: GreenCatalogVerification | null }> {
  const admin = createAdminClient()
  if (admin) {
    const { data, error } = await admin.rpc("get_green_public_catalog")
    if (!error && data?.length) return { mode: "live", tracks: data.map(mapCatalogTrack), verification: null }
  }

  const signature = verifyGreenCatalog()
  const binding = validateGreenCatalogBinding()
  const verified = signature.verified && binding.valid
  const verification = verified ? signature : { ...signature, verified: false, reason: [signature.reason, ...binding.reasons].filter(Boolean).join(" ") }
  return {
    mode: "prototype",
    verification,
    tracks: verified ? GREEN_CATALOG.map((track) => ({
      id: track.id,
      slug: track.id,
      artistName: track.artist,
      trackTitle: track.title,
      genre: track.genre,
      bpm: track.bpm,
      musicalKey: track.key,
      camelotKey: track.camelot,
      energy: track.energy,
      sourceType: "mashups_original",
      publicPreviewUrl: null,
      rightsPassportId: track.rights.passportId,
    })) : [],
  }
}

export async function getGreenPilotMetrics(days = 30): Promise<GreenPilotMetrics> {
  const admin = createAdminClient()
  if (!admin) return unavailableGreenMetrics()
  const { data, error } = await admin.rpc("get_green_pilot_metrics", { p_days: days })
  if (error || !data || data.available !== true) {
    logServerEvent("warn", "green_metrics_unavailable", { code: error?.code ?? "invalid_response" })
    return unavailableGreenMetrics()
  }
  return data as GreenPilotMetrics
}

export async function recordGreenEvent(input: GreenEventInput & { userId?: string | null }) {
  const admin = createAdminClient()
  if (!admin) return false
  const { error } = await admin.from("green_funnel_events").upsert({
    event_id: input.eventId ?? randomUUID(),
    event_name: input.eventName,
    visitor_id: input.visitorId ?? input.sessionId,
    session_id: input.sessionId,
    project_id: input.projectId ?? null,
    user_id: input.userId ?? null,
    properties: input.properties,
  }, { onConflict: "event_id", ignoreDuplicates: true })
  if (error) logServerEvent("warn", "green_event_not_persisted", { eventName: input.eventName, code: error.code })
  return !error
}

export function makeGreenSlug(artistName: string, trackTitle: string) {
  const stem = `${artistName}-${trackTitle}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 54) || "green-track"
  return `${stem}-${randomUUID().slice(0, 6)}`
}

export function hashBetaCode(code: string) {
  return createHash("sha256").update(code.trim()).digest("hex")
}

function mapCatalogTrack(row: Row): GreenCatalogSummary {
  const id = String(row.id)
  return { id, slug: String(row.slug), artistName: String(row.artist_name), trackTitle: String(row.track_title), genre: String(row.genre), bpm: numberOrNull(row.bpm), musicalKey: stringOrNull(row.musical_key), camelotKey: stringOrNull(row.camelot_key), energy: numberOrNull(row.energy), sourceType: row.source_type as GreenCatalogSummary["sourceType"], publicPreviewUrl: stringOrNull(row.public_preview_url), rightsPassportId: `GREEN-${id.slice(0, 8).toUpperCase()}` }
}

export function unavailableGreenMetrics(): GreenPilotMetrics { return { available: false, sessions: 0, rendersStarted: 0, rendersCompleted: 0, candidatesKept: 0, sharesStarted: 0, renderCompletionRate: 0, keepRate: 0, shareRate: 0, d30Eligible: 0, d30Retained: 0, d30RetentionRate: null } }
function numberOrNull(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null }
function stringOrNull(value: unknown) { return typeof value === "string" && value ? value : null }
