import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Tools",
  description: "AI-powered music production tools: vocal processing, mastering, style transfer, stem swapping, and lyrics transcription.",
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children
}
