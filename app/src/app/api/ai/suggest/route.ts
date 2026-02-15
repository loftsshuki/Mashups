import { NextRequest, NextResponse } from "next/server"

interface Suggestion {
  id: string
  type: "structural" | "stem" | "effect"
  title: string
  description: string
  confidence: number
}

const mockSuggestions: Suggestion[][] = [
  [
    {
      id: "sug-1",
      type: "structural",
      title: "Move the Drop Earlier",
      description: "Try moving the drop 4 bars earlier — it would catch listeners off guard and increase energy retention.",
      confidence: 0.82,
    },
    {
      id: "sug-2",
      type: "stem",
      title: "Add a Brass Stab",
      description: "A brass stab at bar 16 would complement the existing synth pad and add warmth to the transition.",
      confidence: 0.74,
    },
    {
      id: "sug-3",
      type: "effect",
      title: "Reverb on the Vocal Bridge",
      description: "Adding a hall reverb to the vocal in the bridge section would create more space and emotional depth.",
      confidence: 0.88,
    },
  ],
  [
    {
      id: "sug-4",
      type: "structural",
      title: "Extend the Intro",
      description: "Adding 8 bars of filtered bass before the full arrangement kicks in would build more anticipation.",
      confidence: 0.71,
    },
    {
      id: "sug-5",
      type: "stem",
      title: "Layer a Sub Bass",
      description: "The low end feels thin — try layering a sine sub under your existing bass at -6dB.",
      confidence: 0.85,
    },
    {
      id: "sug-6",
      type: "effect",
      title: "Sidechain the Pad",
      description: "Sidechain compress the synth pad to the kick drum for that classic pumping effect.",
      confidence: 0.79,
    },
  ],
]

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { mashupState?: object }
  // Select suggestion set based on some hash of the state
  const idx = body.mashupState ? 0 : 1
  const suggestions = mockSuggestions[idx % mockSuggestions.length]

  return NextResponse.json({ suggestions })
}
