import { notFound } from "next/navigation"

import { getPlaylistById } from "@/lib/data/playlists"
import { PlaylistDetailClient } from "./playlist-detail-client"

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const playlist = await getPlaylistById(id)
  if (!playlist) {
    notFound()
  }

  return <PlaylistDetailClient playlist={playlist} />
}
