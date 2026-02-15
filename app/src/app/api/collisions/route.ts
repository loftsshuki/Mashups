import { NextResponse } from "next/server"
import { getPlatformChallenges } from "@/lib/data/platform-challenges"

export async function GET() {
  const allChallenges = await getPlatformChallenges()
  const collisions = allChallenges.filter((c) => c.type === "collision")
  return NextResponse.json({ collisions })
}
