import Link from "next/link"
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CirclePlay,
  GitFork,
  Headphones,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { getRecommendedGreenPairs, GREEN_CATALOG, type GreenCatalogTrack } from "@/lib/catalog/green-catalog"

const steps = [
  { number: "01", verb: "PICK", title: "Start with music you can actually use", copy: "Choose two green-badged tracks. Every source has permission, scope, and provenance attached.", icon: Headphones },
  { number: "02", verb: "COLLIDE", title: "Get arrangements, not a lazy crossfade", copy: "Mashups checks tempo and harmony, locks the phrase grid, and renders three different structural ideas.", icon: WandSparkles },
  { number: "03", verb: "PASS", title: "Publish a version someone can fork", copy: "Credit follows the source. Every new branch points back to the artists and creators who made it possible.", icon: GitFork },
] as const

const tickerItems = ["two tracks in", "three versions out", "rights travel", "fork the winner", "credit every source"]

export default function Home() {
  const heroPair = getRecommendedGreenPairs(1)[0]

  return (
    <div className="overflow-hidden pt-[68px]">
      <section className="relative border-b border-foreground">
        <div className="absolute inset-0 -z-10 collision-grid opacity-60" />
        <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-12 lg:px-8 lg:py-24">
          <div className="stagger-children lg:col-span-7">
            <p className="signal-label">The social remix playground</p>
            <h1 className="display-type mt-7 max-w-5xl text-[clamp(3.6rem,9.4vw,8.8rem)] leading-[0.77]">
              Two tracks<br />walk in.<br /><span className="text-primary">One obsession</span><br />walks out.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Pick rights-cleared music. Hear three genuinely different mashups. Keep one, share it, and watch the next creator take it somewhere you never would.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" asChild><Link href="/create">Make a mashup <ArrowRight /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="/discover">Hear what is rising <ArrowDownRight /></Link></Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-foreground/40 pt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <span className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-primary" /> Green sources only</span>
              <span className="flex items-center gap-2"><Sparkles className="size-3.5 text-primary" /> Three arrangements</span>
              <span className="flex items-center gap-2"><GitFork className="size-3.5 text-primary" /> Every version forkable</span>
            </div>
          </div>

          <div className="relative lg:col-span-5 lg:pt-8">
            {heroPair ? <CollisionPoster left={heroPair.left} right={heroPair.right} score={heroPair.assessment.score} /> : null}
          </div>
        </div>

        <div className="overflow-hidden border-t border-foreground bg-secondary py-3 text-secondary-foreground">
          <div className="ticker-track">
            {[...tickerItems, ...tickerItems].map((item, index) => <span key={`${item}-${index}`} className="flex items-center gap-5 px-5 font-mono text-xs font-semibold uppercase tracking-[0.15em]">{item}<span className="text-primary">{"//"}</span></span>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid gap-8 border-b border-foreground pb-9 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mono-label text-primary">One clean loop</p>
            <h2 className="display-type mt-5 text-5xl leading-[0.84] sm:text-7xl">Pick. Collide.<br />Pass it on.</h2>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground lg:col-span-4 lg:col-start-9">The complicated rights and campaign machinery still exists. You only see it when it protects a creation or pays a contributor.</p>
        </div>

        <div className="grid border-x border-b border-foreground lg:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon
            return <article key={step.number} className="group relative min-h-[24rem] border-t border-foreground bg-card p-6 first:border-t-0 lg:border-l lg:border-t-0 lg:first:border-l-0">
              <div className="flex items-start justify-between"><span className="font-mono text-xs font-semibold">{step.number} / 03</span><Icon className="size-5 transition-transform group-hover:-rotate-6 group-hover:scale-110" /></div>
              <p className="display-type mt-14 text-5xl text-primary">{step.verb}</p>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
              <span className="absolute inset-x-0 bottom-0 h-2 origin-left scale-x-0 bg-primary transition-transform group-hover:scale-x-100" />
            </article>
          })}
        </div>
      </section>

      <section className="border-y border-foreground bg-foreground text-background">
        <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="mono-label text-primary">The first green crate</p>
              <h2 className="display-type mt-5 text-5xl leading-[0.84] sm:text-7xl">Small catalog.<br />Zero guesswork.</h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-background/65">These prototype sources are original synthesis with no third-party samples. Partner tracks enter only after their Rights Passport turns green.</p>
              <Button variant="secondary" className="mt-6" asChild><Link href="/discover">Open the crate <ArrowUpRight /></Link></Button>
            </div>
          </div>

          <div className="mt-10 border-y border-background/40">
            {GREEN_CATALOG.map((track, index) => <CatalogRow key={track.id} track={track} index={index} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="mono-label text-primary">The viral object</p>
            <h2 className="display-type mt-5 text-5xl leading-[0.84] sm:text-7xl">A song ends.<br />A remix tree doesn&apos;t.</h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">Every public mashup becomes a new starting point. The lineage stays visible, the sources keep their credit, and the best branch can become the next official version.</p>
            <Button className="mt-8" asChild><Link href="/chains">Explore remix trees <GitFork /></Link></Button>
          </div>
          <div className="lg:col-span-7">
            <RemixTree />
          </div>
        </div>
      </section>

      <section className="border-y border-foreground bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
          <div className="border-b border-primary-foreground/40 p-7 sm:p-10 lg:border-b-0 lg:border-r lg:p-14">
            <Users className="size-7" />
            <p className="mono-label mt-10">For music fans and creators</p>
            <h2 className="display-type mt-4 text-5xl leading-[0.86] sm:text-6xl">Make the version you wish existed.</h2>
            <Button variant="secondary" size="lg" className="mt-8" asChild><Link href="/create">Enter the green room <ArrowRight /></Link></Button>
          </div>
          <div className="p-7 sm:p-10 lg:p-14">
            <BadgeCheck className="size-7" />
            <p className="mono-label mt-10">For artists and producers</p>
            <h2 className="display-type mt-4 text-5xl leading-[0.86] sm:text-6xl">Let the internet play with your music.</h2>
            <p className="mt-5 max-w-lg text-primary-foreground/75">You control what can be remixed, exported, monetized, or amplified. Every branch points home.</p>
            <Button variant="outline" size="lg" className="mt-8 border-primary-foreground" asChild><Link href="/partner">Bring a track <ArrowUpRight /></Link></Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function CollisionPoster({ left, right, score }: { left: GreenCatalogTrack; right: GreenCatalogTrack; score: number }) {
  return <div className="relative min-h-[34rem]">
    <div className="absolute left-0 top-0 w-[76%] -rotate-6 border border-foreground bg-card p-4 shadow-[8px_8px_0_var(--foreground)] sm:p-5">
      <div className="aspect-square border border-foreground p-5" style={{ background: left.color, color: left.ink }}><span className="mono-label">Track A</span><span className="display-type mt-28 block text-5xl leading-[0.84]">{left.title}</span><span className="mt-3 block font-mono text-xs">{left.bpm} BPM / {left.key}</span></div>
    </div>
    <div className="absolute bottom-0 right-0 w-[76%] rotate-6 border border-foreground bg-card p-4 shadow-[8px_8px_0_var(--foreground)] sm:p-5">
      <div className="aspect-square border border-foreground p-5" style={{ background: right.color, color: right.ink }}><span className="mono-label">Track B</span><span className="display-type mt-28 block text-5xl leading-[0.84]">{right.title}</span><span className="mt-3 block font-mono text-xs">{right.bpm} BPM / {right.key}</span></div>
    </div>
    <Link href={`/create?left=${left.id}&right=${right.id}`} className="absolute left-1/2 top-1/2 z-10 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-foreground bg-secondary text-center shadow-[5px_5px_0_var(--foreground)] transition-transform hover:scale-105">
      <span><Repeat2 className="mx-auto size-5" /><span className="display-type mt-1 block text-2xl">{score}</span><span className="font-mono text-[8px] font-bold uppercase tracking-wider">Match</span></span>
    </Link>
  </div>
}

function CatalogRow({ track, index }: { track: GreenCatalogTrack; index: number }) {
  return <Link href={`/create?left=${track.id}`} className="group grid gap-4 border-t border-background/40 py-5 first:border-t-0 sm:grid-cols-[3rem_1fr_auto_auto] sm:items-center">
    <span className="font-mono text-xs text-primary">0{index + 1}</span>
    <span><span className="block text-xl font-semibold sm:text-2xl">{track.title}</span><span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-background/50">{track.artist} / {track.genre}</span></span>
    <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider"><BadgeCheck className="size-4 text-primary" /> {track.rights.passportId}</span>
    <span className="flex items-center justify-between gap-6 sm:justify-end"><span className="font-mono text-xs">{track.bpm} BPM</span><CirclePlay className="size-7 transition-transform group-hover:scale-110" /></span>
  </Link>
}

function RemixTree() {
  const nodes = [
    { label: "Signal Bloom", note: "Original source", className: "left-[8%] top-6 bg-primary text-primary-foreground" },
    { label: "Clean Blend", note: "First mashup", className: "left-[38%] top-36 bg-secondary text-secondary-foreground" },
    { label: "Miami Flip", note: "Fork 02", className: "right-[3%] top-10 bg-card" },
    { label: "Night Drive", note: "Fork 03", className: "right-[8%] bottom-8 bg-accent" },
  ]
  return <div className="relative min-h-[28rem] overflow-hidden border border-foreground bg-card collision-grid">
    <svg className="absolute inset-0 size-full" aria-hidden="true"><path d="M150 90 C260 90 250 190 360 190 S480 90 590 90 M360 190 C460 190 490 350 590 350" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" /></svg>
    {nodes.map((node, index) => <div key={node.label} className={`absolute w-40 border border-foreground p-4 shadow-[4px_4px_0_var(--foreground)] ${node.className}`}><span className="font-mono text-[9px] font-bold uppercase">0{index + 1}</span><span className="display-type mt-5 block text-xl leading-none">{node.label}</span><span className="mt-2 block text-xs">{node.note}</span></div>)}
  </div>
}
