import { NextRequest, NextResponse } from "next/server"

interface StemDrop {
  id: string
  stems: { id: string; title: string; instrument: string; audioUrl: string }[]
  message: string
  senderName: string
  createdAt: string
  responseCount: number
}

// Mock drops store
const mockDrops: StemDrop[] = [
  {
    id: "drop-1",
    stems: [
      { id: "s1", title: "Funky Bass Line", instrument: "bass", audioUrl: "/audio/placeholder.mp3" },
      { id: "s2", title: "Lo-fi Drums", instrument: "drums", audioUrl: "/audio/placeholder.mp3" },
    ],
    message: "I dare you to make something better with these 🎵",
    senderName: "beatsmith",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    responseCount: 3,
  },
]

export async function GET(request: NextRequest) {
  const dropId = request.nextUrl.searchParams.get("id")

  if (dropId) {
    const drop = mockDrops.find((d) => d.id === dropId)
    return NextResponse.json({ drop: drop ?? null })
  }

  return NextResponse.json({ drops: mockDrops })
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      stems: { id: string; title: string; instrument: string }[]
      message: string
    }

    if (!body.stems || body.stems.length === 0) {
      return NextResponse.json({ error: "At least one stem is required" }, { status: 400 })
    }

    const drop: StemDrop = {
      id: `drop-${Date.now()}`,
      stems: body.stems.map((s) => ({ ...s, audioUrl: "/audio/placeholder.mp3" })),
      message: body.message || "Check out these stems!",
      senderName: "you",
      createdAt: new Date().toISOString(),
      responseCount: 0,
    }

    return NextResponse.json({ drop })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
