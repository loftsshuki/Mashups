import type { Metadata } from "next"

import { GreenAudioLab } from "@/components/lab/green-audio-lab"

export const metadata: Metadata = {
  title: "Audio Quality Lab",
  description: "Inspect Mashups compatibility gates, deterministic arrangements, and 72-case audio benchmark results.",
  robots: { index: false, follow: false },
}

export default function AudioLabPage() {
  return <GreenAudioLab />
}
