"use client"

import { useState } from "react"
import { NeonHero, NeonPage } from "@/components/marketing/neon-page"
import { FeedTabs } from "@/components/feed/feed-tabs"
import { FeedGenreFilter } from "@/components/feed/feed-genre-filter"
import { FeedMashupList } from "@/components/feed/feed-mashup-list"
import { TrendingSidebar } from "@/components/create/trending-sidebar"

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you")
  const [activeGenre, setActiveGenre] = useState("All")

  return (
    <NeonPage>
      <NeonHero
        eyebrow="Your Feed"
        title="Discover & Follow"
        description="Your personalized feed of mashups from creators you follow and trending picks curated just for you."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <FeedGenreFilter activeGenre={activeGenre} onGenreChange={setActiveGenre} />
          <FeedMashupList tab={activeTab} genre={activeGenre} />
        </div>

        {/* Sidebar */}
        <div>
          <TrendingSidebar className="sticky top-24 w-full border-l-0 rounded-xl border border-border" />
        </div>
      </div>
    </NeonPage>
  )
}
