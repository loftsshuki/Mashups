"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { Globe } from "lucide-react"

const GlobalMashupMap = dynamic(
  () => import("@/components/map/global-mashup-map").then((m) => m.GlobalMashupMap),
  { ssr: false }
)

export default function MapPage() {
  return (
    <div className="relative h-[calc(100vh-4rem)]">
      {/* Header overlay */}
      <div className="absolute top-4 left-4 z-10 rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm px-4 py-3 space-y-1">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Mashup Map</h1>
        </div>
        <p className="text-xs text-muted-foreground">Real-time global creative activity</p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center h-full bg-background">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      }>
        <GlobalMashupMap />
      </Suspense>
    </div>
  )
}
