import { NextRequest, NextResponse } from "next/server"

interface ChainLink {
  id: string
  position: number
  creatorName: string
  creatorAvatar: string
  mashupId: string
  audioUrl: string
  changedElement: string
  createdAt: string
}

interface Chain {
  id: string
  title: string
  description: string
  maxLinks: number
  links: ChainLink[]
  status: "active" | "completed"
  createdAt: string
}

const mockChains: Chain[] = [
  {
    id: "chain-1",
    title: "Lo-Fi to High Energy",
    description: "Start chill, end wild. Each link shifts the energy higher.",
    maxLinks: 8,
    links: [
      {
        id: "link-1",
        position: 0,
        creatorName: "beatsmith",
        creatorAvatar: "https://placehold.co/100x100/6366f1/white?text=BS",
        mashupId: "mashup-1",
        audioUrl: "/audio/placeholder.mp3",
        changedElement: "Started with lo-fi piano",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: "link-2",
        position: 1,
        creatorName: "voxqueen",
        creatorAvatar: "https://placehold.co/100x100/ec4899/white?text=VQ",
        mashupId: "mashup-2",
        audioUrl: "/audio/placeholder.mp3",
        changedElement: "Added jazzy vocals",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "link-3",
        position: 2,
        creatorName: "trapmaster",
        creatorAvatar: "https://placehold.co/100x100/f59e0b/white?text=TM",
        mashupId: "mashup-3",
        audioUrl: "/audio/placeholder.mp3",
        changedElement: "Swapped drums for trap beats",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "chain-2",
    title: "Around the World",
    description: "Each link adds an instrument from a different country.",
    maxLinks: 6,
    links: [
      {
        id: "link-4",
        position: 0,
        creatorName: "globalbeats",
        creatorAvatar: "https://placehold.co/100x100/10b981/white?text=GB",
        mashupId: "mashup-4",
        audioUrl: "/audio/placeholder.mp3",
        changedElement: "West African djembe",
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
    ],
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
]

export async function GET(request: NextRequest) {
  const chainId = request.nextUrl.searchParams.get("id")

  if (chainId) {
    const chain = mockChains.find((c) => c.id === chainId)
    return NextResponse.json({ chain: chain ?? null })
  }

  return NextResponse.json({ chains: mockChains })
}
