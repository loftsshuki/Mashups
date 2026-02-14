import { NextResponse } from "next/server"

import { getProfileDetailByUsername } from "@/lib/data/profile-detail"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params
    const detail = await getProfileDetailByUsername(username)
    if (!detail) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 })
    }
    return NextResponse.json(detail)
  } catch {
    return NextResponse.json({ error: "Failed to load profile." }, { status: 500 })
  }
}
