"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingBag, Search, Filter, Package, Music, Download, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MarketplaceItem {
    id: string
    title: string
    creator: string
    price: number
    type: "pack" | "preset" | "template"
    rating: number
    sales: number
    thumbnail?: string
}

const mockItems: MarketplaceItem[] = [
    {
        id: "pack-001",
        title: "Neon Nights Sample Pack",
        creator: "@synthwave_king",
        price: 24.99,
        type: "pack",
        rating: 4.8,
        sales: 342,
    },
    {
        id: "pack-002",
        title: "Trap Drums Vol. 3",
        creator: "@beatmaker_pro",
        price: 19.99,
        type: "pack",
        rating: 4.6,
        sales: 892,
    },
    {
        id: "preset-001",
        title: "Future Bass Essentials",
        creator: "@edm_guru",
        price: 14.99,
        type: "preset",
        rating: 4.9,
        sales: 567,
    },
    {
        id: "template-001",
        title: "Lo-Fi Hip Hop Template",
        creator: "@chill_vibes",
        price: 29.99,
        type: "template",
        rating: 4.7,
        sales: 234,
    },
    {
        id: "pack-003",
        title: "Orchestral Hits",
        creator: "@cinematic_sounds",
        price: 34.99,
        type: "pack",
        rating: 4.5,
        sales: 156,
    },
    {
        id: "preset-002",
        title: "Analog Warmth Collection",
        creator: "@retro_synth",
        price: 19.99,
        type: "preset",
        rating: 4.8,
        sales: 445,
    },
]

function ItemCard({ item }: { item: MarketplaceItem }) {
    const typeIcons = {
        pack: Package,
        preset: Music,
        template: Download,
    }
    const Icon = typeIcons[item.type]

    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="p-0">
                <div className="relative aspect-video bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
                    <Icon className="h-12 w-12 text-muted-foreground/50 group-hover:scale-110 transition-transform" />
                    <Badge className="absolute top-3 right-3 capitalize" variant="secondary">
                        {item.type}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.creator}</p>
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-medium">{item.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">({item.sales} sales)</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center justify-between">
                <span className="text-lg font-bold">${item.price}</span>
                <Button size="sm" variant="secondary">
                    View Details
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function MarketplacePage() {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredItems = mockItems.filter(
        (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.creator.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="border-b bg-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <ShoppingBag className="h-8 w-8 text-primary" />
                                Marketplace
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Discover premium samples, presets, and templates from the community
                            </p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/earnings">
                                My Earnings
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search packs, presets, templates..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                    </Button>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="all" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="all">All Items</TabsTrigger>
                        <TabsTrigger value="packs">Sample Packs</TabsTrigger>
                        <TabsTrigger value="presets">Presets</TabsTrigger>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6">
                        {filteredItems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredItems.map((item) => (
                                    <ItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">No items found</h3>
                                <p className="text-muted-foreground">Try adjusting your search query</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="packs" className="mt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems
                                .filter((item) => item.type === "pack")
                                .map((item) => (
                                    <ItemCard key={item.id} item={item} />
                                ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="presets" className="mt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems
                                .filter((item) => item.type === "preset")
                                .map((item) => (
                                    <ItemCard key={item.id} item={item} />
                                ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="templates" className="mt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems
                                .filter((item) => item.type === "template")
                                .map((item) => (
                                    <ItemCard key={item.id} item={item} />
                                ))}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Sell Your Own CTA */}
                <div className="mt-16 rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center">
                    <h2 className="text-2xl font-bold mb-2">Create and Sell Your Own</h2>
                    <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                        Got sounds? Turn your samples, presets, and templates into income.
                        Join thousands of creators selling on Mashups.
                    </p>
                    <Button size="lg" asChild>
                        <Link href="/dashboard/monetization">Start Selling</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
