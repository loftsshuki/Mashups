import { NextResponse } from "next/server"
import { z } from "zod"
import { GREEN_CATALOG_MANIFEST } from "@/lib/catalog/catalog-manifest"
import { assessGreenPair, getGreenTrack, validateGreenCatalogBinding } from "@/lib/catalog/green-catalog"
import { verifyGreenCatalog } from "@/lib/catalog/signed-catalog"
import { greenProjectInputSchema, greenSavedProjectSchema } from "@/lib/green-room/project-schema"
import { getProjectContext, projectError } from "@/lib/green-room/project-access"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { logServerEvent } from "@/lib/observability/logger"

const columns = "id,title,source_mode,left_track_id,right_track_id,prototype_sources,intensity,selected_arrangement,revision,status,created_at,updated_at"

export async function GET(request: Request) {
  const ctx = await getProjectContext(request)
  if (ctx.response) return ctx.response
  const id = new URL(request.url).searchParams.get("id")
  if (id !== null && !z.uuid().safeParse(id).success) return projectError("invalid_request", "Invalid project ID.", 400)
  const query = ctx.admin.from("green_projects").select(columns).eq("creator_id", ctx.user.id).neq("status", "archived")
  const result = id ? await query.eq("id", id).maybeSingle() : await query.order("updated_at", { ascending: false }).limit(50)
  if (result.error) return projectError("unavailable", "Your saved mashups could not be loaded. Please try again.", 503)
  if (id && !result.data) return projectError("not_found", "This project is unavailable in your account.", 404)
  try {
    return NextResponse.json(id ? { project: mapProject(result.data as unknown as Row) } : { projects: (result.data as unknown as Row[]).map(mapProject) }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return projectError("unavailable", "This project uses an unsupported recipe. Your saved data has not been changed.", 503)
  }
}

export async function PUT(request: Request) {
  const ctx = await getProjectContext(request)
  if (ctx.response) return ctx.response
  const rate = await consumeRateLimit({ key: resolveRateLimitKey(request, "green.project.save", ctx.user.id), limit: 30, windowMs: 60_000 })
  if (!rate.allowed) return projectError("unavailable", rate.unavailable ? "Account saving is temporarily unavailable." : "Please wait a moment before saving again.", rate.unavailable ? 503 : 429)
  const parsed = greenProjectInputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return projectError("invalid_request", "The project recipe is invalid.", 400)
  const input = parsed.data
  if (input.sources.kind === "prototype") {
    const left = getGreenTrack(input.sources.leftId)
    const right = getGreenTrack(input.sources.rightId)
    if (!verifyGreenCatalog().verified || !validateGreenCatalogBinding().valid || input.sources.catalogVersion !== GREEN_CATALOG_MANIFEST.catalogVersion
      || !left || !right || !assessGreenPair(left, right).compatible) {
      return projectError("source_unavailable", "These sources are no longer available together. Choose a current catalog pairing.", 409)
    }
  }
  const { data, error } = await ctx.admin.rpc("save_green_project", {
    p_id: input.id, p_creator_id: ctx.user.id, p_title: input.title, p_sources: input.sources,
    p_intensity: input.intensity, p_selected_arrangement: input.selectedArrangement, p_expected_revision: input.expectedRevision,
  })
  if (error) {
    if (error.code === "42501") return projectError("not_found", "This project is unavailable in your account. Save a new copy.", 404)
    if (error.code === "40001") return projectError("conflict", "This project changed elsewhere or has reviewed audio. Save a new copy to keep your edits.", 409)
    if (error.code === "P0001") return projectError("source_unavailable", error.message, 409)
    logServerEvent("warn", "green_project_save_failed", { code: error.code })
    return projectError("unavailable", "Account save failed. Please try again.", 503)
  }
  try {
    return NextResponse.json({ project: mapProject(Array.isArray(data) && data.length === 1 ? data[0] : data) }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return projectError("unavailable", "The save receipt could not be verified. Reload your account project before saving again.", 503)
  }
}

type Row = Record<string, unknown>
function mapProject(row: Row) {
  return greenSavedProjectSchema.parse({
    id: row.id, title: row.title, sources: row.source_mode === "prototype"
      ? { ...(row.prototype_sources as object), kind: "prototype" }
      : { kind: "catalog", leftId: row.left_track_id, rightId: row.right_track_id },
    intensity: row.intensity, selectedArrangement: row.selected_arrangement, revision: row.revision,
    status: row.status, createdAt: row.created_at, updatedAt: row.updated_at,
  })
}
