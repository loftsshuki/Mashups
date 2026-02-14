import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Browse and purchase sample packs, stems, and production resources.",
}

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children
}
