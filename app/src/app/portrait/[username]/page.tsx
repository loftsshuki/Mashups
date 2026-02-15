"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StylePortrait } from "@/components/profile/style-portrait"

interface PortraitPageProps {
  params: Promise<{ username: string }>
}

export default function PortraitPage({ params }: PortraitPageProps) {
  const { username } = use(params)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href={`/profile/${username}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Link>
      </Button>

      <div className="mb-8 text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Palette className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          @{username}&apos;s Style Portrait
        </h1>
        <p className="text-sm text-muted-foreground">
          AI-generated creative identity based on mashup history
        </p>
      </div>

      <StylePortrait username={username} />
    </div>
  )
}
