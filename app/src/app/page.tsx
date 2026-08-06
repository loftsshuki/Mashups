import Image from "next/image"
import Link from "next/link"
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Captions,
  Check,
  FileCheck2,
  Link2,
  Play,
  Scissors,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WandSparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { getMomentumFeed } from "@/lib/data/momentum-feed"

const waveform = [
  18, 34, 51, 28, 62, 82, 48, 91, 64, 36, 74, 96, 58, 43, 79, 52, 26, 68,
  88, 47, 72, 39, 84, 57, 31, 69, 94, 61, 45, 77, 53, 87, 41, 66, 92, 49,
]

const workflow = [
  {
    number: "01",
    verb: "CUT",
    title: "Find the stop-scroll moment",
    copy: "Upload a track. Mashups maps the energy, proposes three 15-second hooks, and keeps every cut editable.",
    icon: Scissors,
  },
  {
    number: "02",
    verb: "PROVE",
    title: "Know exactly what you can post",
    copy: "Rights mode, usage type, territory, and license window resolve before export. Proof travels with the clip.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    verb: "SHIP",
    title: "Leave with a campaign, not a file",
    copy: "Every export includes captions, attribution copy, a signed campaign link, and platform-ready framing.",
    icon: ArrowUpRight,
  },
  {
    number: "04",
    verb: "LEARN",
    title: "Make the next post smarter",
    copy: "See which hook, caption, and source drove lift. Turn performance into the next creative brief.",
    icon: BarChart3,
  },
] as const

const campaignAssets = [
  { icon: Scissors, label: "3 ranked hook cuts", detail: "00:07 / 00:21 / 00:43" },
  { icon: Captions, label: "3 caption angles", detail: "Curiosity / context / challenge" },
  { icon: FileCheck2, label: "Instant license proof", detail: "Certificate + public verify URL" },
  { icon: Link2, label: "Signed attribution link", detail: "Creator, track, campaign, platform" },
  { icon: TrendingUp, label: "Post-performance brief", detail: "What worked and what to test next" },
] as const

const tickerItems = [
  "15-second hook cuts",
  "rights-safe exports",
  "signed attribution",
  "weekly viral packs",
  "growth-first scoreboard",
]

