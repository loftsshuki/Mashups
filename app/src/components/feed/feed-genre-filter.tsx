"use client"

import { Badge } from "@/components/ui/badge"
import { GENRES } from "@/lib/data/genres"

interface FeedGenreFilterProps {
  activeGenre: string
  onGenreChange: (genre: string) => void
}

export function FeedGenreFilter({ activeGenre, onGenreChange }: FeedGenreFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {GENRES.map((genre) => (
        <Badge
          key={genre}
          variant={activeGenre === genre ? "default" : "secondary"}
          className="cursor-pointer shrink-0"
          onClick={() => onGenreChange(genre)}
        >
          {genre}
        </Badge>
      ))}
    </div>
  )
}
