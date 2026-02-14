"use client"

import { Play, Star, Download, Sparkles, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { MarketplaceListing } from "@/lib/data/types"

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

const TYPE_COLORS: Record<string, string> = {
  loop: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  one_shot: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  stem: "bg-green-500/10 text-green-500 border-green-500/20",
  vocal: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  full_track: "bg-purple-500/10 text-purple-500 border-purple-500/20",
}

const TYPE_LABELS: Record<string, string> = {
  loop: "Loop",
  one_shot: "One-Shot",
  stem: "Stem",
  vocal: "Vocal",
  full_track: "Full Track",
}

interface ListingCardProps {
  listing: MarketplaceListing
  onClear?: (listing: MarketplaceListing) => void
  onPreview?: (listing: MarketplaceListing) => void
  className?: string
}

export function ListingCard({
  listing,
  onClear,
  onPreview,
  className,
}: ListingCardProps) {
  return (
    <div
      className={cn(
        "group rounded-xl border border-border/70 bg-card/70 p-4 transition-colors hover:border-primary/30",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {listing.title}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px]",
                TYPE_COLORS[listing.sample_type] ?? "",
              )}
            >
              {TYPE_LABELS[listing.sample_type] ?? listing.sample_type}
            </Badge>
            {listing.is_ai_alternative && (
              <Badge
                variant="outline"
                className="gap-0.5 border-cyan-500/20 bg-cyan-500/10 text-[10px] text-cyan-500"
              >
                <Sparkles className="h-2.5 w-2.5" />
                AI
              </Badge>
            )}
            {listing.license_type === "creative_commons" && (
              <Badge
                variant="outline"
                className="gap-0.5 border-green-500/20 bg-green-500/10 text-[10px] text-green-500"
              >
                <ShieldCheck className="h-2.5 w-2.5" />
                CC
              </Badge>
            )}
          </div>
        </div>
        <p className="whitespace-nowrap text-lg font-bold text-primary">
          {formatMoney(listing.price_cents)}
        </p>
      </div>

      {/* Description */}
      {listing.description && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {listing.description}
        </p>
      )}

      {/* Metadata */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {listing.bpm && <span>{listing.bpm} BPM</span>}
        {listing.key && <span>{listing.key}</span>}
        {listing.genre && <span>{listing.genre}</span>}
        {listing.duration_seconds && (
          <span>{listing.duration_seconds.toFixed(1)}s</span>
        )}
      </div>

      {/* Rating & Downloads */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {listing.rating_count > 0 && (
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              {listing.rating_avg.toFixed(1)} ({listing.rating_count})
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <Download className="h-3 w-3" />
            {listing.download_count}
          </span>
        </div>

        {/* Seller */}
        {listing.seller && (
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5">
              <AvatarImage src={listing.seller.avatar_url ?? undefined} />
              <AvatarFallback className="text-[8px]">
                {(listing.seller.display_name ?? listing.seller.username)
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {listing.seller.display_name ?? listing.seller.username}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex-1 gap-1 rounded-full text-xs"
          onClick={() => onPreview?.(listing)}
        >
          <Play className="h-3 w-3" />
          Preview
        </Button>
        <Button
          size="sm"
          className="h-8 flex-1 gap-1 rounded-full text-xs"
          onClick={() => onClear?.(listing)}
        >
          Clear Sample
        </Button>
      </div>

      {/* Bulk pricing */}
      {listing.bulk_price_cents && (
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Bulk: {formatMoney(listing.bulk_price_cents)}/ea
        </p>
      )}
    </div>
  )
}
