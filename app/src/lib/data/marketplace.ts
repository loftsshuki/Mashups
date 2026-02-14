import { createClient } from "@/lib/supabase/client"
import type {
  MarketplaceListing,
  SampleClearance,
  SampleRating,
  MarketplacePack,
} from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const mockListings: MarketplaceListing[] = [
  {
    id: "ml-001",
    seller_id: "user-001",
    title: "Sunset Vocals - Dreamy Female Hook",
    description:
      "Clean female vocal hook, perfect for lo-fi and chill beats. Pre-cleared for commercial use.",
    sample_type: "vocal",
    genre: "Lo-fi",
    bpm: 85,
    key: "C minor",
    duration_seconds: 8.2,
    preview_url: "/samples/preview-vocal-001.mp3",
    download_url: null,
    price_cents: 1499,
    bulk_price_cents: 999,
    license_type: "standard",
    is_ai_alternative: false,
    tags: ["vocal", "female", "dreamy", "lo-fi", "hook"],
    download_count: 234,
    rating_avg: 4.7,
    rating_count: 42,
    is_published: true,
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-02-01T00:00:00Z",
    seller: {
      id: "user-001",
      username: "voxqueen",
      display_name: "Vox Queen",
      avatar_url: "https://placehold.co/100x100/ec4899/white?text=VQ",
      bio: "Vocalist & sample creator",
      created_at: "2026-01-01T00:00:00Z",
    },
  },
  {
    id: "ml-002",
    seller_id: "user-002",
    title: "808 Thunder Kit - Hard Trap Drums",
    description:
      "25 one-shot 808s and trap drum hits. Tuned and mixed. Royalty-free.",
    sample_type: "one_shot",
    genre: "Trap",
    bpm: null,
    key: null,
    duration_seconds: null,
    preview_url: "/samples/preview-808-kit.mp3",
    download_url: null,
    price_cents: 2499,
    bulk_price_cents: null,
    license_type: "standard",
    is_ai_alternative: false,
    tags: ["808", "drums", "trap", "hard", "one-shot"],
    download_count: 567,
    rating_avg: 4.9,
    rating_count: 89,
    is_published: true,
    created_at: "2026-01-28T00:00:00Z",
    updated_at: "2026-01-28T00:00:00Z",
    seller: {
      id: "user-002",
      username: "trapmaster",
      display_name: "Trap Master",
      avatar_url: "https://placehold.co/100x100/f97316/white?text=TM",
      bio: "Producer & sound designer",
      created_at: "2026-01-01T00:00:00Z",
    },
  },
  {
    id: "ml-003",
    seller_id: "user-003",
    title: "Neon Synth Loop - Retrowave Arp",
    description:
      "Pulsing retrowave arp loop at 128 BPM. Ready to drop into any synthwave track.",
    sample_type: "loop",
    genre: "Synthwave",
    bpm: 128,
    key: "A minor",
    duration_seconds: 16,
    preview_url: "/samples/preview-synth-001.mp3",
    download_url: null,
    price_cents: 999,
    bulk_price_cents: 699,
    license_type: "standard",
    is_ai_alternative: false,
    tags: ["synth", "loop", "retrowave", "arp", "synthwave"],
    download_count: 312,
    rating_avg: 4.5,
    rating_count: 56,
    is_published: true,
    created_at: "2026-02-05T00:00:00Z",
    updated_at: "2026-02-05T00:00:00Z",
    seller: {
      id: "user-003",
      username: "synthwave_rider",
      display_name: "Synthwave Rider",
      avatar_url: "https://placehold.co/100x100/8b5cf6/white?text=SR",
      bio: "Retro synth enthusiast",
      created_at: "2026-01-01T00:00:00Z",
    },
  },
  {
    id: "ml-004",
    seller_id: "user-001",
    title: "AI Guitar Riff - Blues Scale",
    description:
      "AI-generated blues guitar riff. Fully royalty-free alternative to sampling classic tracks.",
    sample_type: "loop",
    genre: "Blues",
    bpm: 95,
    key: "E minor",
    duration_seconds: 12,
    preview_url: "/samples/preview-ai-guitar.mp3",
    download_url: null,
    price_cents: 499,
    bulk_price_cents: null,
    license_type: "creative_commons",
    is_ai_alternative: true,
    tags: ["ai", "guitar", "blues", "riff", "royalty-free"],
    download_count: 89,
    rating_avg: 4.2,
    rating_count: 15,
    is_published: true,
    created_at: "2026-02-10T00:00:00Z",
    updated_at: "2026-02-10T00:00:00Z",
    seller: {
      id: "user-001",
      username: "voxqueen",
      display_name: "Vox Queen",
      avatar_url: "https://placehold.co/100x100/ec4899/white?text=VQ",
      bio: "Vocalist & sample creator",
      created_at: "2026-01-01T00:00:00Z",
    },
  },
  {
    id: "ml-005",
    seller_id: "user-004",
    title: "Acoustic Guitar Stem - Unplugged Sessions",
    description:
      "Isolated acoustic guitar stem from live session. Perfect for acoustic mashups.",
    sample_type: "stem",
    genre: "Acoustic",
    bpm: 110,
    key: "G major",
    duration_seconds: 45,
    preview_url: "/samples/preview-acoustic.mp3",
    download_url: null,
    price_cents: 1999,
    bulk_price_cents: 1499,
    license_type: "standard",
    is_ai_alternative: false,
    tags: ["acoustic", "guitar", "stem", "live", "unplugged"],
    download_count: 145,
    rating_avg: 4.8,
    rating_count: 31,
    is_published: true,
    created_at: "2026-02-08T00:00:00Z",
    updated_at: "2026-02-08T00:00:00Z",
    seller: {
      id: "user-004",
      username: "acoustic_joe",
      display_name: "Acoustic Joe",
      avatar_url: "https://placehold.co/100x100/22c55e/white?text=AJ",
      bio: "Session guitarist",
      created_at: "2026-01-01T00:00:00Z",
    },
  },
  {
    id: "ml-006",
    seller_id: "user-005",
    title: "EDM Drop Build - Festival Riser",
    description:
      "Massive festival riser build with noise sweep and snare roll. Ready to drop.",
    sample_type: "loop",
    genre: "EDM",
    bpm: 150,
    key: "F minor",
    duration_seconds: 16,
    preview_url: "/samples/preview-edm-riser.mp3",
    download_url: null,
    price_cents: 1299,
    bulk_price_cents: null,
    license_type: "standard",
    is_ai_alternative: false,
    tags: ["edm", "drop", "riser", "festival", "build"],
    download_count: 421,
    rating_avg: 4.6,
    rating_count: 67,
    is_published: true,
    created_at: "2026-02-03T00:00:00Z",
    updated_at: "2026-02-03T00:00:00Z",
    seller: {
      id: "user-005",
      username: "bass_nation",
      display_name: "Bass Nation",
      avatar_url: "https://placehold.co/100x100/06b6d4/white?text=BN",
      bio: "EDM producer",
      created_at: "2026-01-01T00:00:00Z",
    },
  },
]

