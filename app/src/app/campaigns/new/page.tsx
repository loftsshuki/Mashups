import type { Metadata } from "next"
import { Suspense } from "react"

import { CampaignWorkspace } from "@/components/campaigns/campaign-workspace"

export const metadata: Metadata = {
  title: "Campaign Studio",
  description: "Turn one track into hook cuts, rights proof, attributed captions, and a performance brief.",
  alternates: { canonical: "/campaigns/new" },
}

export default function NewCampaignPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-28" />}>
      <CampaignWorkspace />
    </Suspense>
  )
}
