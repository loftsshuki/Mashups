import { NextResponse } from "next/server"

import { getChallengesFromBackend } from "@/lib/data/challenge-engine"

export async function GET() {
  try {
    const challenges = await getChallengesFromBackend()
    const openChallengeCount = challenges.filter((challenge) => challenge.status !== "closed").length

    return NextResponse.json({
      challenges,
      openChallengeCount,
    })
  } catch {
    return NextResponse.json({ error: "Failed to load challenges." }, { status: 500 })
  }
}