const mockPacks: MarketplacePack[] = [
  {
    id: "pack-001",
    seller_id: "user-002",
    title: "Ultimate Trap Producer Kit",
    description: "Everything you need for hard-hitting trap beats",
    cover_image_url: "https://placehold.co/400x400/f97316/white?text=Trap+Kit",
    price_cents: 4999,
    discount_percent: 30,
    created_at: "2026-02-01T00:00:00Z",
    item_count: 5,
    seller: {
      id: "user-002",
      username: "trapmaster",
      display_name: "Trap Master",
      avatar_url: "https://placehold.co/100x100/f97316/white?text=TM",
      bio: null,
      created_at: "2026-01-01T00:00:00Z",
    },
  },
  {
    id: "pack-002",
    seller_id: "user-003",
    title: "Synthwave Essentials Vol. 1",
    description: "Retro synths, arp loops, and pads",
    cover_image_url:
      "https://placehold.co/400x400/8b5cf6/white?text=Synthwave",
    price_cents: 3499,
    discount_percent: 25,
    created_at: "2026-02-05T00:00:00Z",
    item_count: 8,
    seller: {
      id: "user-003",
      username: "synthwave_rider",
      display_name: "Synthwave Rider",
      avatar_url: "https://placehold.co/100x100/8b5cf6/white?text=SR",
      bio: null,
      created_at: "2026-01-01T00:00:00Z",
    },
  },
]

export interface MarketplaceFilters {
  genre?: string
  sampleType?: string
  minPrice?: number
  maxPrice?: number
  licenseType?: string
  aiOnly?: boolean
  query?: string
  sortBy?: "newest" | "popular" | "price_low" | "price_high" | "rating"
}

