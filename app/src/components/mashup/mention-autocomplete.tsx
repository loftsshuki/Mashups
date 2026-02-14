"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { searchUsers } from "@/lib/data/comments-v2"
import type { Profile } from "@/lib/data/types"

interface MentionAutocompleteProps {
  query: string
  onSelect: (username: string) => void
  onClose: () => void
}

export function MentionAutocomplete({
  query,
  onSelect,
  onClose,
}: MentionAutocompleteProps) {
  const [results, setResults] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    let cancelled = false
    setIsLoading(true)

    const timer = setTimeout(async () => {
      const users = await searchUsers(query)
      if (!cancelled) {
        setResults(users)
        setSelectedIndex(0)
        setIsLoading(false)
      }
    }, 200)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!results.length) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % results.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + results.length) % results.length)
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        onSelect(results[selectedIndex].username)
      } else if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [results, selectedIndex, onSelect, onClose])

  if (!query || (!isLoading && !results.length)) return null

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-0 z-20 mb-1 w-64 overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
    >
      {isLoading ? (
        <div className="px-3 py-2 text-sm text-muted-foreground">
          Searching...
        </div>
      ) : (
        <ul className="py-1">
          {results.map((user, i) => {
            const displayName =
              user.display_name || user.username
            const initials = displayName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()

            return (
              <li key={user.id}>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onSelect(user.username)
                  }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
                    i === selectedIndex ? "bg-muted" : ""
                  }`}
                >
                  <Avatar className="h-6 w-6">
                    {user.avatar_url && (
                      <AvatarImage src={user.avatar_url} alt={displayName} />
                    )}
                    <AvatarFallback className="text-[10px]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{displayName}</span>
                    <span className="ml-1 text-muted-foreground">
                      @{user.username}
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
