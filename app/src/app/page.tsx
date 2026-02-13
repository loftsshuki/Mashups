import Link from "next/link"
import {
  Zap,
  Headphones,
  Flame,
  Users,
  Upload,
  Sliders,
  Share2,
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

export default function Home() {
  const trendingMashups = mockMashups.slice(0, 6)
  const momentumMashups = computeMomentum(mockMashups).slice(0, 4)

  return (
    <div className="pb-20">
      {/* ── Hero Section ── */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Create. Mix. Share.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            The community platform for music mashup creators. Upload your
            favorite tracks, blend them together, and share your creations with
            the world.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="neon-outline" asChild>
              <Link href="/create">
                <Zap className="size-5" />
                Start Creating
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/explore">
                <Headphones className="size-5" />
                Explore Mashups
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Trending Mashups Section ── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3">
            <Flame className="size-7 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Trending Now</h2>
              <p className="text-sm text-muted-foreground">
                What the community is vibing to
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
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Creator OS Modules</h2>
            <p className="text-sm text-muted-foreground">
              Everything needed to go from draft to viral distribution.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featureShowcase.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="neon-surface rounded-lg p-5 transition-colors hover:border-primary/50"
              >
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                <p className="mt-3 text-sm font-medium text-primary">Open module</p>
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
              <Card key={step.title} className="text-center">
                <CardContent className="flex flex-col items-center gap-4 pt-6">
                  <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10">
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
          <div className="neon-surface rounded-2xl px-6 py-16 text-center md:px-16">
            <h2 className="text-3xl font-bold">
              Ready to create your first mashup?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Join thousands of creators already making music on Mashups.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/signup">Sign Up Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
