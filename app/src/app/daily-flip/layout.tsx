import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Daily Flip",
  description: "Daily mashup challenge. Get a random sample pack and create something fresh.",
}

export default function DailyFlipLayout({ children }: { children: React.ReactNode }) {
  return children
}
