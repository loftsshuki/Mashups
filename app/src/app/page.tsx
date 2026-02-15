import Link from "next/link";
import { ArrowRight, Headphones } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MashupCard } from "@/components/mashup-card";
import { CreatorAvatar } from "@/components/creator-avatar";
import { SmartMashupLab } from "@/components/discovery/smart-mashup-lab";
import { EditorialStats } from "@/components/editorial-stats";
import { mapRowToMockMashup } from "@/lib/data/mashup-adapter";
import { getMomentumFeed } from "@/lib/data/momentum-feed";
import { getTrendingMashups } from "@/lib/data/mashups";
import { mockCreators } from "@/lib/mock-data";

// Editorial feature data
const features = [
  {
    number: "01",
    title: "AI-Powered Mashup Creation",
    description:
      "Upload your stems and let our AI handle the mixing. Automatic key and tempo matching, smart vocal isolation, and one-click publishing to every platform. Professional-sounding mashups in minutes, not hours.",
    href: "/create",
    cta: "Start Creating",
  },
  {
    number: "02",
    title: "Real-Time Collaborative Studio",
    description:
      "Produce together in real-time from anywhere in the world. Shared transport control, synced BPM, live presence indicators, and built-in video chat. The distance between you and your collaborators disappears.",
    href: "/studio",
    cta: "Enter Studio",
  },
  {
    number: "03",
    title: "Built-In Rights Protection",
    description:
      "Every mashup comes with automated rights clearance. Issue licenses, track usage across platforms, and monetize with confidence. A 99.2% clearance rate means you can focus on the music, not the paperwork.",
    href: "/dashboard/rights",
    cta: "View Rights Dashboard",
  },
  {
    number: "04",
    title: "Growth Analytics & Attribution",
    description:
      "Track every play, share, and remix across platforms. Automatic attribution on shares means you get credit and payment for every use of your music. Understand your audience and grow 3x faster.",
    href: "/dashboard/analytics",
    cta: "Open Analytics",
  },
] as const;

