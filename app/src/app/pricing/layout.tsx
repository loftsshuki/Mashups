import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Plans and pricing for Mashups creators. Free, Pro, and Enterprise tiers.",
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
