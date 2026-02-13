import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudioProvider } from "@/lib/audio/audio-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NowPlayingBar } from "@/components/layout/now-playing-bar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mashups — Create, Share, Discover Music Mashups",
  description:
    "The community platform for music mashup creators. Upload tracks, mix them together, and share your creations with the world.",
  openGraph: {
    title: "Mashups — Create, Share, Discover Music Mashups",
    description:
      "The community platform for music mashup creators. Upload tracks, mix them together, and share your creations with the world.",
    siteName: "Mashups",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AudioProvider>
            <TooltipProvider>
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