export default async function Home() {
  const [trendingRows, momentumMashups] = await Promise.all([
    getTrendingMashups(6),
    getMomentumFeed(4),
  ]);
  const trendingMashups = trendingRows.map((row) =>
    mapRowToMockMashup(row as unknown as Record<string, unknown>)
  );

  return (
    <div className="pt-16">
      {/* ================================================================
          HERO — Editorial Spread
          ================================================================ */}
      <section className="relative overflow-hidden">
        <div className="container-padding max-w-[1400px] mx-auto py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl">
            {/* Section Label */}
            <p className="section-label text-primary mb-6">
              The platform for
            </p>

            {/* Headline — Instrument Serif */}
            <h1 className="font-[family-name:var(--font-editorial)] text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight">
              Music Mashup
              <br />
              <span className="italic text-primary">Creators</span>
            </h1>

            {/* Description */}
            <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Upload stems, remix with AI, and share everywhere. Built for
              creators who want professional sound without the studio overhead.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button size="lg" className="h-12 px-8 rounded-md" asChild>
                <Link href="/create">
                  Start Creating
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 rounded-md"
                asChild
              >
                <Link href="/explore">Explore Mashups</Link>
              </Button>
            </div>

            {/* Platform note */}
            <p className="mt-6 section-label">
              Share to YouTube, TikTok, Instagram, Twitch, and more
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================
          STATS — Pure Typography
          ================================================================ */}
      <section className="border-y border-border/50">
        <div className="container-padding max-w-[1400px] mx-auto py-16 md:py-20">
          <EditorialStats />
        </div>
      </section>

      {/* ================================================================
          FEATURES — Editorial Spreads
          ================================================================ */}
      <section className="section-spacing">
        <div className="container-padding max-w-[1400px] mx-auto">
          {/* Section Header */}
          <div className="max-w-2xl mb-20">
            <p className="section-label text-primary mb-4">What we build</p>
            <h2 className="font-[family-name:var(--font-editorial)] text-3xl md:text-4xl lg:text-5xl tracking-tight leading-[1.1]">
              Everything you need to create and grow
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From AI-powered mixing to rights management, Mashups gives you the
              tools to focus on what matters — the music.
            </p>
          </div>

          {/* Feature Spreads */}
          <div className="space-y-24 md:space-y-32">
            {features.map((feature) => (
              <div key={feature.number} className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Number */}
                <div className="lg:col-span-2">
                  <span className="editorial-number text-6xl md:text-8xl opacity-30">
                    {feature.number}
                  </span>
                </div>

                {/* Content */}
                <div className="lg:col-span-7">
                  <h3 className="font-[family-name:var(--font-editorial)] text-2xl md:text-3xl lg:text-4xl tracking-tight leading-[1.1]">
                    {feature.title}
                  </h3>

                  <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="mt-8">
                    <Button
                      variant="outline"
                      className="rounded-md"
                      asChild
                    >
                      <Link href={feature.href}>
                        {feature.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          TRENDING — Magazine Shelf
          ================================================================ */}
      <section className="section-spacing border-t border-border/50">
        <div className="container-padding max-w-[1400px] mx-auto">
          {/* Section Header */}
          <div className="flex items-end justify-between gap-4 mb-2">
            <p className="section-label">Trending Now</p>
            <Link
              href="/explore"
              className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors link-animated"
            >
              Explore all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="editorial-rule mb-8" />

          {/* Horizontal Scroll */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {trendingMashups.map((mashup) => (
              <MashupCard
                key={mashup.id}
                id={mashup.id}
                title={mashup.title}
                coverUrl={mashup.coverUrl}
                audioUrl={mashup.audioUrl}
                genre={mashup.genre}
                duration={mashup.duration}
                playCount={mashup.playCount}
                creator={mashup.creator}
                className="w-[220px] min-w-[220px] sm:w-[260px] sm:min-w-[260px]"
              />
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="mt-6 sm:hidden">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/explore">Explore all mashups</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ================================================================
          SMART MASHUP LAB
          ================================================================ */}
      <SmartMashupLab />

      {/* ================================================================
          MOMENTUM FEED
          ================================================================ */}
      <section className="section-spacing border-t border-border/50">
        <div className="container-padding max-w-[1400px] mx-auto">
          {/* Section Header */}
          <p className="section-label mb-2">Gaining Momentum</p>
          <div className="editorial-rule mb-8" />

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {momentumMashups.map((mashup) => (
              <MashupCard
                key={mashup.id}
                id={mashup.id}
                title={mashup.title}
                coverUrl={mashup.coverUrl}
                audioUrl={mashup.audioUrl}
                genre={mashup.genre}
                duration={mashup.duration}
                playCount={mashup.playCount}
                creator={mashup.creator}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          CREATORS — Editorial Community
          ================================================================ */}
      <section className="section-spacing border-t border-border/50">
        <div className="container-padding max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <p className="section-label text-primary mb-4">Community</p>

              <h2 className="font-[family-name:var(--font-editorial)] text-3xl md:text-4xl lg:text-5xl tracking-tight leading-[1.1]">
                A community of music innovators
              </h2>

              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Connect with creators, collaborate on tracks, and grow your
                audience together. Built on sharing, attribution, and mutual
                support.
              </p>

              {/* Stats inline */}
              <div className="mt-8 flex gap-12">
                <div>
                  <div className="editorial-number text-3xl">18,400+</div>
                  <p className="section-label mt-1">Monthly creators</p>
                </div>
                <div>
                  <div className="editorial-number text-3xl">26</div>
                  <p className="section-label mt-1">Avg. clips per campaign</p>
                </div>
              </div>

              <div className="mt-8">
                <Button className="rounded-md" asChild>
                  <Link href="/signup">
                    Join the Community
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Creator Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mockCreators.slice(0, 6).map((creator) => (
                <Link
                  key={creator.username}
                  href={`/profile/${creator.username}`}
                  className="group p-3 rounded-lg bg-card border border-border/50 hover:border-primary/20 transition-all duration-500 hover:-translate-y-1"
                >
                  <CreatorAvatar
                    username={creator.username}
                    displayName={creator.displayName}
                    avatarUrl={creator.avatarUrl}
                    followerCount={creator.followerCount}
                    mashupCount={creator.mashupCount}
                    size="lg"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          FINAL CTA — Editorial Simplicity
          ================================================================ */}
      <section className="section-spacing">
        <div className="container-padding max-w-[1400px] mx-auto">
          <div className="editorial-rule" />
          <div className="py-16 md:py-24 text-center max-w-2xl mx-auto">
            <h2 className="font-[family-name:var(--font-editorial)] text-3xl md:text-4xl lg:text-5xl tracking-tight leading-[1.1]">
              Ready to create your first{" "}
              <span className="italic text-primary">mashup</span>?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of creators who are already mixing, sharing, and
              growing their audience on Mashups.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 rounded-md" asChild>
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 rounded-md"
                asChild
              >
                <Link href="/enterprise">
                  <Headphones className="mr-2 h-4 w-4" />
                  Talk to Sales
                </Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Free plan includes 5 mashups/month. No credit card required.
            </p>
          </div>
          <div className="editorial-rule" />
        </div>
      </section>
    </div>
  );
}
