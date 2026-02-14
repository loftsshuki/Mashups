import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getProfileDetailByUsername } from "@/lib/data/profile-detail"
import { ProfileClient } from "./profile-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const detail = await getProfileDetailByUsername(username)
  if (!detail) return { title: "Profile Not Found" }
  return {
    title: `${detail.creator.displayName} (@${detail.creator.username})`,
    description: detail.creator.bio || `Check out ${detail.creator.displayName}'s mashups on Mashups.`,
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const detail = await getProfileDetailByUsername(username)

  if (!detail) {
    notFound()
  }

  return <ProfileClient creator={detail.creator} mashups={detail.mashups} />
}
