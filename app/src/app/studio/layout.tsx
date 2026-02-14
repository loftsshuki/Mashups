import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Studio",
  description: "Your production studio. Mix, master, and manage your mashup projects.",
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children
}