export async function getMarketplaceListings(
  filters?: MarketplaceFilters,
): Promise<MarketplaceListing[]> {
  if (!isSupabaseConfigured()) {
    let results = [...mockListings]
    if (filters?.genre)
      results = results.filter((l) => l.genre === filters.genre)
    if (filters?.sampleType)
      results = results.filter((l) => l.sample_type === filters.sampleType)
    if (filters?.aiOnly) results = results.filter((l) => l.is_ai_alternative)
    if (filters?.query) {
      const q = filters.query.toLowerCase()
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.tags.some((t) => t.includes(q)),
      )
    }
    if (filters?.sortBy === "price_low")
      results.sort((a, b) => a.price_cents - b.price_cents)
    if (filters?.sortBy === "price_high")
      results.sort((a, b) => b.price_cents - a.price_cents)
    if (filters?.sortBy === "rating")
      results.sort((a, b) => b.rating_avg - a.rating_avg)
    if (filters?.sortBy === "popular")
      results.sort((a, b) => b.download_count - a.download_count)
    return results
  }

  try {
    const supabase = createClient()
    let query = supabase
      .from("marketplace_listings")
      .select("*, seller:profiles!seller_id(*)")
      .eq("is_published", true)

    if (filters?.genre) query = query.eq("genre", filters.genre)
    if (filters?.sampleType)
      query = query.eq("sample_type", filters.sampleType)
    if (filters?.aiOnly) query = query.eq("is_ai_alternative", true)
    if (filters?.licenseType)
      query = query.eq("license_type", filters.licenseType)
    if (filters?.minPrice) query = query.gte("price_cents", filters.minPrice)
    if (filters?.maxPrice) query = query.lte("price_cents", filters.maxPrice)

    if (filters?.sortBy === "price_low")
      query = query.order("price_cents", { ascending: true })
    else if (filters?.sortBy === "price_high")
      query = query.order("price_cents", { ascending: false })
    else if (filters?.sortBy === "rating")
      query = query.order("rating_avg", { ascending: false })
    else if (filters?.sortBy === "popular")
      query = query.order("download_count", { ascending: false })
    else query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error || !data) return []
    return data as MarketplaceListing[]
  } catch {
    return []
  }
}

export async function getListingById(
  id: string,
): Promise<MarketplaceListing | null> {
  if (!isSupabaseConfigured())
    return mockListings.find((l) => l.id === id) ?? null

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("marketplace_listings")
      .select("*, seller:profiles!seller_id(*)")
      .eq("id", id)
      .single()

    if (error || !data) return null
    return data as MarketplaceListing
  } catch {
    return null
  }
}

export async function getMarketplacePacks(): Promise<MarketplacePack[]> {
  if (!isSupabaseConfigured()) return mockPacks

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("marketplace_packs")
      .select("*, seller:profiles!seller_id(*)")
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data as MarketplacePack[]
  } catch {
    return []
  }
}

export async function clearSample(params: {
  listingId: string
  mashupId?: string
}): Promise<SampleClearance | null> {
  if (!isSupabaseConfigured()) {
    const listing = mockListings.find((l) => l.id === params.listingId)
    return {
      id: `sc-${Date.now()}`,
      listing_id: params.listingId,
      buyer_id: "mock-user",
      mashup_id: params.mashupId ?? null,
      price_cents: listing?.price_cents ?? 0,
      license_type: listing?.license_type ?? "standard",
      cleared_at: new Date().toISOString(),
      license_document_url: null,
    }
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const listing = await getListingById(params.listingId)
    if (!listing) return null

    const { data, error } = await supabase
      .from("sample_clearances")
      .insert({
        listing_id: params.listingId,
        buyer_id: user.id,
        mashup_id: params.mashupId ?? null,
        price_cents: listing.price_cents,
        license_type: listing.license_type,
      })
      .select()
      .single()

    if (error || !data) return null
    return data as SampleClearance
  } catch {
    return null
  }
}

export async function getUserClearances(
  userId: string,
): Promise<SampleClearance[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("sample_clearances")
      .select("*, listing:marketplace_listings(*)")
      .eq("buyer_id", userId)
      .order("cleared_at", { ascending: false })

    if (error || !data) return []
    return data as SampleClearance[]
  } catch {
    return []
  }
}

export async function rateSample(
  listingId: string,
  rating: number,
  review?: string,
): Promise<SampleRating | null> {
  if (!isSupabaseConfigured()) {
    return {
      id: `sr-${Date.now()}`,
      listing_id: listingId,
      user_id: "mock-user",
      rating,
      review: review ?? null,
      created_at: new Date().toISOString(),
    }
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from("sample_ratings")
      .upsert(
        {
          listing_id: listingId,
          user_id: user.id,
          rating,
          review: review ?? null,
        },
        { onConflict: "listing_id,user_id" },
      )
      .select()
      .single()

    if (error || !data) return null
    return data as SampleRating
  } catch {
    return null
  }
}

export const SAMPLE_TYPES = [
  { value: "loop", label: "Loops" },
  { value: "one_shot", label: "One-Shots" },
  { value: "stem", label: "Stems" },
  { value: "vocal", label: "Vocals" },
  { value: "full_track", label: "Full Tracks" },
] as const

export const MARKETPLACE_GENRES = [
  "Hip-Hop",
  "Trap",
  "EDM",
  "Lo-fi",
  "Pop",
  "R&B",
  "Rock",
  "Jazz",
  "Classical",
  "Synthwave",
  "Acoustic",
  "Blues",
  "House",
  "Drum & Bass",
] as const
