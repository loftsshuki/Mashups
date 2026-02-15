import { NextRequest, NextResponse } from "next/server"

interface ExtractedSound {
  id: string
  title: string
  instrument: string
  bpm: number
  key: string
  duration: number
  confidence: number
  description: string
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const description = formData.get("description") as string | null
  const audioFile = formData.get("audio") as File | null

  if (!description) {
    return NextResponse.json({ error: "description required" }, { status: 400 })
  }

  // Mock: simulate AI extracting a sound element
  const lowerDesc = description.toLowerCase()
  let instrument = "other"
  let bpm = 120
  let key = "Am"

  if (lowerDesc.includes("snare") || lowerDesc.includes("drum") || lowerDesc.includes("kick")) {
    instrument = "drums"
    bpm = 128
  } else if (lowerDesc.includes("bass")) {
    instrument = "bass"
    bpm = 110
    key = "Em"
  } else if (lowerDesc.includes("vocal") || lowerDesc.includes("voice")) {
    instrument = "vocal"
    bpm = 100
    key = "Cm"
  } else if (lowerDesc.includes("synth") || lowerDesc.includes("pad")) {
    instrument = "synth"
    bpm = 130
    key = "Fm"
  } else if (lowerDesc.includes("guitar")) {
    instrument = "guitar"
    bpm = 95
    key = "G"
  }

  const result: ExtractedSound = {
    id: `extract-${Date.now()}`,
    title: `Extracted ${instrument}: ${description.slice(0, 30)}`,
    instrument,
    bpm,
    key,
    duration: 4 + Math.floor(Math.random() * 8),
    confidence: 0.75 + Math.random() * 0.2,
    description: `AI isolated and recreated the "${description}" element from the uploaded audio. ${audioFile ? `Source: ${audioFile.name}` : "No audio provided — generated from description."}`,
  }

  return NextResponse.json({ result })
}
