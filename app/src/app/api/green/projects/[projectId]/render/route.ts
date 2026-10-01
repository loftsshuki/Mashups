import { NextResponse } from "next/server"
import { z } from "zod"

import { getProjectContext, projectError } from "@/lib/green-room/project-access"
import { resolveGreenProcessorRoute } from "@/lib/green-room/processor-routing"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params
  if (!z.uuid().safeParse(projectId).success) {
    return projectError("invalid_request", "Invalid project ID.", 400)
  }

  const processor = resolveGreenProcessorRoute({
    jobType: "render_candidates",
    provider: "renderer",
  })
  if (!processor) {
    return projectError(
      "unavailable",
      "The real-audio renderer is not configured.",
      503,
    )
  }

  const ctx = await getProjectContext(request)
  if (ctx.response) return ctx.response

  const { data, error } = await ctx.admin.rpc("queue_green_project_render", {
    p_project_id: projectId,
    p_creator_id: ctx.user.id,
    p_provider: "renderer",
  })

  if (error) {
    if (error.code === "42501") {
      return projectError(
        "not_found",
        "This project is unavailable in your account.",
        404,
      )
    }
    if (error.code === "P0001") {
      return projectError("conflict", error.message, 409)
    }
    return projectError(
      "unavailable",
      "Rendering could not be queued. Please try again.",
      503,
    )
  }

  if (!data || typeof data !== "object" || typeof data.id !== "string") {
    return projectError(
      "unavailable",
      "The render queue receipt could not be verified.",
      503,
    )
  }

  return NextResponse.json(
    {
      ok: true,
      job: {
        id: data.id,
        status: data.status,
        projectId,
      },
    },
    { status: 202 },
  )
}
