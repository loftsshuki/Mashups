import type { Metadata } from "next"
import { Suspense } from "react"
import { Archivo_Black, IBM_Plex_Mono, Space_Grotesk } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { NowPlayingBar } from "@/components/layout/now-playing-bar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PostHogPageView, PostHogProvider } from "@/lib/analytics/posthog"
import { AudioProvider } from "@/lib/audio/audio-context"
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
  metadataBase: new URL("https://mashups.agency"),
  title: {
    default: "Mashups | Turn Tracks Into Campaigns",
    template: "%s | Mashups",
  },
  description:
    "Cut hook-ready shorts, prove usage rights, publish with attribution, and learn what moves your audience.",
  openGraph: {
    title: "Mashups | Turn Tracks Into Campaigns",
    description:
      "The rights-aware campaign studio for short-form music creators.",
    siteName: "Mashups",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mashups | Turn Tracks Into Campaigns",
    description: "One track. Three hooks. Rights proof. Measurable lift.",
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
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
                <Suspense fallback={null}>
                  <PostHogPageView />
                </Suspense>
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
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
