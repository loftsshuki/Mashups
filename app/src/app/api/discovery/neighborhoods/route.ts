import { NextResponse } from "next/server"

interface SonicNeighborhood {
  id: string
  name: string
  description: string
  characteristics: { label: string; value: number }[] // 0-100 scale
  color: string
  mashupCount: number
  stemCount: number
  topCreators: string[]
}

const mockNeighborhoods: SonicNeighborhood[] = [
  {
    id: "warm-analog",
    name: "Warm Analog",
    description: "Tape saturation, vinyl warmth, vintage synths. Sounds like a cozy studio at 2am.",
    characteristics: [
      { label: "Warmth", value: 92 },
      { label: "Distortion", value: 25 },
      { label: "Space", value: 60 },
      { label: "Punch", value: 35 },
    ],
    color: "#f59e0b",
    mashupCount: 847,
    stemCount: 2340,
    topCreators: ["VinylWhisper", "AnalogDreams", "TapeHead"],
  },
  {
    id: "crystal-digital",
    name: "Crystal Digital",
    description: "Clean synthesis, sharp transients, pristine reverbs. The sound of precision.",
    characteristics: [
      { label: "Warmth", value: 20 },
      { label: "Distortion", value: 10 },
      { label: "Space", value: 85 },
      { label: "Punch", value: 70 },
    ],
    color: "#06b6d4",
    mashupCount: 624,
    stemCount: 1890,
    topCreators: ["CrystalBeats", "DigiPure", "CleanMachine"],
  },
  {
    id: "gritty-underground",
    name: "Gritty Underground",
    description: "Heavy distortion, lo-fi textures, aggressive compression. Raw and unpolished.",
    characteristics: [
      { label: "Warmth", value: 45 },
      { label: "Distortion", value: 88 },
      { label: "Space", value: 20 },
      { label: "Punch", value: 95 },
    ],
    color: "#ef4444",
    mashupCount: 512,
    stemCount: 1560,
    topCreators: ["BassArchitect", "NoiseKing", "RawBeats"],
  },
  {
    id: "ethereal-space",
    name: "Ethereal Space",
    description: "Long reverbs, ambient pads, shimmering delays. Infinite horizons of sound.",
    characteristics: [
      { label: "Warmth", value: 55 },
      { label: "Distortion", value: 5 },
      { label: "Space", value: 98 },
      { label: "Punch", value: 15 },
    ],
    color: "#8b5cf6",
    mashupCount: 398,
    stemCount: 1120,
    topCreators: ["SonicWeaver", "CloudDrifter", "EchoVault"],
  },
  {
    id: "punchy-modern",
    name: "Punchy Modern",
    description: "Tight drums, sidechain pumping, bright leads. Festival-ready energy.",
    characteristics: [
      { label: "Warmth", value: 40 },
      { label: "Distortion", value: 45 },
      { label: "Space", value: 50 },
      { label: "Punch", value: 92 },
    ],
    color: "#ec4899",
    mashupCount: 935,
    stemCount: 2780,
    topCreators: ["RhythmHacker", "DropMaster", "BeatFactory"],
  },
]

export async function GET() {
  return NextResponse.json({ neighborhoods: mockNeighborhoods })
}
