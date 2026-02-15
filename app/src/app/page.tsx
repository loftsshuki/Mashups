import Link from "next/link";
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
  Play,
  BarChart3,
  Layers,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { MashupCard } from "@/components/mashup-card";
import { CreatorAvatar } from "@/components/creator-avatar";
import { SmartMashupLab } from "@/components/discovery/smart-mashup-lab";
import { CreateMashupTerminal } from "@/components/animated-terminal";
import { PlatformStats } from "@/components/stats-counter";
import { mapRowToMockMashup } from "@/lib/data/mashup-adapter";
import { getMomentumFeed } from "@/lib/data/momentum-feed";
import { getTrendingMashups } from "@/lib/data/mashups";
import { mockCreators } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// Feature section data
const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Mashup Creation",
    description:
      "Upload your stems and let our AI handle the mixing. Get professional-sounding mashups in minutes, not hours.",
    points: [
      "Automatic key and tempo matching",
      "Smart vocal isolation and enhancement",
      "One-click publishing to all platforms",
    ],
    stat: { value: "10x", label: "Faster production" },
    href: "/create",
    cta: "Start Creating",
  },
  {
    icon: Radio,
    title: "Real-Time Collaborative Studio",
    description:
      "Produce together in real-time. Share transport control, sync BPM, and jam with creators anywhere in the world.",
    points: [
      "Shared play/pause and timeline control",
      "Live participant presence indicators",
      "Built-in video chat for remote sessions",
    ],
    stat: { value: "5.3k", label: "Monthly sessions" },
    href: "/studio",
    cta: "Enter Studio",
  },
  {
    icon: ShieldCheck,
    title: "Built-In Rights Protection",
    description:
      "Every mashup comes with automated rights clearance. Issue licenses, track usage, and monetize with confidence.",
    points: [
      "Automated sample clearance checks",
      "Creator-safe license generation",
      "Real-time usage monitoring",
    ],
    stat: { value: "99.2%", label: "Clearance rate" },
    href: "/dashboard/rights",
    cta: "View Rights Dashboard",
  },
  {
    icon: LineChart,
    title: "Growth Analytics & Attribution",
    description:
      "Track every play, share, and remix. Understand your audience and get paid for every use of your music.",
    points: [
      "Cross-platform performance tracking",
      "Automatic attribution on shares",
      "Direct monetization dashboard",
    ],
    stat: { value: "3.1x", label: "Faster discovery" },
    href: "/dashboard/analytics",
    cta: "Open Analytics",
  },
] as const;

