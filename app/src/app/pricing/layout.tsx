import type { Metadata } from "next"

export const metadata: Metadata = { title: "Pricing", description: "Creator plans that add campaign velocity, rights operations, and performance insight.", alternates: { canonical: "/pricing" } }
export default function PricingLayout({ children }: { children: React.ReactNode }) { return children }
