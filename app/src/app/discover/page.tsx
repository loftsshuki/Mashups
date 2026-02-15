import { getMashups } from "@/lib/data/mashups"
import { DiscoverFeed } from "./discover-feed"

export const metadata = {
  title: "Discover",
  description: "No algorithm. Just what's new.",
}

export default async function DiscoverPage() {
  const allMashups = await getMashups()

  // Sort by created_at descending
  const sorted = [...allMashups].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Discover
        </h1>
        <p className="mt-2 text-muted-foreground">
          No algorithm. Just what&apos;s new.
        </p>
      </div>

      <DiscoverFeed initialMashups={sorted} />
    </div>
  )
}
