import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Trending",
  description: "Trending sounds and mashups across TikTok, Spotify, and YouTube.",
}

export default function TrendingLayout({ children }: { children: React.ReactNode }) {
  return children
}
