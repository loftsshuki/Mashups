import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Battles",
  description: "Head-to-head mashup battles. Vote for your favorite and compete for the top spot.",
}

export default function BattlesLayout({ children }: { children: React.ReactNode }) {
  return children
}
