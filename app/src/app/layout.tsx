import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudioProvider } from "@/lib/audio/audio-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NowPlayingBar } from "@/components/layout/now-playing-bar";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-editorial",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: "400",
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
      className={`${instrumentSerif.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} dark`}
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
