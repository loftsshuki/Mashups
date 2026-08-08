"use client"

import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowDownToLine, ArrowRight, Building2, Check, Copy, Loader2, Plus, Radar, RotateCcw, Upload, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { parseProspectsCsv, prospectsToCsv } from "@/lib/pilot/csv"
import { downloadTextFile, readLocalPilotWorkspace, updateLocalPilotWorkspace } from "@/lib/pilot/local-workspace"
import type { OutreachProspect, OutreachStage, OutreachWorkspace, ProspectType } from "@/lib/pilot/types"

const stages: OutreachStage[] = ["research", "qualified", "contacted", "replied", "meeting", "pilot", "won"]
const types: ProspectType[] = ["label", "distributor", "artist_manager", "venue", "creator_agency", "artist"]

export function OutreachCrm({ workspace, demo }: { workspace: OutreachWorkspace; demo: boolean }) {
  const [prospects, setProspects] = useState(workspace.prospects)
  const [pending, setPending] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)
  const counts = useMemo(() => Object.fromEntries(stages.map((stage) => [stage, prospects.filter((item) => item.stage === stage).length])), [prospects])
  const priority = prospects.filter((prospect) => prospect.priority >= 4 && !["won", "lost"].includes(prospect.stage)).length

  async function advance(prospect: OutreachProspect) {
    const next = stages[Math.min(stages.indexOf(prospect.stage) + 1, stages.length - 1)]
    if (!next || next === prospect.stage) return
    setPending(prospect.id); setFeedback(null)
    try {
      const response = await fetch(`/api/pilot/outreach/${prospect.id}${demo ? "?demo=1" : ""}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage: next, nextAction: suggestedAction(next) }) })
      const data = await response.json() as { error?: string }
      if (!response.ok) throw new Error(data.error ?? "Unable to move prospect.")
      const updated = prospects.map((item) => item.id === prospect.id ? { ...item, stage: next, nextAction: suggestedAction(next) } : item)
      setProspects(updated)
      if (demo) updateLocalPilotWorkspace({ prospects: updated })
      setFeedback({ text: `${prospect.entityName} moved to ${next}.` })
    } catch (error) { setFeedback({ text: error instanceof Error ? error.message : "Unable to move prospect.", error: true }) }
    finally { setPending(null) }
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending("add"); setFeedback(null)
    const form = new FormData(event.currentTarget)
    const entityName = str(form, "entityName")
    const body = { entityName, entityType: str(form, "entityType"), contactName: nullable(str(form, "contactName")), contactEmail: nullable(str(form, "contactEmail")), city: nullable(str(form, "city")), countryCode: str(form, "countryCode").toUpperCase() || null, genres: str(form, "genres").split(",").map((item) => item.trim()).filter(Boolean), catalogSignal: nullable(str(form, "catalogSignal")), priority: Number(form.get("priority") ?? 3), nextAction: nullable(str(form, "nextAction")), dueAt: null, sourceUrl: null, notes: null }
    try {
      const response = await fetch(`/api/pilot/outreach${demo ? "?demo=1" : ""}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await response.json() as { error?: string; prospectId?: string }
      if (!response.ok) throw new Error(data.error ?? "Unable to add prospect.")
      const prospectId = demo || !data.prospectId ? `local-prospect-${crypto.randomUUID()}` : data.prospectId
      const updated: OutreachProspect[] = [{ id: prospectId, entityName, entityType: body.entityType as ProspectType, contactName: body.contactName, contactEmail: body.contactEmail, city: body.city, countryCode: body.countryCode, genres: body.genres, catalogSignal: body.catalogSignal, priority: body.priority, stage: "research", nextAction: body.nextAction, dueAt: null, sourceUrl: null, notes: null }, ...prospects]
      setProspects(updated)
      if (demo) updateLocalPilotWorkspace({ prospects: updated })
      setFeedback({ text: `${entityName} added to research.` }); setShowAdd(false); event.currentTarget.reset()
    } catch (error) { setFeedback({ text: error instanceof Error ? error.message : "Unable to add prospect.", error: true }) }
    finally { setPending(null) }
  }

  function exportCurrentPipeline() {
    downloadTextFile("mashups-outreach-pipeline.csv", prospectsToCsv(prospects), "text/csv;charset=utf-8")
    setFeedback({ text: `Exported ${prospects.length} current pipeline records from this browser.` })
  }

  function restoreDevicePipeline() {
    const saved = readLocalPilotWorkspace()?.prospects
    if (!saved?.length) { setFeedback({ text: "No outreach pipeline is saved on this device.", error: true }); return }
    setProspects(saved); setFeedback({ text: `Restored ${saved.length} pipeline records from this device.` })
  }

  function resetPipeline() {
    setProspects(workspace.prospects)
    if (demo) updateLocalPilotWorkspace({ prospects: workspace.prospects })
    setFeedback({ text: "Pipeline reset to the labeled founding example." })
  }

  async function importPipeline(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (file.size > 1_000_000) { setFeedback({ text: "CSV must be smaller than 1 MB.", error: true }); return }
    const parsed = parseProspectsCsv(await file.text())
    if (!parsed.prospects.length) { setFeedback({ text: "No valid prospects were found. Include an entity_name column.", error: true }); return }
    const existing = new Set(prospects.map(prospectKey))
    const additions = parsed.prospects.filter((prospect) => !existing.has(prospectKey(prospect)))
    const updated = [...additions, ...prospects]
    setProspects(updated)
    if (demo) updateLocalPilotWorkspace({ prospects: updated })
    setFeedback({ text: `Imported ${additions.length} new records. ${parsed.rejectedRows} blank rows rejected.` })
  }

  return <main className="pilot-shell pb-28 pt-[68px]">
    <div className="border-b border-foreground bg-foreground px-4 py-2 text-background"><div className="mx-auto flex max-w-[1700px] justify-between font-mono text-[10px] font-bold uppercase tracking-[0.16em]"><span>Acquisition desk / Independent electronic</span><span>{demo ? "Device-local / labeled seed" : "Live pipeline"}</span></div></div>
    <section className="mx-auto max-w-[1700px] px-4 sm:px-6 lg:px-8">
      <header className="grid border-x border-b border-foreground lg:grid-cols-[1fr_28rem]"><div className="pipeline-stripes relative overflow-hidden p-5 py-12 sm:p-9 sm:py-16"><div className="relative"><p className="signal-label">Rightsholder acquisition</p><h1 className="display-type mt-8 text-[clamp(3.8rem,11vw,9rem)] leading-[0.72]">FIND<br />THE RIGHTS.<br /><span className="text-primary">EARN THE YES.</span></h1><p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">Prioritize reachable masters, active releases, artist participation, and campaign edit authority. Popularity without control is not inventory.</p></div></div><aside className="grid grid-cols-2 border-t border-foreground bg-secondary lg:grid-cols-1 lg:border-l lg:border-t-0"><Metric value={String(prospects.length)} label="qualified universe" icon={Radar} /><Metric value={String(priority)} label="priority follow-ups" icon={Users} /></aside></header>
      <div className="grid gap-px border-x border-b border-foreground bg-foreground sm:grid-cols-4 xl:grid-cols-7" data-testid="outreach-pipeline">{stages.map((stage, index) => <div key={stage} className="bg-card p-4"><div className="flex items-center justify-between"><span className="font-mono text-[9px] uppercase tracking-widest">0{index + 1}</span><span className="size-2 bg-primary" /></div><p className="display-type mt-5 text-4xl">{counts[stage] ?? 0}</p><p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{stage}</p></div>)}</div>
      <div className="grid border-x border-b border-foreground xl:grid-cols-[1fr_22rem]">
        <section className="min-w-0 p-4 sm:p-7 xl:border-r xl:border-foreground"><div className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground pb-4"><div><p className="mono-label text-muted-foreground">Working pipeline</p><h2 className="display-type mt-2 text-4xl">Next best action</h2></div><div className="flex flex-wrap gap-2"><input ref={importRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => void importPipeline(event)} data-testid="import-outreach-input" /><Button variant="outline" onClick={restoreDevicePipeline} data-testid="restore-outreach"><RotateCcw />Restore</Button><Button variant="outline" onClick={() => importRef.current?.click()} data-testid="import-outreach"><Upload />Import</Button><Button variant="outline" onClick={exportCurrentPipeline} data-testid="export-outreach"><ArrowDownToLine />Export</Button><Button onClick={() => setShowAdd((value) => !value)}><Plus />Add target</Button></div></div>
          {feedback ? <p role={feedback.error ? "alert" : "status"} data-testid="outreach-result" className={`my-4 border p-3 text-sm ${feedback.error ? "border-destructive text-destructive" : "border-foreground bg-secondary"}`}>{feedback.text}</p> : null}
          {showAdd ? <form onSubmit={add} className="my-5 grid gap-4 border border-foreground bg-secondary p-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="add-prospect-form"><MiniField label="Entity"><Input name="entityName" required className="rounded-none border-foreground bg-card" /></MiniField><MiniField label="Type"><select name="entityType" className="h-10 w-full border border-foreground bg-card px-2 text-sm">{types.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select></MiniField><MiniField label="Contact"><Input name="contactName" className="rounded-none border-foreground bg-card" /></MiniField><MiniField label="Email"><Input name="contactEmail" type="email" className="rounded-none border-foreground bg-card" /></MiniField><MiniField label="City"><Input name="city" className="rounded-none border-foreground bg-card" /></MiniField><MiniField label="Country"><Input name="countryCode" maxLength={3} className="rounded-none border-foreground bg-card" /></MiniField><MiniField label="Genres"><Input name="genres" required placeholder="House, Techno" className="rounded-none border-foreground bg-card" /></MiniField><MiniField label="Priority"><Input name="priority" type="number" min={1} max={5} defaultValue={3} className="rounded-none border-foreground bg-card" /></MiniField><MiniField label="Catalog signal" className="sm:col-span-2"><Input name="catalogSignal" className="rounded-none border-foreground bg-card" /></MiniField><MiniField label="Next action" className="sm:col-span-2"><Input name="nextAction" className="rounded-none border-foreground bg-card" /></MiniField><Button type="submit" disabled={pending === "add"} data-testid="save-prospect" className="sm:col-span-2 lg:col-span-4">{pending === "add" ? <Loader2 className="animate-spin" /> : <Plus />}Save target</Button></form> : null}
          <div className="border-b border-foreground">{prospects.map((prospect) => <article key={prospect.id} className="grid gap-4 border-t border-foreground py-5 first:border-t-0 lg:grid-cols-[3rem_minmax(11rem,1fr)_9rem_minmax(10rem,0.8fr)_auto] lg:items-center"><span className="grid size-10 place-items-center border border-foreground bg-card font-mono text-xs font-bold">P{prospect.priority}</span><div className="min-w-0"><h3 className="truncate text-lg font-semibold">{prospect.entityName}</h3><p className="mt-1 truncate font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{prospect.entityType.replaceAll("_", " ")} / {prospect.city ?? "Remote"} / {prospect.genres.join(" + ")}</p></div><Badge variant={prospect.stage === "pilot" || prospect.stage === "won" ? "secondary" : "outline"} className="w-fit rounded-none">{prospect.stage}</Badge><div><p className="text-sm font-medium">{prospect.nextAction ?? "Define next action"}</p><p className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">{prospect.contactName ?? "Contact needed"}</p></div><Button size="sm" variant="outline" disabled={pending === prospect.id || prospect.stage === "won"} onClick={() => void advance(prospect)} aria-label={`Advance ${prospect.entityName}`} data-testid={`advance-${prospect.id}`}>{pending === prospect.id ? <Loader2 className="animate-spin" /> : <ArrowRight />}Advance</Button></article>)}</div>
        </section>
        <aside className="bg-card p-5 sm:p-7"><p className="mono-label text-muted-foreground">Field playbook</p><h2 className="display-type mt-4 text-4xl">Lead with control.</h2><p className="mt-4 border border-foreground bg-secondary p-3 text-xs leading-relaxed">Device-local records stay in this browser. Export regularly and avoid shared devices.</p><div className="mt-7 space-y-5">{workspace.templates.map((template) => <article key={template.code} className="border border-foreground bg-background p-4"><div className="flex items-center justify-between gap-3"><Badge variant="outline" className="rounded-none">{template.channel}</Badge><button type="button" aria-label={`Copy ${template.code}`} onClick={() => void navigator.clipboard.writeText([template.subject, template.body].filter(Boolean).join("\n\n"))}><Copy className="size-4" /></button></div>{template.subject ? <h3 className="mt-4 font-semibold">{template.subject}</h3> : null}<p className="mt-3 text-sm leading-relaxed text-muted-foreground">{template.body}</p></article>)}</div><div className="mt-6 grid gap-2"><Button variant="outline" className="w-full" asChild><Link href={`/readiness${demo ? "?demo=1" : ""}`}><Check />Launch readiness</Link></Button>{demo ? <Button variant="ghost" className="w-full" onClick={resetPipeline}>Reset labeled seed</Button> : null}</div></aside>
      </div>
    </section>
  </main>
}

function Metric({ value, label, icon: Icon }: { value: string; label: string; icon: typeof Building2 }) { return <div className="flex flex-col justify-between border-b border-foreground p-6 last:border-b-0 sm:p-8"><Icon className="size-6" /><div className="mt-10"><p className="display-type text-7xl">{value}</p><p className="font-mono text-[10px] uppercase tracking-widest">{label}</p></div></div> }
function MiniField({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) { return <label className={`block ${className}`}><span className="mb-2 block font-mono text-[9px] font-bold uppercase tracking-widest">{label}</span>{children}</label> }
function suggestedAction(stage: OutreachStage) { return ({ qualified: "Confirm authority and release window", contacted: "Follow up in three business days", replied: "Send Growth License one-pager", meeting: "Run 20-minute campaign-fit review", pilot: "Confirm track and operator terms", won: "Open founding intake" } as Partial<Record<OutreachStage, string>>)[stage] ?? "Define next action" }
function str(form: FormData, key: string) { return String(form.get(key) ?? "").trim() }
function nullable(value: string) { return value || null }
function prospectKey(prospect: OutreachProspect) { return `${prospect.entityName.trim().toLowerCase()}|${prospect.contactEmail?.trim().toLowerCase() ?? ""}` }
