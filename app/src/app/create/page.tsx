import type { Metadata } from "next"

import { notFound } from "next/navigation"
import { z } from "zod"
import { GreenStudioWorkspace } from "@/components/create/green-studio-workspace"
import { getGreenTrack, GREEN_CATALOG } from "@/lib/catalog/green-catalog"

export const metadata: Metadata = {
  title: "Make a Mashup",
  description: "Pick two rights-cleared tracks, generate three musical arrangements, and keep the version that moves you.",
  alternates: { canonical: "/create" },
}

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const requestedLeft = typeof params.left === "string" ? params.left : null
  const requestedRight = typeof params.right === "string" ? params.right : null
  const initialLeft = getGreenTrack(requestedLeft)?.id ?? GREEN_CATALOG[0].id
  const initialRight = getGreenTrack(requestedRight)?.id ?? GREEN_CATALOG[1].id
  const projectId = typeof params.project === "string" ? params.project : undefined
  if (params.project && (!projectId || !z.uuid().safeParse(projectId).success)) notFound()
  const usePreviousDraft = !requestedLeft && !requestedRight && params.fresh !== "1"

  return <GreenStudioWorkspace key={projectId ?? `${initialLeft}:${initialRight}:${usePreviousDraft}`} initialLeft={initialLeft} initialRight={initialRight} projectId={projectId} usePreviousDraft={usePreviousDraft} />
}
