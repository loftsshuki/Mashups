import { NextRequest, NextResponse } from "next/server"

interface SimilarStem {
  id: string
  title: string
  instrument: string
  bpm: number
  key: string
  similarity: number
  usageCount: number
  creatorName: string
}

const mockSimilarStems: SimilarStem[] = [
  { id: "sim-1", title: "Warm Bass Loop", instrument: "bass", bpm: 120, key: "Am", similarity: 0.92, usageCount: 34, creatorName: "BassArchitect" },
  { id: "sim-2", title: "Deep Sub Bass", instrument: "bass", bpm: 118, key: "Am", similarity: 0.87, usageCount: 28, creatorName: "LowEndKing" },
  { id: "sim-3", title: "Funky Bass Riff", instrument: "bass", bpm: 122, key: "Em", similarity: 0.81, usageCount: 19, creatorName: "GrooveMaster" },
  { id: "sim-4", title: "808 Bass Hit", instrument: "bass", bpm: 120, key: "Cm", similarity: 0.78, usageCount: 52, creatorName: "TrapProducer" },
  { id: "sim-5", title: "Acid Bass Line", instrument: "bass", bpm: 125, key: "Am", similarity: 0.74, usageCount: 15, creatorName: "AcidWizard" },
]

export async function GET(request: NextRequest) {
  const stemId = request.nextUrl.searchParams.get("stemId")
  const instrument = request.nextUrl.searchParams.get("instrument")
  const bpm = request.nextUrl.searchParams.get("bpm")

  // Filter by instrument if provided
  let results = [...mockSimilarStems]
  if (instrument) {
    results = results.filter((s) => s.instrument === instrument)
  }

  void stemId
  void bpm

  return NextResponse.json({ stems: results })
}
