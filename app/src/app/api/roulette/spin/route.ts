import { NextResponse } from "next/server"
import { getRandomStems } from "@/lib/data/stems-registry"

export async function POST() {
  // Select 3 random stems, ideally 1 vocal, 1 rhythm, 1 texture
  const stems = await getRandomStems(3)

  return NextResponse.json({
    stems: stems.map((s) => ({
      id: s.id,
      title: s.title,
      instrument: s.instrument,
      genre: s.genre,
      bpm: s.bpm,
      key: s.key,
      audio_url: s.audio_url,
      duration_ms: s.duration_ms,
      creator_id: s.creator_id,
    })),
  })
}
