"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Activity, ArrowRight, BadgeCheck, Bot, Building2, Check, ChevronRight,
  CircleDollarSign, CloudUpload, Code2, Coins, ExternalLink, Globe2,
  Headphones, KeyRound, Landmark, MapPin, Network, RadioTower, RefreshCw,
  Save, ScanLine, Sparkles, TrendingUp, Trophy, UserRoundCheck,
  WalletCards, Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { GrowthOsSnapshot, PlatformConnection } from "@/lib/growth-os/types"

type ActionState = { key: string; message: string } | null

export function GrowthOsCommand({ snapshot, demo }: { snapshot: GrowthOsSnapshot | null; demo: boolean }) {
  const [feedback, setFeedback] = useState<ActionState>(null)
  const [running, setRunning] = useState(false)
  const [claimedBounties, setClaimedBounties] = useState<Set<string>>(() => new Set())

  if (!snapshot) return <EmptyGrowthOs />

  async function runAction(key: string, url: string, body: Record<string, unknown>) {
    setRunning(true)
    setFeedback(null)
    try {
      const response = await fetch(`${url}${demo ? "?demo=1" : ""}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const result = await response.json() as { error?: string; actions?: unknown[]; result?: string; url?: string }
      if (!response.ok) throw new Error(result.error ?? "Action failed.")
      if (result.url && result.url.startsWith("/")) window.location.assign(result.url)
      const message = key === "autopilot" ? `${result.actions?.length ?? 0} decisions evaluated and written to the ledger.` : key === "save" ? "Saved on Spotify and attributed to this launch." : "Payout identity is ready for onboarding."
      setFeedback({ key, message })
    } catch (error) {
      setFeedback({ key, message: error instanceof Error ? error.message : "Action failed." })
    } finally {
      setRunning(false)
    }
  }

  async function claimBounty(id: string) {
    const response = await fetch(`/api/growth/bounties/${id}/accept${demo ? "?demo=1" : ""}`, { method: "POST" })
    const result = await response.json() as { error?: string }
    if (!response.ok) { setFeedback({ key: `bounty:${id}`, message: result.error ?? "Bounty unavailable." }); return }
    setClaimedBounties((current) => new Set(current).add(id))
    setFeedback({ key: `bounty:${id}`, message: "Offer accepted. Qualification evidence will release the award into escrow." })
  }

  return (
    <div className="growth-os pb-28 pt-[68px]">
      <div className="border-b border-foreground bg-secondary px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] sm:px-6">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4"><span>Growth operating system / {snapshot.launchTitle}</span><span className="hidden sm:inline">14 systems / one proof ledger</span></div>
      </div>

      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <header className="relative grid overflow-hidden border-x border-b border-foreground lg:grid-cols-12">
          <div className="relative z-10 px-5 py-12 sm:px-8 sm:py-16 lg:col-span-8 lg:py-20">
            <div className="flex flex-wrap items-center gap-3"><p className="signal-label">Network command</p><Badge className="rounded-none" variant="secondary">{demo ? "Labeled simulation" : "Live control"}</Badge></div>
            <h1 className="display-type mt-7 max-w-5xl text-[clamp(4rem,9vw,9.8rem)] leading-[0.76] tracking-[-0.06em]">THE NETWORK<br /><span className="text-primary">RUNS ITSELF.</span></h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">Tracks enter rights-clean. Creators receive fair opportunities. Winning structures earn budget. Every save, license, prediction, and payout leaves proof.</p>
          </div>
          <div className="relative min-h-72 overflow-hidden border-t border-foreground bg-foreground text-background lg:col-span-4 lg:min-h-full lg:border-l lg:border-t-0">
            <div className="growth-radar absolute inset-0" />
            <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
              <div className="flex items-center justify-between"><span className="mono-label text-background/60">Live system pulse</span><Activity className="size-5 text-secondary" /></div>
              <div><p className="display-type text-7xl text-secondary">1.42</p><p className="mt-2 font-mono text-xs uppercase tracking-widest text-background/65">Creator reproduction factor</p></div>
              <div className="grid grid-cols-3 gap-px border border-background/40 bg-background/40"><DarkMetric value="187" label="moving" /><DarkMetric value="143" label="qualified" /><DarkMetric value="4,826" label="saves" /></div>
            </div>
          </div>
        </header>

        <section className="grid border-x border-b border-foreground xl:grid-cols-[1.1fr_0.9fr]">
          <div className="p-5 sm:p-8 xl:border-r xl:border-foreground">
            <SectionMark number="01" icon={Bot} label="Launch Autopilot" />
            <div className="mt-8 flex flex-wrap items-end justify-between gap-5"><div><h2 className="display-type text-4xl sm:text-6xl">Evidence makes<br />the allocation.</h2><p className="mt-4 max-w-xl text-muted-foreground">Sample gates prevent premature scaling. Winners get creator supply and budget; weak structures stop consuming evidence.</p></div><Button disabled={running} onClick={() => void runAction("autopilot", "/api/growth/autopilot", { launchSlug: snapshot.launchSlug, trigger: "operator" })}>{running ? <RefreshCw className="animate-spin" /> : <Zap />}Run decision cycle</Button></div>
            {feedback?.key === "autopilot" ? <ActionNotice message={feedback.message} /> : null}
            <div className="mt-8 border-t border-foreground">
              {snapshot.autopilotActions.slice(0, 5).map((action, index) => (
                <div key={action.id} className="grid gap-3 border-b border-foreground py-4 sm:grid-cols-[2rem_1fr_auto] sm:items-center">
                  <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                  <div><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{action.target}</span><Badge variant={action.status === "executed" ? "secondary" : "outline"} className="rounded-none">{action.type.replaceAll("_", " ")}</Badge></div><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{action.reason}</p></div>
                  <span className="font-mono text-xs font-semibold">{action.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card p-5 sm:p-8">
            <SectionMark number="02" icon={Network} label="Connected Platform Accounts" />
            <h2 className="display-type mt-8 text-4xl">One identity.<br />Every distribution rail.</h2>
            <div className="mt-7 border-y border-foreground">
              {snapshot.connections.map((connection) => <ConnectionRow key={connection.provider} connection={connection} demo={demo} />)}
            </div>
            <div className="mt-8 border border-foreground bg-secondary p-5 shadow-[5px_5px_0_var(--foreground)]">
              <div className="flex items-center justify-between gap-4"><SectionMark number="03" icon={Save} label="One-Tap Music Saving" /><Badge className="rounded-none">Attributed</Badge></div>
              <p className="mt-8 text-xl font-semibold">Turn audience intent into an owned music signal.</p>
              <p className="mt-2 text-sm text-muted-foreground">The save lands in Spotify and in the launch ledger, never as an unaudited redirect.</p>
              <Button className="mt-5" onClick={() => void runAction("save", "/api/growth/save", { launchSlug: snapshot.launchSlug, spotifyUri: "spotify:track:7a3LWj5xSFhFRYmztS8wgK", anonymousKey: "demo-network-visitor" })}><Headphones />Save Midnight Velocity</Button>
              {feedback?.key === "save" ? <ActionNotice message={feedback.message} /> : null}
            </div>
          </div>
        </section>

        <section className="grid border-x border-b border-foreground lg:grid-cols-12">
          <div className="p-5 sm:p-8 lg:col-span-7 lg:border-r lg:border-foreground">
            <SectionMark number="04" icon={CircleDollarSign} label="Dynamic Bounty Market" />
            <div className="mt-8 flex items-end justify-between gap-5"><h2 className="display-type text-4xl sm:text-5xl">Money flows to<br />missing momentum.</h2><span className="hidden font-mono text-xs uppercase tracking-widest text-muted-foreground sm:block">1.0x floor / 3.0x cap</span></div>
            <div className="mt-8 grid gap-px border border-foreground bg-foreground md:grid-cols-3">
              {snapshot.bounties.map((bounty) => <article key={bounty.id} className="bg-card p-5"><div className="flex items-center justify-between"><span className="font-mono text-xs">{bounty.city}</span><span className="display-type text-3xl text-primary">{bounty.multiplier}x</span></div><h3 className="mt-7 text-xl font-semibold">{bounty.title}</h3><p className="mt-3 min-h-20 text-sm leading-relaxed text-muted-foreground">{bounty.reason}</p><div className="mt-5 flex items-center justify-between border-t border-foreground pt-4 font-mono text-xs"><span>{money(bounty.baseRewardCents * bounty.multiplier)}</span><span>{bounty.availableSlots} slots</span></div><Button size="sm" variant="outline" className="mt-4 w-full" disabled={claimedBounties.has(bounty.id)} onClick={() => void claimBounty(bounty.id)}>{claimedBounties.has(bounty.id) ? <Check /> : <Coins />}{claimedBounties.has(bounty.id) ? "Offer accepted" : "Claim offer"}</Button>{feedback?.key === `bounty:${bounty.id}` ? <p role="status" className="mt-3 text-xs leading-relaxed">{feedback.message}</p> : null}</article>)}
            </div>
          </div>
          <div className="p-5 sm:p-8 lg:col-span-5">
            <SectionMark number="05" icon={WalletCards} label="Creator Escrow + Stripe Connect" />
            <p className="display-type mt-8 text-6xl text-primary">{money(snapshot.payout.escrowBalanceCents)}</p><p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">Protected in creator escrow</p>
            <div className="mt-8 grid grid-cols-2 gap-px border border-foreground bg-foreground"><LightMetric value={money(snapshot.payout.availableBalanceCents)} label="Available" /><LightMetric value={String(snapshot.payout.qualifiedAwards)} label="Qualified awards" /></div>
            <Button variant="outline" className="mt-6 w-full" onClick={() => void runAction("payout", "/api/growth/payouts/connect", {})}><Landmark />Configure payout rail</Button>
            {feedback?.key === "payout" ? <ActionNotice message={feedback.message} /> : null}
          </div>
        </section>

        <section className="grid border-x border-b border-foreground xl:grid-cols-[0.7fr_1.3fr]">
          <div className="bg-primary p-5 text-primary-foreground sm:p-8 xl:border-r xl:border-foreground">
            <SectionMark number="07" icon={UserRoundCheck} label="Zero-Follower Advantage" inverse />
            <p className="display-type mt-10 text-5xl leading-[0.9]">FOLLOWERS<br />DO NOT BUY<br />PRIORITY.</p>
            <p className="mt-6 max-w-md leading-relaxed text-primary-foreground/75">Opportunity score is built from incremental lift, reliability, and rights standing. Large follower counts receive no positive weight.</p>
            <div className="mt-10 border-y border-primary-foreground/50 py-5"><p className="font-mono text-xs uppercase tracking-widest">Discovery boost active</p><p className="mt-2 text-2xl font-semibold">+25% under 5K followers</p></div>
          </div>
          <div className="p-5 sm:p-8">
            <SectionMark number="08" icon={MapPin} label="City Warfare" />
            <div className="mt-8 flex flex-wrap items-end justify-between gap-4"><h2 className="display-type text-4xl sm:text-6xl">LOCAL CELLS.<br />GLOBAL SIGNAL.</h2><Link href={`/club/${snapshot.club.code.toLowerCase()}?demo=1`} className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest underline decoration-primary decoration-2 underline-offset-4">Open venue drop<ArrowRight className="size-4" /></Link></div>
            <div className="mt-8 border-t border-foreground">
              {snapshot.cities.map((city) => <div key={city.id} className="grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-foreground py-4 sm:grid-cols-[4rem_1fr_8rem_8rem]"><span className="display-type text-3xl text-primary">0{city.rank}</span><div><p className="text-xl font-semibold">{city.city}</p><p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{city.code} / {city.creators} creators</p></div><span className="hidden font-mono text-sm sm:block">{city.saves.toLocaleString()} saves</span><span className="text-right font-mono font-semibold">{city.score} pts</span></div>)}
            </div>
          </div>
        </section>

        <section className="grid border-x border-b border-foreground lg:grid-cols-3">
          <FeatureColumn number="09" icon={Trophy} title="Fan A&R Economy" description="Fans stake reputation on the winning creative structure before the outcome is obvious." stat={`${snapshot.fanAr.reputation} REP`} note={`${snapshot.fanAr.correctCalls}/${snapshot.fanAr.settledCalls} correct calls`} href={`/launches/${snapshot.launchSlug}?demo=1`} cta="Make a breakout call" />
          <FeatureColumn number="10" icon={TrendingUp} title="Paid-Media Winner Handoff" description="Organic winners enter creator consent and rights re-check before a dollar of amplification." stat={`${snapshot.paidMedia[0]?.organicLift ?? 0}x LIFT`} note={`${snapshot.paidMedia.filter((item) => item.licenseStatus === "cleared").length} cleared handoff`} href="/dashboard/analytics?demo=1" cta="Inspect proof" />
          <FeatureColumn number="11" icon={ScanLine} title="Club-to-Phone Bridge" description="Venue QR codes turn the exact room where a track hits into saves, city membership, and attribution." stat={`${snapshot.club.scans} SCANS`} note={`${snapshot.club.saves} verified saves`} href={`/club/${snapshot.club.code.toLowerCase()}?demo=1`} cta="Open live activation" />
        </section>

        <section className="grid border-x border-b border-foreground lg:grid-cols-12">
          <div className="bg-foreground p-5 text-background sm:p-8 lg:col-span-7 lg:border-r lg:border-background/30">
            <SectionMark number="12" icon={Code2} label="Embeddable Launch Button" inverse />
            <h2 className="display-type mt-8 text-4xl sm:text-6xl">PUT THE MOMENT<br /><span className="text-secondary">ANYWHERE.</span></h2>
            <pre className="mt-7 overflow-x-auto border border-background/35 bg-background/5 p-4 font-mono text-xs leading-relaxed text-background/80"><code>{`<script src="https://mashups.agency/mashups-launch.js"></script>\n<mashups-launch slug="${snapshot.launchSlug}"></mashups-launch>`}</code></pre>
            <div className="mt-5 flex flex-wrap gap-3"><Button variant="secondary" asChild><Link href={`/embed/launch/${snapshot.launchSlug}?demo=1`}>Preview embed<ExternalLink /></Link></Button><Button variant="outline" className="border-background text-background hover:bg-background hover:text-foreground" onClick={() => void navigator.clipboard?.writeText(`<script src="https://mashups.agency/mashups-launch.js"></script>\n<mashups-launch slug="${snapshot.launchSlug}"></mashups-launch>`)}><Code2 />Copy code</Button></div>
          </div>
          <div className="p-5 sm:p-8 lg:col-span-5">
            <SectionMark number="13" icon={BadgeCheck} label="Creator Proof Passport" />
            <div className="mt-9 flex items-center gap-5"><div className="grid size-20 shrink-0 place-items-center border border-foreground bg-secondary display-type text-2xl">JN</div><div><h3 className="text-2xl font-semibold">{snapshot.passport.displayName}</h3><p className="font-mono text-xs text-muted-foreground">@{snapshot.passport.username}</p></div></div>
            <div className="mt-8 grid grid-cols-3 gap-px border border-foreground bg-foreground"><LightMetric value={`${snapshot.passport.liftPercentile}%`} label="Lift rank" /><LightMetric value={`${snapshot.passport.reliabilityScore}`} label="Reliable" /><LightMetric value={`${snapshot.passport.verifiedRightsUses}`} label="Rights clean" /></div>
            <Button variant="outline" className="mt-6 w-full" asChild><Link href={`/passport/${snapshot.passport.username}?demo=1`}>View verified passport<ChevronRight /></Link></Button>
          </div>
        </section>

        <section className="grid border-x border-b border-foreground lg:grid-cols-2">
          <Link href="/supply?demo=1" className="group relative overflow-hidden bg-secondary p-6 sm:p-10 lg:border-r lg:border-foreground"><SectionMark number="06" icon={CloudUpload} label="Rightsholder Supply Portal" /><Building2 className="absolute -bottom-12 -right-8 size-64 opacity-10 transition-transform group-hover:-translate-y-2" /><h2 className="display-type mt-14 max-w-xl text-5xl leading-[0.9]">TRACKS ENTER<br />WITH THE RIGHTS<br />ATTACHED.</h2><p className="mt-6 max-w-md leading-relaxed text-muted-foreground">Submit masters, parties, territories, permitted uses, release windows, and payout terms before creators touch the audio.</p><span className="mt-8 inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest">Open partner intake<ArrowRight className="size-4" /></span></Link>
          <Link href="/exchange?demo=1" className="group relative overflow-hidden p-6 sm:p-10"><SectionMark number="14" icon={KeyRound} label="Private Pre-Release Exchange" /><Globe2 className="absolute -bottom-12 -right-8 size-64 opacity-[0.06] transition-transform group-hover:-translate-y-2" /><h2 className="display-type mt-14 max-w-xl text-5xl leading-[0.9]">THE RIGHT PEOPLE<br />HEAR IT BEFORE<br />THE ALGORITHM.</h2><p className="mt-6 max-w-md leading-relaxed text-muted-foreground">Invitation-only listening rooms combine embargo controls, hook calls, creator fit, and reputation-weighted feedback.</p><span className="mt-8 inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest">Enter the exchange<ArrowRight className="size-4" /></span></Link>
        </section>
      </section>
    </div>
  )
}

function EmptyGrowthOs() {
  return <div className="mx-auto grid min-h-[80vh] max-w-4xl place-items-center px-4 pt-28 text-center"><div><RadioTower className="mx-auto size-10 text-primary" /><p className="signal-label mt-7 justify-center">Growth operating system</p><h1 className="display-type mt-6 text-6xl leading-[0.85] sm:text-8xl">No live signal<br />connected.</h1><p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">Connect production storage to operate live campaigns, or inspect the complete labeled network simulation now.</p><Button className="mt-8" asChild><Link href="/network?demo=1">Load the whole system<Sparkles /></Link></Button></div></div>
}

function SectionMark({ number, icon: Icon, label, inverse = false }: { number: string; icon: typeof Bot; label: string; inverse?: boolean }) {
  return <div className={`flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] ${inverse ? "text-current" : "text-muted-foreground"}`}><span className={`grid size-8 place-items-center border ${inverse ? "border-current" : "border-foreground"}`}>{number}</span><Icon className="size-4" /><span>{label}</span></div>
}

function ConnectionRow({ connection, demo }: { connection: PlatformConnection; demo: boolean }) {
  const connected = connection.status === "connected"
  return <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border-b border-foreground py-4 last:border-b-0"><span className={connected ? "grid size-9 place-items-center bg-secondary" : "grid size-9 place-items-center border border-foreground"}>{connected ? <Check className="size-4" /> : <CloudUpload className="size-4" />}</span><div><p className="font-semibold">{connection.label}</p><p className="font-mono text-[10px] text-muted-foreground">{connection.handle ?? connection.capabilities[0]}</p></div><Button size="sm" variant={connected ? "ghost" : "outline"} asChild><a href={`/api/growth/connections/${connection.provider}${demo ? "?demo=1" : ""}`}>{connected ? "Refresh" : "Connect"}</a></Button></div>
}

function FeatureColumn({ number, icon, title, description, stat, note, href, cta }: { number: string; icon: typeof Trophy; title: string; description: string; stat: string; note: string; href: string; cta: string }) {
  return <article className="border-b border-foreground p-5 last:border-b-0 sm:p-8 lg:border-b-0 lg:border-r lg:last:border-r-0"><SectionMark number={number} icon={icon} label={title} /><p className="display-type mt-10 text-5xl text-primary">{stat}</p><p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">{note}</p><p className="mt-7 min-h-20 leading-relaxed text-muted-foreground">{description}</p><Link href={href} className="mt-6 inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest underline decoration-primary decoration-2 underline-offset-4">{cta}<ArrowRight className="size-4" /></Link></article>
}

function DarkMetric({ value, label }: { value: string; label: string }) { return <div className="bg-foreground p-3"><p className="text-xl font-semibold">{value}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-background/55">{label}</p></div> }
function LightMetric({ value, label }: { value: string; label: string }) { return <div className="bg-card p-4"><p className="text-xl font-semibold">{value}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p></div> }
function ActionNotice({ message }: { message: string }) { return <p role="status" className="mt-4 flex items-center gap-2 border border-foreground bg-secondary p-3 text-sm"><Check className="size-4 shrink-0" />{message}</p> }
function money(cents: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100) }
