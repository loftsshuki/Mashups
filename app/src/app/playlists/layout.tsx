import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Playlists",
  description: "Browse and create collaborative playlists of mashups.",
}

export default function PlaylistsLayout({ children }: { children: React.ReactNode }) {
  return children
}
