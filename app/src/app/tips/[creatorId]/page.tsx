"use client"

import { use } from "react"
import { Heart } from "lucide-react"

import {
  NeonPage,
  NeonHero,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import { TipButton } from "@/components/tips/tip-button"
import { TipWall } from "@/components/tips/tip-wall"

interface TipPageProps {
  params: Promise<{ creatorId: string }>
}

export default function TipPage({ params }: TipPageProps) {
  const { creatorId } = use(params)

  return (
    <NeonPage className="max-w-3xl">
      <NeonHero
        eyebrow="Tip Jar"
        title="Support this creator"
        description="Show your appreciation with a tip. Every contribution helps creators keep making amazing mashups."
      />

      <div className="flex justify-center">
        <TipButton
          creatorId={creatorId}
          creatorName="Creator"
          className="scale-110"
        />
      </div>

      <NeonSectionHeader
        title="Thank You Wall"
        description="Public tips and messages from supporters"
      />

      <TipWall creatorId={creatorId} />
    </NeonPage>
  )
}
