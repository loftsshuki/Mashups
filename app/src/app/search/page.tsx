"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Search } from "lucide-react"

import { CreatorAvatar } from "@/components/creator-avatar"
import { MashupCard } from "@/components/mashup-card"
import {
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockCreators, mockMashups } from "@/lib/mock-data"

const popularSearches = [
  "Lo-fi beats",
  "Synthwave",
  "Hip-Hop remix",
  "Chill vibes",
  "EDM mashup",
  "Phonk",
  "Drum & Bass",
  "Funk",
] as const

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export default function SearchPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const filteredMashups = useMemo(() => {
    if (!debouncedQuery.trim()) return []
    const q = debouncedQuery.toLowerCase()
    return mockMashups.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.genre.toLowerCase().includes(q) ||
        m.creator.displayName.toLowerCase().includes(q),
    )
  }, [debouncedQuery])

  const filteredCreators = useMemo(() => {
    if (!debouncedQuery.trim()) return []
    const q = debouncedQuery.toLowerCase()
    return mockCreators.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q),
    )
  }, [debouncedQuery])

  const hasQuery = debouncedQuery.trim().length > 0
  const hasResults = filteredMashups.length > 0 || filteredCreators.length > 0

  return (
    <NeonPage>
      <NeonHero
        eyebrow="Search"
        title="Find mashups, creators, and genres."
        description="Search now follows the same sectioned visual system used across the rest of the redesigned site."
      />

      <section className="neon-panel mb-8 rounded-2xl p-4">
        <NeonSectionHeader
          title="Query"
          description="Search by title, genre, creator, or campaign-related themes."
        />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search mashups, creators, genres..."
            className="h-12 rounded-xl pl-10 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </section>

      {hasQuery ? (
        hasResults ? (
          <Tabs defaultValue="mashups">
            <TabsList className="mb-6 rounded-xl bg-background/70">
              <TabsTrigger value="mashups">
                Mashups ({filteredMashups.length})
              </TabsTrigger>
              <TabsTrigger value="creators">
                Creators ({filteredCreators.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mashups">
              {filteredMashups.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredMashups.map((mashup) => (
                    <MashupCard
                      key={mashup.id}
                      id={mashup.id}
                      title={mashup.title}
                      coverUrl={mashup.coverUrl}
                      audioUrl={mashup.audioUrl}
                      genre={mashup.genre}
                      duration={mashup.duration}
                      playCount={mashup.playCount}
                      creator={mashup.creator}
                    />
                  ))}
                </div>
              ) : (
                <div className="neon-panel rounded-2xl px-6 py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No mashups found for &ldquo;{debouncedQuery}&rdquo;
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="creators">
              {filteredCreators.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {filteredCreators.map((creator) => (
                    <div key={creator.username} className="neon-panel rounded-2xl p-3">
                      <CreatorAvatar
                        username={creator.username}
                        displayName={creator.displayName}
                        avatarUrl={creator.avatarUrl}
                        followerCount={creator.followerCount}
                        mashupCount={creator.mashupCount}
                        size="lg"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="neon-panel rounded-2xl px-6 py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No creators found for &ldquo;{debouncedQuery}&rdquo;
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="neon-panel rounded-2xl px-6 py-16 text-center">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-foreground">No results found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              No mashups or creators match &ldquo;{debouncedQuery}&rdquo;.
            </p>
          </div>
        )
      ) : (
        <>
          <section className="mb-10">
            <NeonSectionHeader title="Popular Searches" />
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <Badge
                  key={term}
                  variant="secondary"
                  className="cursor-pointer rounded-full px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setQuery(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </section>

          <section>
            <NeonSectionHeader title="Recent Mashups" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {mockMashups.slice(0, 4).map((mashup) => (
                <MashupCard
                  key={mashup.id}
                  id={mashup.id}
                  title={mashup.title}
                  coverUrl={mashup.coverUrl}
                  audioUrl={mashup.audioUrl}
                  genre={mashup.genre}
                  duration={mashup.duration}
                  playCount={mashup.playCount}
                  creator={mashup.creator}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </NeonPage>
  )
}

