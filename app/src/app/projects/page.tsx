import type { Metadata } from "next"
import { GreenProjectLibrary } from "@/components/create/green-project-library"

export const metadata: Metadata = { title: "My saved mashups", description: "Return to your Mashups drafts and saved recipes.", robots: { index: false, follow: false } }

export default function ProjectsPage() {
  return <GreenProjectLibrary />
}
