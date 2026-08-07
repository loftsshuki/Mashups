"use client"

import { FormEvent, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, FileCheck2, Loader2, RadioTower, ShieldCheck, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { PilotWorkspace } from "@/lib/pilot/types"

const objectives = ["Prove creator-market fit", "Generate attributed saves", "Find paid-ready posts", "Build a reusable hook playbook"]

export function PilotIntake({ workspace, demo }: { workspace: PilotWorkspace; demo: boolean }) {
  const program = workspace.programs[0]
  const seed = workspace.intake
  const allNiches = useMemo(() => [...new Set(workspace.markets.flatMap((market) => market.targetNiches))], [workspace.markets])
  const [markets, setMarkets] = useState(seed?.targetMarkets ?? program?.marketCodes.slice(0, 3) ?? [])
  const [niches, setNiches] = useState(seed?.targetNiches ?? allNiches.slice(0, 3))
  const [goals, setGoals] = useState(seed?.objectives ?? objectives.slice(0, 3))
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ text: string; next?: string; error?: boolean } | null>(null)

  if (!program) return <EmptyPilot />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true); setResult(null)
    const form = new FormData(event.currentTarget)
    const body = {
      programCode: program.code,
      campaignName: value(form, "campaignName"), artistName: value(form, "artistName"), trackTitle: value(form, "trackTitle"),
      contactName: value(form, "contactName"), contactEmail: value(form, "contactEmail"), genre: "Electronic", subgenre: value(form, "subgenre"),
      releaseStage: value(form, "releaseStage"), releaseDate: nullable(value(form, "releaseDate")), objectives: goals, targetMarkets: markets, targetNiches: niches,
      targetCreatorCount: integer(form, "targetCreatorCount"), creatorBudgetCents: moneyToCents(form, "creatorBudget"), paidMediaBudgetCents: moneyToCents(form, "paidMediaBudget"),
      masterUrl: nullable(value(form, "masterUrl")), rightsReadiness: value(form, "rightsReadiness"), notes: nullable(value(form, "notes")),
    }
    try {
      const response = await fetch(`/api/pilot/intakes${demo ? "?demo=1" : ""}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await response.json() as { error?: string; next?: string; status?: string }
      if (!response.ok) throw new Error(data.error ?? "Unable to submit the pilot intake.")
      setResult({ text: `Intake ${data.status ?? "submitted"}. The operator brief is ready for configuration.`, next: data.next })
    } catch (error) { setResult({ text: error instanceof Error ? error.message : "Unable to submit the pilot intake.", error: true }) }
    finally { setPending(false) }
  }

  return <main className="pilot-shell pb-28 pt-[68px]">
    <div className="border-b border-foreground bg-secondary px-4 py-2"><div className="mx-auto flex max-w-[1500px] justify-between gap-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em]"><span>Founding House / Intake 001</span><span>{demo ? "Labeled simulation / no write" : "Live application"}</span></div></div>
    <section className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
      <header className="grid border-x border-b border-foreground lg:grid-cols-12">
        <div className="pilot-grid relative overflow-hidden p-5 py-12 sm:p-9 sm:py-16 lg:col-span-8"><div className="relative"><p className="signal-label">Independent electronic pilot</p><h1 className="display-type mt-8 text-[clamp(3.7rem,12vw,9rem)] leading-[0.72]">BRING THE<br />TRACK.<br /><span className="text-primary">WE BUILD PROOF.</span></h1><p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">One rights-ready release. Five high-signal cities. A controlled creator test with attributable outcomes, not inflated promises.</p></div></div>
        <aside className="flex flex-col justify-between border-t border-foreground bg-foreground p-6 text-background lg:col-span-4 lg:border-l lg:border-t-0 sm:p-8"><RadioTower className="size-7 text-secondary" /><div className="my-12"><p className="mono-label text-background/55">Founding cohort</p><p className="display-type mt-4 text-7xl text-secondary">{program.creatorTarget}</p><p className="font-mono text-xs uppercase tracking-widest text-background/60">qualified creator opportunities</p></div><div className="border-t border-background/30 pt-5 text-sm leading-relaxed text-background/70">We guarantee operating work, rights evidence, and reporting. We never guarantee streams, charts, or virality.</div></aside>
      </header>

      <form onSubmit={submit} className="border-x border-b border-foreground" data-testid="pilot-intake-form">
        <FormSection number="01" title="The release" copy="Give operators enough truth to reject weak-fit campaigns early.">
          <div className="grid gap-5 sm:grid-cols-2"><Field label="Campaign name"><Input name="campaignName" required defaultValue={seed?.campaignName ?? ""} placeholder="Track / founding pilot" /></Field><Field label="Artist"><Input name="artistName" required defaultValue={seed?.artistName ?? ""} /></Field><Field label="Track title"><Input name="trackTitle" required defaultValue={seed?.trackTitle ?? ""} /></Field><Field label="Electronic subgenre"><Input name="subgenre" required defaultValue={seed?.subgenre ?? "House"} placeholder="Melodic house, techno, garage..." /></Field><Field label="Release stage"><NativeSelect name="releaseStage" defaultValue={seed?.releaseStage ?? "unreleased"}><option value="unreleased">Unreleased</option><option value="released">Released</option><option value="catalog">Catalog</option></NativeSelect></Field><Field label="Release date"><Input name="releaseDate" type="date" defaultValue={seed?.releaseDate ?? ""} /></Field></div>
        </FormSection>
        <FormSection number="02" title="The market" copy="Select city cells and creator cultures that can reproduce the hook.">
          <p className="mono-label mb-3 text-muted-foreground">Target markets</p><div className="grid gap-px border border-foreground bg-foreground sm:grid-cols-2 xl:grid-cols-5">{workspace.markets.map((market) => <Toggle key={market.code} checked={markets.includes(market.code)} onChange={() => setMarkets(toggle(markets, market.code))} label={market.city} detail={market.primaryMotion.replaceAll("-", " ")} testId={`market-${market.code}`} />)}</div>
          <p className="mono-label mb-3 mt-7 text-muted-foreground">Creator cultures</p><div className="flex flex-wrap gap-2">{allNiches.map((niche) => <Chip key={niche} active={niches.includes(niche)} onClick={() => setNiches(toggle(niches, niche))}>{niche}</Chip>)}</div>
        </FormSection>
        <FormSection number="03" title="The test" copy="Scope measurable work, budgets, and the decision this campaign needs to make.">
          <p className="mono-label mb-3 text-muted-foreground">Decision objectives</p><div className="grid gap-px border border-foreground bg-foreground sm:grid-cols-2">{objectives.map((goal) => <Toggle key={goal} checked={goals.includes(goal)} onChange={() => setGoals(toggle(goals, goal))} label={goal} detail="Included in final evidence brief" />)}</div>
          <div className="mt-6 grid gap-5 sm:grid-cols-3"><Field label="Creator target"><Input name="targetCreatorCount" type="number" min={10} defaultValue={seed?.targetCreatorCount ?? program.creatorTarget} /></Field><Field label="Creator budget / USD"><Input name="creatorBudget" type="number" min={0} step={50} defaultValue={(seed?.creatorBudgetCents ?? 250000) / 100} /></Field><Field label="Paid test budget / USD"><Input name="paidMediaBudget" type="number" min={0} step={50} defaultValue={(seed?.paidMediaBudgetCents ?? 500000) / 100} /></Field></div>
        </FormSection>
        <FormSection number="04" title="Rights and owner" copy="No track enters the network without a responsible rights contact.">
          <div className="grid gap-5 sm:grid-cols-2"><Field label="Contact name"><Input name="contactName" required defaultValue={seed?.contactName ?? ""} /></Field><Field label="Contact email"><Input name="contactEmail" type="email" required defaultValue={seed?.contactEmail ?? ""} /></Field><Field label="Master file URL"><Input name="masterUrl" type="url" defaultValue={seed?.masterUrl ?? ""} placeholder="https://..." /></Field><Field label="Master authority"><NativeSelect name="rightsReadiness" defaultValue={seed?.rightsReadiness ?? "review"}><option value="unverified">Not yet verified</option><option value="review">Ready for review</option><option value="verified">Authority verified</option></NativeSelect></Field></div><Field label="Operator notes" className="mt-5"><Textarea name="notes" defaultValue={seed?.notes ?? ""} className="min-h-28 rounded-none border-foreground bg-card" /></Field>
        </FormSection>
        <div className="grid gap-6 bg-secondary p-5 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="flex items-center gap-2 font-semibold"><ShieldCheck className="size-5" />A submission creates an operating brief, not a performance promise.</p><p className="mt-2 text-sm text-muted-foreground">The team will verify authority, campaign fit, and cohort liquidity before contracting.</p>{result ? <p role={result.error ? "alert" : "status"} data-testid="pilot-result" className={`mt-4 border p-3 text-sm ${result.error ? "border-destructive text-destructive" : "border-foreground bg-card"}`}>{result.text}{result.next ? <Link className="ml-2 font-semibold underline" href={result.next}>Open operator setup</Link> : null}</p> : null}</div><Button type="submit" size="lg" disabled={pending || !markets.length || !niches.length || !goals.length} data-testid="submit-pilot">{pending ? <Loader2 className="animate-spin" /> : <FileCheck2 />}Submit founding intake<ArrowRight /></Button></div>
      </form>
    </section>
  </main>
}

function FormSection({ number, title, copy, children }: { number: string; title: string; copy: string; children: React.ReactNode }) { return <section className="grid border-b border-foreground last:border-b-0 lg:grid-cols-[18rem_1fr]"><div className="bg-card p-5 sm:p-7 lg:border-r lg:border-foreground"><span className="display-type text-5xl text-primary">{number}</span><h2 className="display-type mt-5 text-3xl">{title}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy}</p></div><div className="min-w-0 p-5 sm:p-8">{children}</div></section> }
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) { return <div className={className}><Label className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest">{label}</Label>{children}</div> }
function NativeSelect(props: React.ComponentProps<"select">) { return <select {...props} className="h-10 w-full rounded-none border border-foreground bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /> }
function Toggle({ checked, onChange, label, detail, testId }: { checked: boolean; onChange: () => void; label: string; detail: string; testId?: string }) { return <button type="button" aria-pressed={checked} data-testid={testId} onClick={onChange} className={`min-h-24 bg-card p-4 text-left transition-colors ${checked ? "bg-secondary" : "hover:bg-muted"}`}><span className="flex items-center justify-between gap-3 font-semibold">{label}<span className={`grid size-6 place-items-center border border-foreground ${checked ? "bg-foreground text-background" : ""}`}>{checked ? <Check className="size-4" /> : null}</span></span><small className="mt-4 block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{detail}</small></button> }
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" aria-pressed={active} onClick={onClick} className={`border border-foreground px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider ${active ? "bg-foreground text-background" : "bg-card hover:bg-secondary"}`}>{children}</button> }
function EmptyPilot() { return <main className="grid min-h-[80vh] place-items-center px-5 pt-24 text-center"><div><Sparkles className="mx-auto size-10 text-primary" /><h1 className="display-type mt-6 text-6xl">Pilot intake is offline.</h1><p className="mt-5 text-muted-foreground">Apply migration 023 or inspect the labeled operating simulation.</p><Button asChild className="mt-7"><Link href="/pilot/new?demo=1">Open simulation</Link></Button></div></main> }
function value(form: FormData, key: string) { return String(form.get(key) ?? "").trim() }
function nullable(input: string) { return input || null }
function integer(form: FormData, key: string) { return Math.round(Number(form.get(key) ?? 0)) }
function moneyToCents(form: FormData, key: string) { return Math.round(Number(form.get(key) ?? 0) * 100) }
function toggle(items: string[], valueToToggle: string) { return items.includes(valueToToggle) ? items.filter((item) => item !== valueToToggle) : [...items, valueToToggle] }
