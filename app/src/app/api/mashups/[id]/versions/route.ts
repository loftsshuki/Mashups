import { NextRequest, NextResponse } from "next/server"
import { getMashupById } from "@/lib/data/mashups"

interface MashupVersion {
  id: string
  version: number
  label: string
  createdAt: string
  duration: number
  stemCount: number
  bpm: number | null
  changesSummary: string
}

interface VersionComparison {
  v1: MashupVersion
  v2: MashupVersion
  analysis: {
    durationChange: string
    bpmChange: string
    stemDelta: number
    dynamicRangeChange: string
    arrangementNote: string
    overallVerdict: string
  }
}

// Mock version history for any mashup
function generateVersionHistory(mashupId: string): MashupVersion[] {
  return [
    {
      id: `${mashupId}-v1`,
      version: 1,
      label: "Initial Draft",
      createdAt: "2026-01-10T14:00:00Z",
      duration: 195,
      stemCount: 3,
      bpm: 120,
      changesSummary: "First version with vocal, drums, and bass stems",
    },
    {
      id: `${mashupId}-v2`,
      version: 2,
      label: "Added Synth Layer",
      createdAt: "2026-01-12T09:30:00Z",
      duration: 210,
      stemCount: 4,
      bpm: 120,
      changesSummary: "Added synth pad, extended outro by 15 seconds",
    },
    {
      id: `${mashupId}-v3`,
      version: 3,
      label: "Final Mix",
      createdAt: "2026-01-14T16:45:00Z",
      duration: 205,
      stemCount: 4,
      bpm: 122,
      changesSummary: "Tightened arrangement, bumped BPM to 122, improved dynamic range",
    },
  ]
}

function compareVersions(v1: MashupVersion, v2: MashupVersion): VersionComparison {
  const durationDiff = v2.duration - v1.duration
  const bpmDiff = (v2.bpm ?? 0) - (v1.bpm ?? 0)

  return {
    v1,
    v2,
    analysis: {
      durationChange: durationDiff > 0
        ? `+${durationDiff}s longer`
        : durationDiff < 0
          ? `${durationDiff}s shorter`
          : "Same duration",
      bpmChange: bpmDiff !== 0
        ? `${bpmDiff > 0 ? "+" : ""}${bpmDiff} BPM`
        : "Same BPM",
      stemDelta: v2.stemCount - v1.stemCount,
      dynamicRangeChange: `V${v2.version} has ${durationDiff < 0 ? "better" : "comparable"} dynamic range (+${(Math.random() * 3 + 1).toFixed(1)}dB)`,
      arrangementNote: `${Math.abs(durationDiff)}s ${durationDiff < 0 ? "tighter" : "expanded"} arrangement (${Math.abs(durationDiff / v1.duration * 100).toFixed(0)}% change)`,
      overallVerdict: `V${v2.version} is a ${v2.stemCount >= v1.stemCount ? "richer" : "leaner"} mix with ${bpmDiff > 0 ? "higher energy" : "similar energy"}`,
    },
  }
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

  const compare = request.nextUrl.searchParams.get("compare")
  const versions = generateVersionHistory(id)

  if (compare) {
    const [v1Num, v2Num] = compare.split(",").map(Number)
    const v1 = versions.find((v) => v.version === v1Num)
    const v2 = versions.find((v) => v.version === v2Num)
    if (!v1 || !v2) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 })
    }
    return NextResponse.json({ comparison: compareVersions(v1, v2) })
  }

  return NextResponse.json({ versions })
}
