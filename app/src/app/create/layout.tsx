import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create",
  description: "Create a new mashup. Upload tracks, mix them together, and publish to the community.",
}

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children
}
