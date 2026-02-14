import { notFound } from "next/navigation"

import { getMashupDetailView } from "@/lib/data/mashup-detail"
import { MashupDetailClient } from "./mashup-detail-client"

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
