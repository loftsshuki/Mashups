import { mockCreators, mockMashups, getMockCreator } from "@/lib/mock-data"
import { ProfileClient } from "./profile-client"

export function generateStaticParams() {
  return mockCreators.map((creator) => ({
    username: creator.username,
  }))
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const creator = getMockCreator(username) ?? mockCreators[0]
  const creatorMashups = mockMashups.filter(
    (m) => m.creator.username === creator.username
  )

  return <ProfileClient creator={creator} mashups={creatorMashups} />
}
