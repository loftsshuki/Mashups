import { NextResponse } from "next/server"

interface TrendRecipe {
  id: string
  pattern: string
  description: string
  engagementMultiplier: string
  matchedStems: { title: string; instrument: string; bpm: number }[]
}

const mockRecipes: TrendRecipe[] = [
  {
    id: "recipe-1",
    pattern: "808 Glide + Chopped Soul Vocal + 140 BPM",
    description: "This combination is driving 3x engagement on the platform right now. The sliding 808 bass paired with pitched-up soul vocals creates an irresistible tension.",
    engagementMultiplier: "3.2x",
    matchedStems: [
      { title: "Deep 808 Glide", instrument: "bass", bpm: 140 },
      { title: "Soul Vocal Chop Pack", instrument: "vocal", bpm: 140 },
      { title: "Crisp Trap Hi-Hats", instrument: "drums", bpm: 140 },
    ],
  },
  {
    id: "recipe-2",
    pattern: "Ambient Pad + Breakbeat + Pitched Vocal",
    description: "The UK garage revival is in full swing. Lush ambient pads over broken beats with pitched vocals are creating the most saved mashups this week.",
    engagementMultiplier: "2.5x",
    matchedStems: [
      { title: "Ethereal Pad Wash", instrument: "synth", bpm: 130 },
      { title: "Garage Breakbeat", instrument: "drums", bpm: 130 },
      { title: "Pitched Vocal Stab", instrument: "vocal", bpm: 130 },
    ],
  },
  {
    id: "recipe-3",
    pattern: "Acoustic Guitar + Lo-fi Drums + Rain Texture",
    description: "Cozy mashups are trending for study/focus playlists. Warm acoustic elements with lo-fi drum patterns and ambient textures are generating high listen-through rates.",
    engagementMultiplier: "2.1x",
    matchedStems: [
      { title: "Fingerpicked Acoustic", instrument: "guitar", bpm: 85 },
      { title: "Dusty Lo-fi Kit", instrument: "drums", bpm: 85 },
      { title: "Rain & Vinyl Crackle", instrument: "texture", bpm: 85 },
    ],
  },
]

export async function GET() {
  return NextResponse.json({
    recipes: mockRecipes,
    updatedAt: new Date().toISOString(),
    period: "This Week",
  })
}
