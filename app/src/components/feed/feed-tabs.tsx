"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type TabValue = "for-you" | "following"

interface FeedTabsProps {
  activeTab: TabValue
  onTabChange: (tab: TabValue) => void
}

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as TabValue)}
    >
      <TabsList>
        <TabsTrigger value="for-you">For You</TabsTrigger>
        <TabsTrigger value="following">Following</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
