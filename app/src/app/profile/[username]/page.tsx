import { notFound } from "next/navigation"

import { getProfileDetailByUsername } from "@/lib/data/profile-detail"
import { ProfileClient } from "./profile-client"

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
