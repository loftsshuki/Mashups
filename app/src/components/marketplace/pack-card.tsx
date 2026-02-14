"use client"

import Image from "next/image"
import { Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { MarketplacePack } from "@/lib/data/types"

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

interface PackCardProps {
  pack: MarketplacePack
  className?: string
}

export function PackCard({ pack, className }: PackCardProps) {
  return (
    <div
      className={cn(
        "group overflow-hidden rounded-xl border border-border/70 bg-card/70 transition-colors hover:border-primary/30",
        className,
      )}
    >
      {/* Cover */}
      <div className="relative aspect-square bg-muted/30">
        {pack.cover_image_url ? (
          <Image
            src={pack.cover_image_url}
            alt={pack.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        {pack.discount_percent > 0 && (
          <Badge className="absolute right-2 top-2 bg-red-500 text-white">
            {pack.discount_percent}% OFF
          </Badge>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-foreground">
          {pack.title}
        </h3>
        {pack.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {pack.description}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {pack.seller && (
              <>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={pack.seller.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[8px]">
                    {(pack.seller.display_name ?? pack.seller.username)
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {pack.seller.display_name ?? pack.seller.username}
                </span>
              </>
            )}
          </div>
          <p className="text-sm font-bold text-primary">
            {formatMoney(pack.price_cents)}
          </p>
        </div>

        <p className="mt-1 text-[10px] text-muted-foreground">
          {pack.item_count ?? 0} samples
        </p>
      </div>
    </div>
  )
}
