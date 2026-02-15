import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudioProvider } from "@/lib/audio/audio-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NowPlayingBar } from "@/components/layout/now-playing-bar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mashups — Create, Share, Discover Music Mashups",
    template: "%s | Mashups",
  },
  description:
    "The community platform for music mashup creators. Upload tracks, mix them together, and share your creations with the world.",
  openGraph: {
    title: "Mashups — Create, Share, Discover Music Mashups",
    description:
      "The community platform for music mashup creators. Upload tracks, mix them together, and share your creations with the world.",
    siteName: "Mashups",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mashups — Create, Share, Discover Music Mashups",
    description:
      "The community platform for music mashup creators. Upload tracks, mix them together.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AudioProvider>
            <TooltipProvider delayDuration={200}>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <NowPlayingBar />
              </div>
            </TooltipProvider>
          </AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
