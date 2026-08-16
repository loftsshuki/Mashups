import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, FileCheck2, FileDown, Gauge, LockKeyhole, ShieldCheck, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Green Room Artist Pilot", description: "A controlled, rights-first fan remix pilot for one-stop electronic artists and labels." }

const downloads = [
  { href: "/downloads/green-room-artist-pilot-kit.md", title: "Artist pilot kit", note: "Opportunity, workflow, controls, and evidence." },
  { href: "/downloads/green-room-pilot-term-sheet.md", title: "Pilot term sheet", note: "Counsel-ready discussion structure." },
  { href: "/downloads/green-room-rights-passport.csv", title: "Rights Passport CSV", note: "Track-level chain-of-title intake." },
  { href: "/downloads/green-room-pairing-controls.csv", title: "Pairing controls CSV", note: "Allowlists, blocklists, and modification limits." },
  { href: "/downloads/green-room-outreach-sequences.md", title: "Outreach sequences", note: "DM, email, follow-up, and discovery questions." },
]

export default function GreenRoomPartnerPage() {
  return <div className="pb-28 pt-28"><section className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
    <Link href="/partner" className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest"><ArrowLeft className="size-4" />For artists</Link>
    <header className="relative mt-7 overflow-hidden border-y border-foreground py-12"><div className="absolute inset-0 -z-10 collision-grid opacity-60" /><div className="grid gap-8 lg:grid-cols-12 lg:items-end"><div className="lg:col-span-8"><p className="signal-label">One track / controlled fan creation / real evidence</p><h1 className="display-type mt-6 text-[clamp(4rem,10vw,9rem)] leading-[0.78]">OPEN THE SONG.<br /><span className="text-primary">NOT THE RIGHTS.</span></h1></div><div className="lg:col-span-4"><p className="text-lg leading-relaxed text-muted-foreground">Fans make attributed versions from approved sources. You decide pairings, outputs, modification limits, term, territory, and when the experiment stops.</p><Button className="mt-6" asChild><Link href="/supply">Apply with one track<ArrowUpRight /></Link></Button></div></div></header>
    <div className="grid gap-px border-x border-b border-foreground bg-foreground md:grid-cols-3"><Point icon={LockKeyhole} title="Private masters" copy="Originals and stems stay in isolated private storage and never become public URLs." /><Point icon={SlidersHorizontal} title="Artist controls" copy="Pairing rules, tempo/pitch limits, sensitive uses, territory, term, and withdrawal travel with the track." /><Point icon={Gauge} title="Measured behavior" copy="Creation, keep, share, retention, muting, claims, and takedown evidence replace vague promotion promises." /></div>
    <section className="mt-10 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]"><div><p className="mono-label text-muted-foreground">Pilot boundary</p><h2 className="display-type mt-4 text-5xl leading-[0.86]">Video leaves.<br />The master does not.</h2><p className="mt-5 leading-relaxed text-muted-foreground">The only off-platform output is a permanent-watermark 15- or 30-second vertical video carrying both rights passports. MP3, WAV, stems, DSP delivery, paid media, and model training remain disabled.</p><div className="mt-7 border border-foreground bg-secondary p-4 text-sm"><ShieldCheck className="mb-3 size-5" />No guaranteed streams, charts, revenue, or virality. The pilot guarantees controlled operation and honest reporting.</div></div><div className="border border-foreground bg-card"><div className="border-b border-foreground p-5"><p className="mono-label">Operator package</p></div>{downloads.map((item) => <a key={item.href} href={item.href} download className="grid gap-3 border-b border-foreground p-5 last:border-b-0 hover:bg-secondary sm:grid-cols-[auto_1fr_auto] sm:items-center"><FileDown className="size-5 text-primary" /><span><strong className="block text-lg">{item.title}</strong><span className="mt-1 block text-sm text-muted-foreground">{item.note}</span></span><ArrowUpRight className="size-4" /></a>)}</div></section>
    <div className="mt-10 flex flex-wrap gap-3"><Button asChild><Link href="/supply"><FileCheck2 />Start private intake</Link></Button><Button variant="outline" asChild><Link href="/lab/audio">Inspect audio quality lab</Link></Button></div>
  </section></div>
}

function Point({ icon: Icon, title, copy }: { icon: typeof ShieldCheck; title: string; copy: string }) { return <article className="bg-card p-6"><Icon className="size-6 text-primary" /><h2 className="mt-8 text-xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy}</p></article> }
