import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getMashupDetailView } from "@/lib/data/mashup-detail"
import { MashupDetailClient } from "./mashup-detail-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  try {
    const detail = await getMashupDetailView(id)
    return {
      title: `${detail.mashup.title} by ${detail.mashup.creator.displayName}`,
      description: detail.mashup.description,
    }
  } catch {
    return { title: "Mashup Not Found" }
  }
}

export default async function MashupPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    const detail = await getMashupDetailView(id)
    return (
      <MashupDetailClient
        mashup={detail.mashup}
        lineage={detail.lineage}
        forkedMashups={detail.forkedMashups}
      />
    )
  } catch {
    notFound()
  }
}
