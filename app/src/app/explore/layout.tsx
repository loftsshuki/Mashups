import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Explore",
  description: "Browse mashups by genre, BPM, and mood. Discover new creators and trending sounds.",
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children
}
