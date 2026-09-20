import { NextResponse } from "next/server"
import { z } from "zod"
import { buildGreenPublicationPath } from "@mashups/contracts"

import { getProjectContext, projectError } from "@/lib/green-room/project-access"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params
  if (!z.uuid().safeParse(projectId).success) {
    return projectError("invalid_request", "Invalid project ID.", 400)
  }

  const ctx = await getProjectContext(request)
  if (ctx.response) return ctx.response

  const { data, error } = await ctx.admin.rpc("publish_green_project", {
    p_project_id: projectId,
    p_creator_id: ctx.user.id,
  })

  if (error) {
    if (error.code === "42501") {
      return projectError("not_found", "This project is unavailable in your account.", 404)
    }
    if (error.code === "P0001") {
      return projectError("conflict", error.message, 409)
    }
    return projectError("unavailable", "Publication is temporarily unavailable.", 503)
  }

  if (!data || typeof data !== "object") {
    return projectError("unavailable", "Publication receipt could not be verified.", 503)
  }

  return NextResponse.json({
    ok: true,
    publicationPath: buildGreenPublicationPath(projectId),
  })
}
