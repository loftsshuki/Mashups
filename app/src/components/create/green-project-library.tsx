"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Plus } from "lucide-react"
import { z } from "zod"
import { buildGreenProjectPath, type GreenSavedProject } from "@mashups/contracts"
import { Button } from "@/components/ui/button"
import { buildAuthPath } from "@/lib/auth/return-path"
import { listLocalDrafts, type LocalDraftSummary } from "@/lib/green-room/local-draft"
import { greenSavedProjectSchema } from "@/lib/green-room/project-schema"

export function GreenProjectLibrary() {
  const [local, setLocal] = useState<LocalDraftSummary[] | null>(null)
  const [projects, setProjects] = useState<GreenSavedProject[] | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [needsLogin, setNeedsLogin] = useState(false)

  useEffect(() => {
    let cancelled = false
    void listLocalDrafts().then((drafts) => { if (!cancelled) setLocal(drafts) }).catch(() => { if (!cancelled) setLocalError("Device storage could not be read. Your account recipes are listed separately below.") })
    async function loadAccount() {
      try {
        const response = await fetch("/api/green/projects", { cache: "no-store", signal: AbortSignal.timeout(8000) })
        const body = await response.json()
        if (cancelled) return
        if (response.status === 401) { setNeedsLogin(true); return }
        if (!response.ok) throw new Error(body.error ?? "Account recipes could not be loaded.")
        setProjects(z.array(greenSavedProjectSchema).parse(body.projects))
      } catch (error) {
        if (!cancelled) setAccountError(error instanceof Error ? error.message : "Account recipes could not be loaded.")
      }
    }
    void loadAccount()
    return () => { cancelled = true }
  }, [])

  return <div className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
    <div className="flex flex-wrap items-end justify-between gap-6 border-b border-foreground pb-8">
      <div><p className="signal-label">Your studio / Saved</p><h1 className="display-type mt-5 text-5xl leading-none sm:text-7xl">Pick up the mix.</h1><p className="mt-5 max-w-xl text-muted-foreground">Your experiments, kept together. Open a draft or start something new.</p></div>
      <Button asChild size="lg"><Link href="/create?fresh=1"><Plus />New mashup</Link></Button>
    </div>
    <section aria-labelledby="device-drafts" className="mt-10">
      <h2 id="device-drafts" className="text-2xl font-semibold">On this device</h2>
      <p className="mt-2 text-sm text-muted-foreground">Draft recipes and cached previews in this browser. Clearing browser data removes these copies.</p>
      {localError ? <p role="alert" className="mt-5 border border-foreground p-4">{localError}</p> : local === null ? <p role="status" className="mt-5">Loading device drafts…</p> : local.length === 0 ? <p className="mt-5 border border-foreground bg-card p-5">No drafts on this device yet. Your next mix starts with two songs.</p> : <ul className="mt-5 divide-y divide-foreground border-y border-foreground">{local.map((draft) => <ProjectRow key={draft.id} id={draft.id} title={draft.title} updatedAt={draft.savedAt} detail={`${draft.audioCount} cached preview${draft.audioCount === 1 ? "" : "s"}`} />)}</ul>}
    </section>
    <section aria-labelledby="account-recipes" className="mt-12">
      <h2 id="account-recipes" className="text-2xl font-semibold">In your account</h2>
      <p className="mt-2 text-sm text-muted-foreground">Private recipes available after sign-in. Generate previews again when opening on another device.</p>
      {needsLogin ? <div className="mt-5 border border-foreground bg-secondary p-5"><p>Sign in to see the recipes you saved to your account.</p><Button asChild className="mt-4"><Link href={buildAuthPath("login", "/projects")}>Log in <ArrowRight /></Link></Button></div> : accountError ? <div role="alert" className="mt-5 border border-foreground p-5"><p>{accountError}</p><Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Try again</Button></div> : projects === null ? <p role="status" className="mt-5">Loading account recipes…</p> : projects.length === 0 ? <p className="mt-5 border border-foreground bg-card p-5">No account recipes yet. Choose “Save to account” in the studio to keep one here.</p> : <><ul className="mt-5 divide-y divide-foreground border-y border-foreground">{projects.map((project) => <ProjectRow key={project.id} id={project.id} title={project.title} updatedAt={project.updatedAt} detail={`Revision ${project.revision} · ${project.status}`} />)}</ul>{projects.length === 50 ? <p className="mt-3 text-sm text-muted-foreground">Showing your 50 most recently updated recipes.</p> : null}</>}
    </section>
  </div>
}

function ProjectRow({ id, title, updatedAt, detail }: { id: string; title: string; updatedAt: string; detail: string }) {
  return <li><Link href={buildGreenProjectPath(id)} className="group flex items-center justify-between gap-5 px-3 py-6 transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary"><div className="min-w-0"><h3 className="break-words text-lg font-semibold">{title}</h3><p className="mt-2 text-sm text-muted-foreground">{detail} · <time dateTime={updatedAt}>{new Date(updatedAt).toLocaleDateString()}</time></p></div><ArrowRight className="size-5 shrink-0" aria-hidden="true" /></Link></li>
}
