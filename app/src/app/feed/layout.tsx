import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Feed",
  description: "Your personalized mashup feed. Discover new tracks from creators you follow and AI-powered recommendations.",
}

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return children
}
