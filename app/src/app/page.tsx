import Link from "next/link"
import {
  ArrowRight,
  AudioLines,
  Flame,
  Headphones,
  LineChart,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { MashupCard } from "@/components/mashup-card"
import { CreatorAvatar } from "@/components/creator-avatar"
import { SmartMashupLab } from "@/components/discovery/smart-mashup-lab"
import { mockCreators, mockMashups } from "@/lib/mock-data"
import { computeMomentum } from "@/lib/growth/momentum"

const creatorChannels = [
  "YouTube Shorts",
  "Instagram Reels",
  "TikTok",
  "OnlyFans",
  "Discord",
  "X / Twitter",
] as const

const featurePills = [
  "Weekly Viral Pack",
  "15s Hook Generator",
  "Campaign Copilot",
  "Realtime Studio",
  "Rights + Licensing",
  "Attribution Links",
  "Creator Scoreboard",
  "Creator Payouts",
] as const

const launchChecks = [
  ["Campaigns active", "48"],
  ["Weekly pack clips", "20"],
  ["Creator clips shipped", "1,284"],
  ["Licenses issued", "319"],
] as const

const platformPillars = [
  {
    icon: Sparkles,
    title: "Campaign Copilot for weekly creator drops.",
    description:
      "Generate hooks, posting cadence, and tracking links in minutes. Keep creators on-message without slowing them down.",
    bullets: [
      "Built-in caption and CTA generator",
      "Attribution signing for every outbound share",
      "Weekly planner for Shorts/Reels/TikTok",
    ],
    metricLabel: "Campaign velocity",
    metricValue: "+42% week-over-week",
    href: "/campaigns",
    cta: "Open Campaign Builder",
  },
  {
    icon: Radio,
    title: "Realtime Studio for collaborative mashup sessions.",
    description:
      "Sync transport state, BPM, and session presence so collaborators can co-produce without drift.",
    bullets: [
      "Shared play/pause and timeline control",
      "Realtime participant presence",
      "Studio-first workflow tied to publish",
    ],
    metricLabel: "Collab sessions",
    metricValue: "5.3k this month",
    href: "/studio",
    cta: "Enter Studio",
  },
  {
    icon: ShieldCheck,
    title: "Rights and licensing rails from day one.",
    description:
      "Issue creator-safe licenses, process claims, and route usage into monetization dashboards.",
    bullets: [
      "Legal policy surfaces already wired",
      "Claim handling and moderation queue",
      "License issuance and redemption pages",
    ],
    metricLabel: "Rights confidence",
    metricValue: "99.2% clear distribution",
    href: "/dashboard/rights",
    cta: "View Rights Dashboard",
  },
  {
    icon: LineChart,
    title: "For-you ranking and growth analytics baked in.",
    description:
      "Track recommendation events, rank by momentum, and iterate faster with creator-level signals.",
    bullets: [
      "For-you sort default in discovery",
      "Momentum scoring across catalog",
      "Analytics + monetization dashboards",
    ],
    metricLabel: "Discovery lift",
    metricValue: "3.1x faster pickup",
    href: "/dashboard/analytics",
    cta: "Open Analytics",
  },
] as const

export default function Home() {
  const trendingMashups = mockMashups.slice(0, 6)
  const momentumMashups = computeMomentum(mockMashups).slice(0, 4)

  return (
    <div className="pb-24">
      <section className="relative overflow-hidden border-b border-border/70 py-20 md:py-28">
        <div className="neon-grid pointer-events-none absolute inset-0 opacity-55" />
        <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-16 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <AudioLines className="size-3.5" />
              Mashups Platform
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                The creator music platform for viral distribution at scale.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              Neon-level polish, adapted for mashup growth. Build tracks,
              activate creators, issue safe licenses, and convert every share
              into measurable demand.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="rounded-full px-7" asChild>
                <Link href="/create">
                  Start Creating
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-primary/35 bg-transparent px-7"
                asChild
              >
                <Link href="/launchpad">
                  Open Launchpad
                  <Zap className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-primary/35 bg-transparent px-7"
                asChild
              >
                <Link href="/packs">
                  Weekly Viral Pack
                  <Flame className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-5">
            <div className="neon-panel rounded-3xl p-6 lg:col-span-3">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary" />
                <span className="size-2 rounded-full bg-secondary" />
                <span className="size-2 rounded-full bg-accent" />
                <span className="ml-2 text-xs text-muted-foreground">
                  campaign-runner.sh
                </span>
              </div>
              <div className="mt-5 space-y-2 font-mono text-sm">
                <p className="text-primary">$ mashups launch --campaign friday_fire</p>
                <p className="text-foreground">Creating creator task list...</p>
                <p className="text-foreground">Signing attribution links...</p>
                <p className="text-foreground">Publishing weekly schedule...</p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {launchChecks.map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-primary/20 bg-background/45 px-3 py-2"
                  >
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:col-span-2">
              <div className="neon-panel rounded-3xl p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Creator Loop
                </p>
                <p className="mt-2 text-lg font-semibold">
                  Share clips with built-in Mashups signatures and route fans
                  back to source.
                </p>
                <Button
                  variant="ghost"
                  className="mt-4 h-8 rounded-full bg-background/70 px-3 text-xs"
                  asChild
                >
                  <Link href="/partner">View Partner Flow</Link>
                </Button>
              </div>
              <div className="neon-panel rounded-3xl p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Pricing
                </p>
                <p className="mt-2 text-lg font-semibold">
                  Turn rights + creator growth into recurring revenue.
                </p>
                <Button
                  variant="ghost"
                  className="mt-4 h-8 rounded-full bg-background/70 px-3 text-xs"
                  asChild
                >
                  <Link href="/pricing">Open Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 py-7">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Deployed by creators across
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {creatorChannels.map((channel) => (
              <div
                key={channel}
                className="rounded-xl border border-border bg-background/50 px-3 py-2 text-center text-sm text-muted-foreground"
              >
                {channel}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 px-4 sm:px-6 lg:px-8">
          {featurePills.map((pill) => (
            <span
              key={pill}
              className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              {pill}
            </span>
          ))}
        </div>
      </section>

      {platformPillars.map((pillar, index) => (
        <section key={pillar.title} className="border-b border-border/70 py-16 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
            <div className={index % 2 ? "lg:order-2 lg:col-span-3" : "lg:col-span-3"}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <pillar.icon className="size-3.5" />
                Platform Block {index + 1}
              </div>
              <h2 className="mt-4 max-w-2xl text-pretty text-3xl font-semibold tracking-tight md:text-4xl">
                {pillar.title}
              </h2>
              <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
                {pillar.description}
              </p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {pillar.bullets.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className={index % 2 ? "lg:order-1 lg:col-span-2" : "lg:col-span-2"}>
              <div className="neon-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {pillar.metricLabel}
                </p>
                <p className="mt-3 text-3xl font-semibold">{pillar.metricValue}</p>
                <Button className="mt-8 w-full rounded-full" asChild>
                  <Link href={pillar.href}>{pillar.cta}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="border-b border-border/70 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Users className="size-3.5" />
              Trusted by creators
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Community momentum, not vanity traffic.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Mashups is optimized for creator conversion loops: discover, remix,
              share, attribute, and monetize.
            </p>
            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-border bg-background/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">Monthly active creators</p>
                <p className="text-lg font-semibold">18,400+</p>
              </div>
              <div className="rounded-xl border border-border bg-background/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">Average clips per campaign</p>
                <p className="text-lg font-semibold">26</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-3">
            {mockCreators.map((creator) => (
              <div key={creator.username} className="neon-panel rounded-2xl p-3">
                <CreatorAvatar
                  username={creator.username}
                  displayName={creator.displayName}
                  avatarUrl={creator.avatarUrl}
                  followerCount={creator.followerCount}
                  mashupCount={creator.mashupCount}
                  size="lg"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Flame className="size-7 text-primary" />
              <div>
                <h2 className="text-3xl font-semibold">Trending Now</h2>
                <p className="text-sm text-muted-foreground">
                  Discover what creators are remixing this week.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="rounded-full border-primary/35 bg-transparent"
              asChild
            >
              <Link href="/explore">Explore all</Link>
            </Button>
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

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3">
            <LineChart className="size-7 text-primary" />
            <div>
              <h2 className="text-3xl font-semibold">Momentum Feed</h2>
              <p className="text-sm text-muted-foreground">
                Velocity-ranked tracks with engagement-weighted lift.
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
          <div className="neon-panel rounded-3xl px-6 py-14 text-center md:px-14">
            <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
              Ship your next creator campaign in one platform.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
              Create mashups, launch creator briefs, track attribution, and
              monetize rights from a single control plane.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link href="/signup">
                  Get Started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full" asChild>
                <Link href="/scoreboard">
                  Weekly Scoreboard
                  <LineChart className="size-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className="rounded-full" asChild>
                <Link href="/enterprise">
                  <Headphones className="size-4" />
                  Talk Enterprise
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
