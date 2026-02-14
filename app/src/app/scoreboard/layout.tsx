import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Scoreboard",
  description: "Top creators and mashup leaderboards on Mashups.",
}

export default function ScoreboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
