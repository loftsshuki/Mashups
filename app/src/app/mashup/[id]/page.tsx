import { mockMashups, getMockMashup, getMashupChildren, getMashupLineage } from "@/lib/mock-data"
import { MashupDetailClient } from "./mashup-detail-client"

export function generateStaticParams() {
  return mockMashups.map((mashup) => ({
    id: mashup.id,
  }))
}

export default async function MashupPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const mashup = getMockMashup(id) ?? mockMashups[0]
  const lineage = getMashupLineage(mashup.id)
  const forkedMashups = getMashupChildren(mashup.id)

  return <MashupDetailClient mashup={mashup} lineage={lineage} forkedMashups={forkedMashups} />
}