// Creator platforms
const platforms = [
  "YouTube Shorts",
  "Instagram Reels",
  "TikTok",
  "Twitch",
  "Discord",
  "X / Twitter",
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
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        {/* Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                              linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative container-padding max-w-7xl mx-auto py-20 md:py-32 lg:py-40">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <div className="stagger-children">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <AudioLines className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  Now with AI-powered mixing
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                Create viral music{" "}
                <span className="gradient-text">mashups</span> at the speed of
                sound
              </h1>

              {/* Description */}
              <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
                Upload stems, remix with AI, and share everywhere. Built for
                creators who want professional sound without the studio
                overhead.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
                  asChild
                >
                  <Link href="/create">
                    Start Creating
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 rounded-lg border-border/50 hover:bg-accent/50"
                  asChild
                >
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>

              {/* Mini social proof */}
              <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {mockCreators.slice(0, 4).map((creator) => (
                    <div
                      key={creator.username}
                      className="w-8 h-8 rounded-full border-2 border-background overflow-hidden"
                    >
                      <img
                        src={creator.avatarUrl}
                        alt={creator.displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span>
                  Join <strong className="text-foreground">18,000+</strong>{" "}
                  creators
                </span>
              </div>
            </div>

            {/* Right: Terminal */}
            <div className="relative lg:pl-8">
              <CreateMashupTerminal className="w-full" />
              
              {/* Decorative glow */}
              <div className="absolute -inset-4 bg-primary/10 blur-3xl -z-10 rounded-full opacity-50" />
            </div>
          </div>
        </div>

        {/* Trust Bar */}
        <div className="border-t border-border/50">
          <div className="container-padding max-w-7xl mx-auto py-12">
            <PlatformStats />
          </div>
        </div>
      </section>

      {/* Platform Logos */}
      <section className="border-b border-border/50 py-8">
        <div className="container-padding max-w-7xl mx-auto">
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Share everywhere your audience lives
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {platforms.map((platform) => (
              <div
                key={platform}
                className="px-4 py-2 rounded-lg bg-card border border-border/50 text-sm text-muted-foreground"
              >
                {platform}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-spacing">
        <div className="container-padding max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything you need to{" "}
              <span className="gradient-text">create and grow</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From AI-powered mixing to rights management, Mashups gives you
              the tools to focus on what matters — the music.
            </p>
          </div>

          {/* Features Grid */}
          <div className="space-y-24">
            {features.map((feature, index) => (
              <FeatureBlock
                key={feature.title}
                feature={feature}
                reversed={index % 2 === 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="section-spacing border-t border-border/50">
        <div className="container-padding max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Trending Now
              </h2>
              <p className="mt-1 text-muted-foreground">
                Discover what creators are remixing this week
              </p>
            </div>
            <Button
              variant="ghost"
              className="hidden sm:flex items-center gap-2"
              asChild
            >
              <Link href="/explore">
                Explore all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

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

      {/* Smart Mashup Lab */}
      <SmartMashupLab />

      {/* Momentum Feed */}
      <section className="section-spacing border-t border-border/50">
        <div className="container-padding max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Momentum Feed
              </h2>
              <p className="text-sm text-muted-foreground">
                Tracks gaining traction right now
              </p>
            </div>
          </div>

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

      {/* Creators Section */}
      <section className="section-spacing border-t border-border/50">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 mb-6">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Creator Community
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Join a community of{" "}
                <span className="gradient-text">music innovators</span>
              </h2>

              <p className="mt-4 text-lg text-muted-foreground">
                Connect with creators, collaborate on tracks, and grow your
                audience together. Our community is built on sharing,
                attribution, and mutual support.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-card border border-border/50">
                  <div className="text-2xl font-bold gradient-text">
                    18,400+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Monthly active creators
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border/50">
                  <div className="text-2xl font-bold gradient-text">26</div>
                  <div className="text-sm text-muted-foreground">
                    Avg. clips per campaign
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button className="h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg" asChild>
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
                  className="group p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
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

      {/* CTA Section */}
      <section className="section-spacing">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-background border border-border/50 p-8 md:p-12 lg:p-16">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Ready to create your first{" "}
                <span className="gradient-text">mashup</span>?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join thousands of creators who are already mixing, sharing, and
                growing their audience on Mashups.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
                  asChild
                >
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 rounded-lg border-border/50"
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
          </div>
        </div>
      </section>
    </div>
  );
}

// Feature Block Component
interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  points: readonly string[];
  stat: { value: string; label: string };
  href: string;
  cta: string;
}

function FeatureBlock({
  feature,
  reversed,
}: {
  feature: Feature;
  reversed: boolean;
}) {
  const Icon = feature.icon;

  return (
    <div
      className={cn(
        "grid lg:grid-cols-5 gap-8 lg:gap-12 items-center",
        reversed && "lg:direction-rtl"
      )}
    >
      {/* Content */}
      <div
        className={cn(
          "lg:col-span-3",
          reversed ? "lg:order-2 lg:direction-ltr" : "lg:direction-ltr"
        )}
      >
        <div className="inline-flex items-center gap-2 p-2 rounded-xl bg-primary/10 mb-4">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
          {feature.title}
        </h3>

        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          {feature.description}
        </p>

        <ul className="mt-6 space-y-3">
          {feature.points.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 mt-0.5 shrink-0">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span className="text-muted-foreground">{point}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Button
            className="h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
            asChild
          >
            <Link href={feature.href}>
              {feature.cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Visual */}
      <div
        className={cn(
          "lg:col-span-2",
          reversed ? "lg:order-1 lg:direction-ltr" : "lg:direction-ltr"
        )}
      >
        <div className="relative">
          <div className="surface-elevated p-6 md:p-8">
            {/* Icon Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {feature.stat.label}
              </span>
            </div>

            {/* Big Stat */}
            <div className="text-5xl md:text-6xl font-bold gradient-text">
              {feature.stat.value}
            </div>

            {/* Decorative element */}
            <div className="mt-6 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-primary to-accent rounded-full" />
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute -inset-4 bg-primary/5 blur-2xl -z-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
