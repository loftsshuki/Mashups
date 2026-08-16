import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { Archivo_Black, IBM_Plex_Mono, Space_Grotesk } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { NowPlayingBar } from "@/components/layout/now-playing-bar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PostHogPageView, PostHogProvider } from "@/lib/analytics/posthog"
import { DemoBanner } from "@/components/demo/demo-banner"
import { WebVitals } from "@/components/observability/web-vitals"
import { AudioProvider } from "@/lib/audio/audio-context"
import { PwaBoot } from "@/components/pwa/pwa-boot"
import "./globals.css"

const display = Archivo_Black({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})

const sans = Space_Grotesk({
  variable: "--font-sans-custom",
  subsets: ["latin"],
  display: "swap",
})

const mono = IBM_Plex_Mono({
  variable: "--font-mono-custom",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mashups.agency"),
  title: {
    default: "Mashups | Make The Version You Wish Existed",
    template: "%s | Mashups",
  },
  description:
    "Pick two rights-cleared tracks, hear three real arrangements, and publish a version the next creator can fork.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Mashups | Make The Version You Wish Existed",
    description:
      "The rights-cleared social playground for making, sharing, and forking mashups.",
    siteName: "Mashups",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mashups | Make The Version You Wish Existed",
    description: "Two tracks in. Three arrangements out. Every source credited.",
  },
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#ff4f1f" }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <AudioProvider>
              <TooltipProvider delayDuration={200}>
                <a href="#main-content" className="skip-link">Skip to content</a>
                <Suspense fallback={null}>
                  <PostHogPageView />
                  <DemoBanner />
                </Suspense>
                <WebVitals />
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
                  <Footer />
                  <PwaBoot />
                  <NowPlayingBar />
                </div>
              </TooltipProvider>
            </AudioProvider>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
