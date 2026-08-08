"use client"

import { FormEvent, useRef, useState } from "react"
import Link from "next/link"
import { ArrowDownToLine, ArrowRight, Check, ClipboardCheck, FileJson, Gauge, Loader2, LockKeyhole, RotateCcw, ShieldCheck, SlidersHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { buildPilotCampaignPacket, pilotCampaignPacketToMarkdown, pilotPacketFilename } from "@/lib/pilot/artifacts"
import { downloadTextFile, readLocalPilotWorkspace, updateLocalPilotWorkspace } from "@/lib/pilot/local-workspace"
import type { PilotOperatorConfig, PilotWorkspace } from "@/lib/pilot/types"

const rails = ["linkfire", "featurefm", "distributor", "ad_platform"] as const

export function OperatorConsole({ workspace, demo }: { workspace: PilotWorkspace; demo: boolean }) {
  const [intake, setIntake] = useState(workspace.intake)
  const [seed, setSeed] = useState(workspace.operatorConfig ?? defaults(intake?.id ?? ""))
  const [partnerRails, setPartnerRails] = useState<string[]>(seed.partnerRails)
  const [protection, setProtection] = useState(seed.protectionTerms.enabled)
  const [formVersion, setFormVersion] = useState(0)
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  if (!intake) return <EmptyOperator demo={demo} />
  const activeIntake = intake
  const intakeId = intake.id

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setFeedback(null)
    const form = new FormData(event.currentTarget)
    const body = configFromForm(form, intakeId, partnerRails, protection)
    try {
      const response = await fetch(`/api/pilot/operator${demo ? "?demo=1" : ""}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await response.json() as { error?: string; status?: string; readiness?: number }
      if (!response.ok) throw new Error(data.error ?? "Unable to save operator setup.")
      if (demo) updateLocalPilotWorkspace({ operatorConfig: { ...body, status: "ready" } })
      setSeed({ ...body, status: data.status === "ready" ? "ready" : "draft" })
      setFeedback({ text: `Operator setup ${data.status}. Readiness is ${data.readiness}%.${demo ? " Saved on this device." : ""}` })
    } catch (error) { setFeedback({ text: error instanceof Error ? error.message : "Unable to save operator setup.", error: true }) }
    finally { setPending(false) }
  }

  function restoreDeviceWorkspace() {
    const local = readLocalPilotWorkspace()
    if (!local?.intake) { setFeedback({ text: "No pilot intake is saved on this device.", error: true }); return }
    const restored = local.operatorConfig ?? defaults(local.intake.id)
    setIntake(local.intake); setSeed(restored); setPartnerRails(restored.partnerRails); setProtection(restored.protectionTerms.enabled); setFormVersion((version) => version + 1)
    setFeedback({ text: `Restored ${local.intake.artistName} / ${local.intake.trackTitle} from this device.` })
  }

  function exportPacket(format: "json" | "md") {
    if (!formRef.current) return
    const config = configFromForm(new FormData(formRef.current), intakeId, partnerRails, protection)
    const packet = buildPilotCampaignPacket(activeIntake, config)
    const content = format === "json" ? JSON.stringify(packet, null, 2) : pilotCampaignPacketToMarkdown(packet)
    downloadTextFile(pilotPacketFilename(activeIntake, format), content, format === "json" ? "application/json" : "text/markdown")
    setFeedback({ text: `${format.toUpperCase()} campaign packet exported. This planning file is not a signed license.` })
  }

  const ready = workspace.checklist.filter((item) => item.status === "ready").length
  return <main className="pilot-shell pb-28 pt-[68px]">
    <div className="border-b border-foreground bg-primary px-4 py-2 text-primary-foreground"><div className="mx-auto flex max-w-[1600px] justify-between font-mono text-[10px] font-bold uppercase tracking-[0.16em]"><span>Operator desk / {intake.campaignName}</span><span>{demo ? "Device-local / no server write" : "Live workspace"}</span></div></div>
    <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <header className="grid border-x border-b border-foreground lg:grid-cols-[1fr_22rem]"><div className="pilot-grid relative overflow-hidden p-5 py-12 sm:p-9 sm:py-16"><div className="relative"><div className="flex flex-wrap items-center gap-3"><p className="signal-label">Campaign operating contract</p><Badge className="rounded-none" variant="outline">{intake.rightsReadiness} rights</Badge></div><h1 className="display-type mt-8 text-[clamp(3.5rem,11vw,8rem)] leading-[0.75]">CONFIGURE<br /><span className="text-primary">THE PROMISE.</span></h1><p className="mt-7 max-w-2xl text-lg text-muted-foreground">Turn {intake.artistName}&apos;s {intake.trackTitle} into a precise package the team can deliver, measure, and defend.</p></div></div><aside className="border-t border-foreground bg-secondary p-6 lg:border-l lg:border-t-0 sm:p-8"><Gauge className="size-7" /><p className="display-type mt-10 text-7xl">{ready}/{workspace.checklist.length}</p><p className="font-mono text-[10px] uppercase tracking-widest">evidence gates ready</p><div className="mt-8 border-t border-foreground">{workspace.checklist.map((item) => <div key={item.key} className="flex items-center gap-3 border-b border-foreground py-3 text-xs"><span className={`size-2 shrink-0 ${item.status === "ready" ? "bg-foreground" : item.status === "blocked" ? "bg-destructive" : "border border-foreground"}`} />{item.label}</div>)}</div></aside></header>
      <form key={formVersion} ref={formRef} onSubmit={submit} className="border-x border-b border-foreground" data-testid="operator-form">
        <OperatorSection icon={ClipboardCheck} number="01" title="Guaranteed launch" tone="secondary"><NumberField name="creatorFloor" label="Creator opportunity floor" value={seed.guaranteedLaunch.creatorFloor} min={10} /><NumberField name="qualifiedPostFloor" label="Qualified post floor" value={seed.guaranteedLaunch.qualifiedPostFloor} min={1} /><NumberField name="genomeFloor" label="Hook genome tests" value={seed.guaranteedLaunch.genomeFloor} min={1} /><NumberField name="reportDueDays" label="Report due / days" value={seed.guaranteedLaunch.reportDueDays} min={1} /></OperatorSection>
        <OperatorSection icon={LockKeyhole} number="02" title="Growth license"><TextField name="territories" label="Territories / comma separated" value={seed.growthLicense.territories.join(", ")} /><NumberField name="termDays" label="Term / days" value={seed.growthLicense.termDays} min={1} /><NumberField name="paidMediaCap" label="Paid media cap / USD" value={seed.growthLicense.paidMediaCapCents / 100} min={0} /><NumberField name="takedownSlaHours" label="Takedown SLA / hours" value={seed.growthLicense.takedownSlaHours} min={1} /></OperatorSection>
        <OperatorSection icon={SlidersHorizontal} number="03" title="Control terms" tone="dark"><SelectField name="exclusivityType" label="Exclusivity type" value={seed.exclusivity.type} options={["campaign", "category", "platform", "territory"]} dark /><NumberField name="exclusivityDays" label="Exclusivity / days" value={seed.exclusivity.days} min={1} dark /><NumberField name="campaignSlots" label="Campaign slots" value={seed.exclusivity.slots} min={1} dark /><SelectField name="tier" label="Commercial tier" value={seed.commercialOffer.tier} options={["pilot", "growth", "label_os"]} dark /></OperatorSection>
        <OperatorSection icon={Check} number="04" title="Artist participation"><NumberField name="reactionCount" label="Winner reactions" value={seed.artistParticipation.reactionCount} min={0} /><NumberField name="repostCount" label="Artist reposts" value={seed.artistParticipation.repostCount} min={0} /><NumberField name="liveSessionCount" label="Live squad sessions" value={seed.artistParticipation.liveSessionCount} min={0} /><div><Label className="operator-label">Partner rails</Label><div className="grid grid-cols-2 gap-2">{rails.map((rail) => <button key={rail} type="button" aria-pressed={partnerRails.includes(rail)} onClick={() => setPartnerRails(toggle(partnerRails, rail))} className={`border border-foreground p-2 font-mono text-[9px] uppercase ${partnerRails.includes(rail) ? "bg-secondary" : "bg-card"}`}>{rail.replaceAll("_", " ")}</button>)}</div></div></OperatorSection>
        <OperatorSection icon={Gauge} number="05" title="Measurement"><SelectField name="metric" label="Primary metric" value={seed.measurementPlan.metric} options={["save_rate", "follow_rate", "stream_rate", "qualified_post_rate"]} /><TextField name="controlMethod" label="Control method" value={seed.measurementPlan.controlMethod} /><NumberField name="minimumCohort" label="Minimum cohort" value={seed.measurementPlan.minimumCohort} min={100} /><div className="grid grid-cols-2 gap-3"><NumberField name="creatorReward" label="Creator reward / USD" value={seed.commercialOffer.creatorRewardCents / 100} min={15} /><NumberField name="platformFee" label="Platform fee / USD" value={seed.commercialOffer.platformFeeCents / 100} min={0} /></div></OperatorSection>
        <OperatorSection icon={ShieldCheck} number="06" title="Launch protection" tone="secondary"><button type="button" aria-pressed={protection} onClick={() => setProtection(!protection)} className={`min-h-20 border border-foreground p-4 text-left font-semibold ${protection ? "bg-foreground text-background" : "bg-card"}`}>{protection ? "Protection enabled" : "Protection disabled"}<small className="mt-2 block font-mono text-[9px] uppercase opacity-60">Platform-fee service credit only</small></button><NumberField name="serviceCreditCap" label="Service credit cap / USD" value={seed.protectionTerms.serviceCreditCapCents / 100} min={0} /><TextField name="excludes" label="Explicit exclusions / comma separated" value={seed.protectionTerms.excludes.join(", ")} /><div className="border border-foreground bg-card p-4 text-sm leading-relaxed">Protection covers failed operating deliverables. It excludes streams, revenue, chart position, and virality.</div></OperatorSection>
        <div className="grid gap-5 p-5 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center"><div>{feedback ? <p role={feedback.error ? "alert" : "status"} data-testid="operator-result" className={`border p-3 text-sm ${feedback.error ? "border-destructive text-destructive" : "border-foreground bg-secondary"}`}>{feedback.text}</p> : <p className="text-sm text-muted-foreground">Save locally, then export a portable planning packet. Rights authority still requires independent verification.</p>}</div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={restoreDeviceWorkspace} data-testid="restore-operator"><RotateCcw />Restore</Button><Button type="button" variant="outline" onClick={() => exportPacket("md")} data-testid="export-packet-md"><ArrowDownToLine />Brief</Button><Button type="button" variant="outline" onClick={() => exportPacket("json")} data-testid="export-packet-json"><FileJson />JSON</Button><Button type="submit" disabled={pending || !partnerRails.length} data-testid="save-operator">{pending ? <Loader2 className="animate-spin" /> : <ShieldCheck />}Lock brief<ArrowRight /></Button></div></div>
      </form>
    </section>
  </main>
}

function OperatorSection({ icon: Icon, number, title, tone, children }: { icon: typeof Check; number: string; title: string; tone?: "secondary" | "dark"; children: React.ReactNode }) { return <section className={`grid gap-px border-b border-foreground p-5 sm:p-8 lg:grid-cols-[15rem_repeat(4,minmax(0,1fr))] ${tone === "secondary" ? "bg-secondary" : tone === "dark" ? "bg-foreground text-background" : "bg-background"}`}><div className="pr-4"><Icon className={tone === "dark" ? "size-5 text-secondary" : "size-5 text-primary"} /><p className="display-type mt-5 text-5xl">{number}</p><h2 className="display-type mt-2 text-2xl">{title}</h2></div>{children}</section> }
function NumberField({ name, label, value, min, dark }: { name: string; label: string; value: number; min: number; dark?: boolean }) { return <div><Label htmlFor={name} className={`operator-label ${dark ? "text-background/60" : ""}`}>{label}</Label><Input id={name} name={name} type="number" min={min} required defaultValue={value} className={dark ? "rounded-none border-background/40 bg-background/10 text-background" : "rounded-none border-foreground bg-card"} /></div> }
function TextField({ name, label, value }: { name: string; label: string; value: string }) { return <div><Label htmlFor={name} className="operator-label">{label}</Label><Input id={name} name={name} required defaultValue={value} className="rounded-none border-foreground bg-card" /></div> }
function SelectField({ name, label, value, options, dark }: { name: string; label: string; value: string; options: string[]; dark?: boolean }) { return <div><Label htmlFor={name} className={`operator-label ${dark ? "text-background/60" : ""}`}>{label}</Label><select id={name} name={name} defaultValue={value} className={`h-10 w-full border px-3 text-sm ${dark ? "border-background/40 bg-foreground text-background" : "border-foreground bg-card"}`}>{options.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select></div> }
function EmptyOperator({ demo }: { demo: boolean }) { return <main className="grid min-h-[80vh] place-items-center px-5 pt-24 text-center"><div><ShieldCheck className="mx-auto size-10 text-primary" /><h1 className="display-type mt-6 text-6xl">No pilot to operate.</h1><p className="mt-5 text-muted-foreground">Submit a campaign intake before configuring delivery.</p><Button asChild className="mt-7"><Link href={`/pilot/new${demo ? "?demo=1" : ""}`}>Start intake</Link></Button></div></main> }
function defaults(intakeId: string): PilotOperatorConfig { return { intakeId, status: "draft", guaranteedLaunch: { creatorFloor: 50, qualifiedPostFloor: 50, genomeFloor: 3, reportDueDays: 14 }, growthLicense: { territories: ["Worldwide"], termDays: 90, paidMediaCapCents: 2500000, takedownSlaHours: 24 }, exclusivity: { type: "campaign", days: 90, slots: 3 }, artistParticipation: { reactionCount: 5, repostCount: 3, liveSessionCount: 1 }, partnerRails: ["linkfire", "featurefm"], measurementPlan: { metric: "save_rate", controlMethod: "matched_holdout", minimumCohort: 100 }, commercialOffer: { tier: "pilot", creatorRewardCents: 5000, platformFeeCents: 250000 }, protectionTerms: { enabled: true, serviceCreditCapCents: 250000, excludes: ["streams", "revenue", "chart position", "virality"] } } }
function configFromForm(form: FormData, intakeId: string, partnerRails: string[], protection: boolean): PilotOperatorConfig { return { intakeId, status: "draft", guaranteedLaunch: { creatorFloor: int(form, "creatorFloor"), qualifiedPostFloor: int(form, "qualifiedPostFloor"), genomeFloor: int(form, "genomeFloor"), reportDueDays: int(form, "reportDueDays") }, growthLicense: { territories: split(form, "territories"), termDays: int(form, "termDays"), paidMediaCapCents: cents(form, "paidMediaCap"), takedownSlaHours: int(form, "takedownSlaHours") }, exclusivity: { type: str(form, "exclusivityType") as PilotOperatorConfig["exclusivity"]["type"], days: int(form, "exclusivityDays"), slots: int(form, "campaignSlots") }, artistParticipation: { reactionCount: int(form, "reactionCount"), repostCount: int(form, "repostCount"), liveSessionCount: int(form, "liveSessionCount") }, partnerRails, measurementPlan: { metric: str(form, "metric") as PilotOperatorConfig["measurementPlan"]["metric"], controlMethod: str(form, "controlMethod"), minimumCohort: int(form, "minimumCohort") }, commercialOffer: { tier: str(form, "tier") as PilotOperatorConfig["commercialOffer"]["tier"], creatorRewardCents: cents(form, "creatorReward"), platformFeeCents: cents(form, "platformFee") }, protectionTerms: { enabled: protection, serviceCreditCapCents: cents(form, "serviceCreditCap"), excludes: split(form, "excludes") } } }
function str(form: FormData, key: string) { return String(form.get(key) ?? "").trim() }
function int(form: FormData, key: string) { return Math.round(Number(form.get(key) ?? 0)) }
function cents(form: FormData, key: string) { return Math.round(Number(form.get(key) ?? 0) * 100) }
function split(form: FormData, key: string) { return str(form, key).split(",").map((item) => item.trim()).filter(Boolean) }
function toggle(items: string[], item: string) { return items.includes(item) ? items.filter((value) => value !== item) : [...items, item] }
