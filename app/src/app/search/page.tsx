"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MashupCard } from "@/components/mashup-card"
import { CreatorAvatar } from "@/components/creator-avatar"
import { mockMashups, mockCreators } from "@/lib/mock-data"

const popularSearches = [
  "Lo-fi beats",
  "Synthwave",
  "Hip-Hop remix",
  "Chill vibes",
  "EDM mashup",
  "Phonk",
  "Drum & Bass",
  "Funk",
]

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
        m.creator.displayName.toLowerCase().includes(q)
    )
  }, [debouncedQuery])

  const filteredCreators = useMemo(() => {
    if (!debouncedQuery.trim()) return []
    const q = debouncedQuery.toLowerCase()
    return mockCreators.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q)
    )
  }, [debouncedQuery])

  const hasQuery = debouncedQuery.trim().length > 0
  const hasResults = filteredMashups.length > 0 || filteredCreators.length > 0

  function handlePopularClick(term: string) {
    setQuery(term)
    inputRef.current?.focus()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Search input */}
      <div className="mx-auto mb-10 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search mashups, creators, genres..."
            className="h-12 pl-10 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Results or initial state */}
      {hasQuery ? (
        hasResults ? (
          <Tabs defaultValue="mashups">
            <TabsList className="mb-6">
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
                      genre={mashup.genre}
                      duration={mashup.duration}
                      playCount={mashup.playCount}
                      creator={mashup.creator}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-border/50 bg-muted/30 px-6 py-12 text-center">
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
                    <CreatorAvatar
                      key={creator.username}
                      username={creator.username}
                      displayName={creator.displayName}
                      avatarUrl={creator.avatarUrl}
                      followerCount={creator.followerCount}
                      mashupCount={creator.mashupCount}
                      size="lg"
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-border/50 bg-muted/30 px-6 py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No creators found for &ldquo;{debouncedQuery}&rdquo;
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="rounded-lg border border-border/50 bg-muted/30 px-6 py-16 text-center">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-foreground">
              No results found
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              No mashups or creators match &ldquo;{debouncedQuery}&rdquo;. Try
              a different search term.
            </p>
          </div>
        )
      ) : (
        <>
          {/* Popular searches */}
          <div className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Popular Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <Badge
                  key={term}
                  variant="secondary"
                  className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handlePopularClick(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>

          {/* Recent mashups */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Recent Mashups
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {mockMashups.slice(0, 4).map((mashup) => (
                <MashupCard
                  key={mashup.id}
                  id={mashup.id}
                  title={mashup.title}
                  coverUrl={mashup.coverUrl}
                  genre={mashup.genre}
                  duration={mashup.duration}
                  playCount={mashup.playCount}
                  creator={mashup.creator}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
