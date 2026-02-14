"use client"

import Link from "next/link"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyFollowingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">
        You aren&apos;t following anyone yet
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Follow creators to see their latest mashups here. Explore the community
        to find creators you love.
      </p>
      <Link href="/explore">
        <Button className="mt-6">Explore Creators</Button>
      </Link>
    </div>
  )
}
