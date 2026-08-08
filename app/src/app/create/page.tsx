import type { Metadata } from "next"

import { GreenMashupStudio } from "@/components/create/green-mashup-studio"
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

  return <GreenMashupStudio initialLeft={initialLeft} initialRight={initialRight} />
}
