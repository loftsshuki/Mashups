import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Search",
  description: "Search for mashups, creators, and sounds on Mashups.",
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
