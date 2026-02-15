import { NextRequest, NextResponse } from "next/server"
import { getMashupById } from "@/lib/data/mashups"
import { getStemsForMashup } from "@/lib/data/stems-registry"

interface GraphNode {
  id: string
  type: "mashup" | "stem"
  label: string
  creator?: string
  coverUrl?: string
  instrument?: string
  playCount?: number
}

interface GraphEdge {
  source: string
  target: string
  type: "uses" | "remix_of" | "shared_stem"
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const mashup = await getMashupById(id)
  if (!mashup) {
    return NextResponse.json({ error: "Mashup not found" }, { status: 404 })
  }

  const stems = await getStemsForMashup(id)

  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  // Central mashup node
  nodes.push({
    id: mashup.id,
    type: "mashup",
    label: mashup.title,
    creator: mashup.creator?.display_name ?? mashup.creator?.username,
    coverUrl: mashup.cover_image_url ?? undefined,
    playCount: mashup.play_count,
  })

  // Stem nodes
  stems.forEach((stem) => {
    nodes.push({
      id: stem.id,
      type: "stem",
      label: stem.title,
      instrument: stem.instrument ?? undefined,
    })

    edges.push({
      source: stem.id,
      target: mashup.id,
      type: "uses",
    })
  })

  // If mashup has source_tracks, add those as connected mashup nodes
  if (mashup.source_tracks && mashup.source_tracks.length > 0) {
    mashup.source_tracks.forEach((track, i) => {
      const sourceId = `source-${i}`
      nodes.push({
        id: sourceId,
        type: "mashup",
        label: track.title ?? `Source ${i + 1}`,
      })
      edges.push({
        source: sourceId,
        target: mashup.id,
        type: "remix_of",
      })
    })
  }

  return NextResponse.json({ nodes, edges })
}
