"use client"

import { Search, SlidersHorizontal, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SAMPLE_TYPES, MARKETPLACE_GENRES } from "@/lib/data/marketplace"
import type { MarketplaceFilters as FilterType } from "@/lib/data/marketplace"

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "price_low", label: "Price: Low" },
  { value: "price_high", label: "Price: High" },
  { value: "rating", label: "Top Rated" },
] as const

interface MarketplaceFiltersProps {
  filters: FilterType
  onChange: (filters: FilterType) => void
  className?: string
}

export function MarketplaceFilters({
  filters,
  onChange,
  className,
}: MarketplaceFiltersProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={filters.query ?? ""}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Search samples..."
          className="h-10 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm"
        />
      </div>

      {/* Sample type filter */}
      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant={!filters.sampleType ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onChange({ ...filters, sampleType: undefined })}
        >
          All Types
        </Badge>
        {SAMPLE_TYPES.map((type) => (
          <Badge
            key={type.value}
            variant={filters.sampleType === type.value ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() =>
              onChange({
                ...filters,
                sampleType:
                  filters.sampleType === type.value ? undefined : type.value,
              })
            }
          >
            {type.label}
          </Badge>
        ))}
      </div>

      {/* Genre + Sort + AI toggle */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filters.genre ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              genre: e.target.value || undefined,
            })
          }
          className="h-8 rounded-lg border border-border bg-background px-2 text-xs"
        >
          <option value="">All Genres</option>
          {MARKETPLACE_GENRES.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>

        <select
          value={filters.sortBy ?? "newest"}
          onChange={(e) =>
            onChange({
              ...filters,
              sortBy: e.target.value as FilterType["sortBy"],
            })
          }
          className="h-8 rounded-lg border border-border bg-background px-2 text-xs"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <Button
          variant={filters.aiOnly ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1 rounded-full text-xs"
          onClick={() => onChange({ ...filters, aiOnly: !filters.aiOnly })}
        >
          <Sparkles className="h-3 w-3" />
          AI Alternatives
        </Button>
      </div>
    </div>
  )
}