export default async function Home() {
  const momentum = await getMomentumFeed(3)

  return (
    <div className="overflow-hidden pt-[68px]">
      <section className="relative border-b border-foreground">
        <div className="absolute inset-0 -z-10 editorial-grid opacity-45" />
        <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-12 lg:px-8 lg:py-28">
          <div className="stagger-children lg:col-span-7">
            <p className="signal-label">The short-form music operating system</p>
            <h1 className="display-type mt-7 max-w-[900px] text-[clamp(3.25rem,10vw,9rem)] leading-[0.78]">
              Make the sound
              <span className="block text-primary">they stop for.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Turn one track into hook-ready clips, rights proof, attribution links, and a feedback loop that tells you what to post next.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/create">Cut my first hook <ArrowRight /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/packs">Open this week&apos;s pack <ArrowDownRight /></Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-foreground/40 pt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <span className="flex items-center gap-2"><Check className="size-3 text-primary" /> No credit card</span>
              <span className="flex items-center gap-2"><Check className="size-3 text-primary" /> Rights check before export</span>
              <span className="flex items-center gap-2"><Check className="size-3 text-primary" /> Built for vertical video</span>
            </div>
          </div>

          <div className="relative lg:col-span-5 lg:pt-9">
            <CampaignTape />
            <div className="absolute -left-5 top-40 -z-10 hidden h-40 w-40 bg-secondary lg:block" />
            <div className="absolute -right-12 -top-3 -z-10 hidden h-52 w-24 bg-primary lg:block" />
          </div>
        </div>

        <div className="overflow-hidden border-t border-foreground bg-secondary py-3 text-secondary-foreground">
          <div className="ticker-track">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center gap-5 px-5 font-mono text-xs font-semibold uppercase tracking-[0.15em]">
                {item}<span className="text-primary">{"//"}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] container-padding section-spacing">
        <div className="grid gap-8 border-b border-foreground pb-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="mono-label text-primary">The loop</p>
            <h2 className="display-type mt-5 text-5xl leading-[0.86] sm:text-6xl">From track to traction.</h2>
          </div>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground lg:col-span-6 lg:col-start-7 lg:self-end">
            Most music tools stop when the file renders. Mashups stays with the creator through confidence, distribution, measurement, and the next decision.
          </p>
        </div>

        <div className="grid border-x border-b border-foreground md:grid-cols-2 xl:grid-cols-4">
          {workflow.map((step, index) => {
            const Icon = step.icon
            return (
              <article key={step.number} className="group relative min-h-80 border-t border-foreground bg-card p-6 first:border-t-0 md:border-l md:first:border-l-0 xl:border-t-0">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-semibold">{step.number} / 04</span>
                  <Icon className="size-5 transition-transform group-hover:-rotate-6 group-hover:scale-110" />
                </div>
                <p className="display-type mt-12 text-5xl text-primary">{step.verb}</p>
                <h3 className="mt-5 font-sans text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
                <span className="absolute inset-x-0 bottom-0 h-2 origin-left scale-x-0 bg-primary transition-transform group-hover:scale-x-100" />
                {index === 1 ? <span className="absolute right-5 top-20 rotate-6 bg-secondary px-2 py-1 font-mono text-[9px] font-bold uppercase">Before export</span> : null}
              </article>
            )
          })}
        </div>
      </section>

      <section className="border-y border-foreground bg-foreground text-background">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
          <div className="border-b border-background/35 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-16">
            <p className="mono-label text-primary">Campaign engine</p>
            <h2 className="display-type mt-6 text-5xl leading-[0.85] sm:text-7xl">
              One track.<br />A full campaign.
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-background/65">
              Stop stitching together five disconnected tools. The campaign object keeps every cut, caption, right, link, and result attached to the same creative source.
            </p>
            <Button variant="secondary" size="lg" className="mt-9" asChild>
              <Link href="/create">Build a campaign <WandSparkles /></Link>
            </Button>
          </div>
          <div className="divide-y divide-background/25">
            {campaignAssets.map((asset, index) => {
              const Icon = asset.icon
              return (
                <div key={asset.label} className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 p-5 transition-colors hover:bg-background hover:text-foreground sm:p-7">
                  <span className="font-mono text-xs text-primary">0{index + 1}</span>
                  <span>
                    <span className="block font-semibold">{asset.label}</span>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider opacity-55">{asset.detail}</span>
                  </span>
                  <Icon className="size-5 transition-transform group-hover:translate-x-1" />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] container-padding section-spacing">
        <div className="flex flex-col gap-5 border-b border-foreground pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mono-label text-primary">Momentum now</p>
            <h2 className="display-type mt-4 text-5xl leading-none sm:text-6xl">Rising beats legacy.</h2>
          </div>
          <Button variant="outline" asChild><Link href="/momentum">See the full signal <ArrowUpRight /></Link></Button>
        </div>

        {momentum.length > 0 ? (
          <div className="grid gap-px border-x border-b border-foreground bg-foreground md:grid-cols-3">
            {momentum.map((item, index) => (
              <Link key={item.id} href={`/mashup/${item.id}`} className="group bg-background p-4 sm:p-5">
                <div className="relative aspect-[4/3] overflow-hidden border border-foreground bg-muted">
                  <Image src={item.coverUrl} alt="" fill unoptimized className="object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0" />
                  <span className="absolute left-3 top-3 bg-secondary px-2 py-1 font-mono text-[10px] font-bold text-secondary-foreground">#{index + 1} RISING</span>
                  <span className="absolute bottom-3 right-3 grid size-10 place-items-center border border-background bg-foreground text-background"><Play className="size-4 fill-current" /></span>
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{item.genre} / {item.bpm} BPM</p>
                    <h3 className="mt-2 font-sans text-xl font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">by @{item.creator.username}</p>
                  </div>
                  <span className="font-mono text-xs font-semibold text-primary">+{Math.max(0, Math.round(item.momentumScore))}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center border-x border-b border-foreground bg-card p-8 text-center">
            <div>
              <Sparkles className="mx-auto size-7 text-primary" />
              <h3 className="display-type mt-4 text-2xl">The live signal starts with the first drop.</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Publish a track to seed the momentum feed. Demo catalog data is never mixed into live rankings.</p>
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1440px] container-padding pb-20 md:pb-28">
        <div className="relative overflow-hidden border border-foreground bg-secondary p-6 text-secondary-foreground shadow-[8px_8px_0_var(--foreground)] sm:p-10 lg:p-14">
          <div className="absolute right-0 top-0 hidden h-full w-[42%] editorial-grid opacity-40 lg:block" />
          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="mono-label">Weekly viral pack / Monday drop</p>
              <h2 className="display-type mt-5 max-w-4xl text-5xl leading-[0.84] sm:text-7xl">Twenty hooks. Zero rights guesswork.</h2>
              <p className="mt-6 max-w-2xl text-lg">Fresh structures for fitness, fashion, gaming, nightlife, and whatever catches next. Every clip arrives with usage mode and a ready-to-edit template.</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <Button size="lg" asChild><Link href="/packs">Open the pack <ArrowRight /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="/signup">Get Monday drops</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-foreground bg-primary text-primary-foreground">
        <Link href="/create" className="group mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <span>
            <span className="mono-label">Your next post</span>
            <span className="display-type mt-3 block text-5xl leading-none sm:text-7xl">Starts with one track.</span>
          </span>
          <ArrowRight className="size-12 shrink-0 transition-transform group-hover:translate-x-3 sm:size-20" strokeWidth={1.2} />
        </Link>
      </section>
    </div>
  )
}

function CampaignTape() {
  const cutPoints = ["00:07", "00:21", "00:43"]
  return (
    <div className="relative rotate-[1.25deg] border border-foreground bg-card p-4 shadow-[10px_10px_0_var(--foreground)] sm:p-6">
      <div className="flex items-center justify-between border-b border-foreground pb-4">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">Campaign / 0048</span>
        <span className="flex items-center gap-1.5 bg-secondary px-2 py-1 font-mono text-[9px] font-bold uppercase text-secondary-foreground">
          <BadgeCheck className="size-3" /> Rights ready
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="mono-label text-muted-foreground">Source track</p>
          <p className="mt-2 text-xl font-semibold">After Hours / Rough 7</p>
        </div>
        <span className="grid size-12 place-items-center border border-foreground bg-primary text-primary-foreground">
          <Play className="size-4 fill-current" />
        </span>
      </div>

      <div className="relative mt-6 flex h-28 items-center gap-[3px] overflow-hidden border-y border-foreground bg-foreground px-3">
        {waveform.map((height, index) => (
          <span key={index} className="flex-1 bg-primary" style={{ height: `${height}%`, opacity: index > 23 ? 0.55 : 1 }} />
        ))}
        <span className="absolute inset-y-0 left-[37%] w-px bg-secondary" />
        <span className="absolute left-[37%] top-1 bg-secondary px-1 font-mono text-[8px] font-bold text-secondary-foreground">HOOK A</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {cutPoints.map((time, index) => (
          <div key={time} className={index === 0 ? "border border-foreground bg-secondary p-3" : "border border-foreground p-3"}>
            <p className="font-mono text-[9px] font-semibold uppercase">Cut {String.fromCharCode(65 + index)}</p>
            <p className="mt-2 font-mono text-sm font-semibold">{time}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-4 border-t border-foreground pt-4">
        <div>
          <p className="mono-label text-muted-foreground">Auto-caption</p>
          <p className="mt-2 text-sm font-medium">wait for the switch at seven seconds</p>
        </div>
        <span className="font-mono text-[10px] font-bold text-primary">92 / 100</span>
      </div>
    </div>
  )
}
