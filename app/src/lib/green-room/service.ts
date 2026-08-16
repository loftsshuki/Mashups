import "server-only"

import { createHash, randomUUID } from "node:crypto"

import { GREEN_CATALOG, validateGreenCatalogBinding } from "@/lib/catalog/green-catalog"
import { verifyGreenCatalog } from "@/lib/catalog/signed-catalog"
import { createAdminClient } from "@/lib/supabase/admin"
import type { GreenCatalogSummary, GreenCatalogVerification, GreenPilotMetrics } from "./types"

type Row = Record<string, unknown>

export async function getPublicGreenCatalog(): Promise<{ mode: "live" | "prototype"; tracks: GreenCatalogSummary[]; verification: GreenCatalogVerification | null }> {
  const admin = createAdminClient()
  if (admin) {
    const { data, error } = await admin
      .from("green_catalog_tracks")
      .select("id,slug,artist_name,track_title,genre,bpm,musical_key,camelot_key,energy,source_type,public_preview_url")
      .eq("status", "green")
      .eq("rights_status", "verified")
      .eq("quality_status", "passed")
      .order("published_at", { ascending: false })
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
  if (!admin) return emptyMetrics()
  const since = new Date(Date.now() - Math.max(days + 31, 61) * 86_400_000).toISOString()
  const { data, error } = await admin.from("green_funnel_events").select("event_name,session_id,occurred_at").gte("occurred_at", since)
  if (error || !data) return emptyMetrics()
  const rows = data as Array<{ event_name: string; session_id: string; occurred_at: string }>
  const windowStart = Date.now() - days * 86_400_000
  const windowRows = rows.filter((row) => Date.parse(row.occurred_at) >= windowStart)
  const sessions = new Set(windowRows.map((row) => row.session_id)).size
  const count = (name: string) => windowRows.filter((row) => row.event_name === name).length
  const rendersStarted = count("render_started")
  const rendersCompleted = count("render_completed")
  const candidatesKept = count("candidate_kept")
  const sharesStarted = count("share_started")
  const activity = new Map<string, { first: number; last: number }>()
  for (const row of rows) { const time = Date.parse(row.occurred_at); const current = activity.get(row.session_id); activity.set(row.session_id, current ? { first: Math.min(current.first, time), last: Math.max(current.last, time) } : { first: time, last: time }) }
  const eligible = [...activity.values()].filter((entry) => entry.first <= Date.now() - 30 * 86_400_000)
  const retained = eligible.filter((entry) => entry.last >= entry.first + 30 * 86_400_000).length
  return {
    sessions,
    rendersStarted,
    rendersCompleted,
    candidatesKept,
    sharesStarted,
    renderCompletionRate: ratio(rendersCompleted, rendersStarted),
    keepRate: ratio(candidatesKept, rendersCompleted),
    shareRate: ratio(sharesStarted, sessions),
    d30Eligible: eligible.length,
    d30Retained: retained,
    d30RetentionRate: ratio(retained, eligible.length),
  }
}

export async function recordGreenEvent(input: { eventName: string; sessionId: string; projectId?: string | null; userId?: string | null; properties: Record<string, unknown> }) {
  const admin = createAdminClient()
  if (!admin) return false
  const { error } = await admin.from("green_funnel_events").insert({ event_name: input.eventName, session_id: input.sessionId, project_id: input.projectId ?? null, user_id: input.userId ?? null, properties: input.properties })
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

function emptyMetrics(): GreenPilotMetrics { return { sessions: 0, rendersStarted: 0, rendersCompleted: 0, candidatesKept: 0, sharesStarted: 0, renderCompletionRate: 0, keepRate: 0, shareRate: 0, d30Eligible: 0, d30Retained: 0, d30RetentionRate: 0 } }
function ratio(value: number, base: number) { return base ? Math.round((value / base) * 1000) / 1000 : 0 }
function numberOrNull(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null }
function stringOrNull(value: unknown) { return typeof value === "string" && value ? value : null }
