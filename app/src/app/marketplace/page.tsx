"use client"

import { useEffect, useState } from "react"
import { Package, ShoppingBag } from "lucide-react"

import {
  NeonPage,
  NeonHero,
  NeonGrid,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"
import { ListingCard } from "@/components/marketplace/listing-card"
import { PackCard } from "@/components/marketplace/pack-card"
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters"
import {
  getMarketplaceListings,
  getMarketplacePacks,
  clearSample,
  type MarketplaceFilters as FilterType,
} from "@/lib/data/marketplace"
import type { MarketplaceListing, MarketplacePack } from "@/lib/data/types"

export default function MarketplacePage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [packs, setPacks] = useState<MarketplacePack[]>([])
  const [filters, setFilters] = useState<FilterType>({})
  const [loading, setLoading] = useState(true)
  const [clearingId, setClearingId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([getMarketplaceListings(filters), getMarketplacePacks()])
      .then(([listingData, packData]) => {
        setListings(listingData)
        setPacks(packData)
      })
      .finally(() => setLoading(false))
  }, [filters])

  async function handleClear(listing: MarketplaceListing) {
    setClearingId(listing.id)
    try {
      await clearSample({ listingId: listing.id })
    } finally {
      setClearingId(null)
    }
  }

  return (
    <NeonPage className="max-w-7xl">
      <NeonHero
        eyebrow="Sample Clearance Marketplace"
        title="Find, preview, and clear samples in one click."
        description="Browse royalty-free samples, AI alternatives, and pre-cleared stems. License instantly for your next mashup."
      />

      {/* Packs Section */}
      {packs.length > 0 && (
        <>
          <NeonSectionHeader
            title="Sample Packs"
            description="Bundled sample collections with bulk discounts"
          />
          <NeonGrid className="sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {packs.map((pack) => (
              <PackCard key={pack.id} pack={pack} />
            ))}
          </NeonGrid>
        </>
      )}

      {/* Filters */}
      <NeonSectionHeader
        title="Browse Samples"
        description="Search, filter, and preview individual samples"
      />
      <MarketplaceFilters filters={filters} onChange={setFilters} />

      {/* Listings */}
      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading marketplace...
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            No samples match your filters. Try adjusting your search.
          </p>
        </div>
      ) : (
        <NeonGrid className="sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClear={handleClear}
            />
          ))}
        </NeonGrid>
      )}
    </NeonPage>
  )
}
