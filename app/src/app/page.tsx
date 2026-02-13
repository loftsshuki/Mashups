import Link from "next/link"
import {
  Zap,
  Headphones,
  Flame,
  Users,
  Upload,
  Sliders,
  Share2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MashupCard } from "@/components/mashup-card"
import { CreatorAvatar } from "@/components/creator-avatar"
import { SmartMashupLab } from "@/components/discovery/smart-mashup-lab"
import { mockMashups, mockCreators } from "@/lib/mock-data"
import { computeMomentum } from "@/lib/growth/momentum"

const howItWorks = [
  {
    icon: Upload,
    title: "Upload Tracks",
    description: "Bring your favorite songs to the mixer",
  },
  {
    icon: Sliders,
    title: "Mix & Blend",
    description: "Layer, arrange, and create your perfect mashup",
  },
  {
    icon: Share2,
    title: "Share & Connect",
    description: "Publish your creation and join the community",
  },
]

const featureShowcase = [
  {
    title: "Campaign Builder",
    description: "Plan weekly shorts with hooks, captions, and attribution links.",
    href: "/campaigns",
  },
  {
    title: "Collab Studio",
    description: "Realtime session presence and synchronized transport state.",
    href: "/studio",
  },
  {
    title: "Rights + Monetization",
    description: "Issue creator-safe licenses and track earnings from one dashboard.",
    href: "/dashboard",
  },
] as const

const trustPoints = [
  "Realtime studio collaboration",
  "Creator-safe licensing rails",
  "Attribution links for viral loops",
] as const

export default function Home() {
  const trendingMashups = mockMashups.slice(0, 6)
  const momentumMashups = computeMomentum(mockMashups).slice(0, 4)

  return (
    <div className="pb-20">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="neon-grid pointer-events-none absolute inset-0 opacity-55" />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="relative z-10 lg:col-span-3">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" />
              Creator OS for viral mashups
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Launch tracks that spread themselves.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Mashups combines studio tools, rights controls, and attribution
              loops so every short posted by creators can route more demand back
              to your platform.
            </p>

            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
              <Button size="lg" className="neon-outline rounded-full px-7" asChild>
                <Link href="/create">
                  Start Building
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full border-primary/30 bg-transparent" asChild>
                <Link href="/launchpad">
                  Open Launchpad
                  <Zap className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {trustPoints.map((point) => (
                <span
                  key={point}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-3 py-1 text-xs text-muted-foreground"
                >
                  <ShieldCheck className="size-3.5 text-primary" />
                  {point}
                </span>
              ))}
            </div>
          </div>

          <div className="relative z-10 lg:col-span-2">
            <div className="neon-panel rounded-3xl p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                This Week
              </p>
              <h3 className="mt-2 text-2xl font-semibold">Campaign Momentum</h3>
              <div className="mt-5 grid gap-3">
                {[
                  ["Attribution Click-Through", "+42%"],
                  ["Creator Shorts Published", "1,284"],
                  ["Licenses Issued", "319"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-primary/20 bg-background/45 px-3 py-2">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <Button className="w-full rounded-full" asChild>
                  <Link href="/campaigns">Build This Week&apos;s Plan</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="neon-rail rounded-2xl px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-primary-foreground">
                Built for creator-led distribution across Shorts, Reels, and fan communities.
              </p>
              <Button variant="ghost" className="h-8 rounded-full bg-background/75 px-3 text-xs" asChild>
                <Link href="/partner">View Partner Program</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3">
            <Flame className="size-7 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Trending Now</h2>
              <p className="text-sm text-muted-foreground">
                What creators are currently remixing
              </p>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
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
                className="w-[220px] min-w-[220px] sm:w-[240px] sm:min-w-[240px]"
              />
            ))}
          </div>
        </div>
      </section>

      <SmartMashupLab />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3">
            <Flame className="size-7 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Momentum</h2>
              <p className="text-sm text-muted-foreground">
                Fast-rising tracks ranked by velocity and engagement
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">Creator OS Modules</h2>
              <p className="text-sm text-muted-foreground">
                Each module maps to a specific growth and monetization loop.
              </p>
            </div>
            <Button variant="outline" className="rounded-full border-primary/30 bg-transparent" asChild>
              <Link href="/launchpad">Open all modules</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featureShowcase.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="neon-panel rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50"
              >
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                <p className="mt-4 text-sm font-medium text-primary">Open module</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Creators Section ── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3">
            <Users className="size-7 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Featured Creators</h2>
              <p className="text-sm text-muted-foreground">
                The artists shaping the mashup scene
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {mockCreators.map((creator) => (
              <CreatorAvatar
                key={creator.username}
                username={creator.username}
                displayName={creator.displayName}
                avatarUrl={creator.avatarUrl}
                followerCount={creator.followerCount}
                mashupCount={creator.mashupCount}
                size="lg"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-2 text-muted-foreground">
              Three steps to your next masterpiece
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {howItWorks.map((step) => (
              <Card key={step.title} className="neon-panel border-primary/20 text-center">
                <CardContent className="flex flex-col items-center gap-4 pt-6">
                  <div className="flex size-14 items-center justify-center rounded-xl bg-primary/15">
                    <step.icon className="size-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner Section ── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="neon-panel rounded-3xl px-6 py-16 text-center md:px-16">
            <h2 className="text-3xl font-bold">
              Ready to create your first mashup?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Join creators already publishing tracks, clips, and campaigns from one control surface.
            </p>
            <div className="mt-8">
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link href="/create">
                  Start Creating
                  <Zap className="size-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className="ml-3 rounded-full" asChild>
                <Link href="/explore">
                  <Headphones className="size-4" />
                  Explore Feed
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
