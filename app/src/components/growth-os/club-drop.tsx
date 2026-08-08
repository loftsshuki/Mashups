"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Disc3, MapPin, RadioTower, Save, ScanLine, Share2, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ClubActivation } from "@/lib/growth-os/types"

export function ClubDrop({ activation, demo }: { activation: ClubActivation; demo: boolean }) {
  const [message, setMessage] = useState<string | null>(null)
  const [saves, setSaves] = useState(activation.saves)

  useEffect(() => {
    const key = getAnonymousKey()
    void fetch(`/api/growth/club/${activation.code}${demo ? "?demo=1" : ""}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventType: "scan", anonymousKey: key }) })
  }, [activation.code, demo])

  async function record(eventType: "save" | "share" | "join") {
    const response = await fetch(`/api/growth/club/${activation.code}${demo ? "?demo=1" : ""}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventType, anonymousKey: getAnonymousKey() }) })
    if (!response.ok) { setMessage("The venue signal could not be recorded."); return }
    if (eventType === "save") setSaves((value) => value + 1)
    if (eventType === "share" && navigator.share) await navigator.share({ title: `${activation.venue} venue drop`, url: window.location.href }).catch(() => undefined)
    setMessage(eventType === "save" ? "Saved. The afterhours edit is now attached to your account." : eventType === "join" ? `${activation.city} cell joined.` : "Venue signal shared.")
  }

  return <div className="club-drop relative min-h-screen overflow-hidden bg-foreground pb-24 pt-24 text-background"><div className="club-beams absolute inset-0" /><section className="relative mx-auto max-w-6xl px-4 sm:px-6"><Link href="/network?demo=1" className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-background/65"><ArrowLeft className="size-4" />Network command</Link><div className="mt-8 grid border border-background/35 lg:grid-cols-[1.1fr_0.9fr]"><div className="relative min-h-[62vh] overflow-hidden border-b border-background/35 p-6 sm:p-10 lg:border-b-0 lg:border-r"><Disc3 className="absolute -bottom-24 -right-24 size-[30rem] animate-[spin_18s_linear_infinite] opacity-10" /><p className="flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary"><RadioTower className="size-4" />Live room signal / {activation.code}</p><h1 className="display-type mt-12 text-[clamp(4.5rem,12vw,10rem)] leading-[0.72]">THE<br />ROOM<br /><span className="text-secondary">MOVED.</span></h1><div className="mt-10 flex flex-wrap gap-5 font-mono text-xs text-background/60"><span className="flex items-center gap-2"><MapPin className="size-4 text-secondary" />{activation.venue}, {activation.city}</span><span className="flex items-center gap-2"><ScanLine className="size-4 text-secondary" />{activation.scans + 1} scans</span></div></div><div className="flex flex-col justify-between bg-secondary p-6 text-secondary-foreground sm:p-10"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">Midnight Velocity / Nia Vale</p><h2 className="display-type mt-8 text-5xl leading-[0.88]">TAKE THE DROP HOME.</h2><p className="mt-6 leading-relaxed text-secondary-foreground/70">{activation.reward}</p><div className="mt-8 border-y border-secondary-foreground py-5"><p className="display-type text-6xl">{saves}</p><p className="font-mono text-[10px] uppercase tracking-widest">saves from this room</p></div></div><div className="mt-9 space-y-3"><Button className="w-full" onClick={() => void record("save")}><Save />Save the track</Button><div className="grid grid-cols-2 gap-3"><Button variant="outline" className="border-secondary-foreground" onClick={() => void record("join")}><Users />Join {activation.city}</Button><Button variant="outline" className="border-secondary-foreground" onClick={() => void record("share")}><Share2 />Pass it on</Button></div>{message ? <p role="status" className="flex items-start gap-2 border border-secondary-foreground p-3 text-sm"><Check className="mt-0.5 size-4 shrink-0" />{message}</p> : null}</div></div></div></section></div>
}

function getAnonymousKey() {
  const storageKey = "mashups.club.anonymous"
  const existing = window.localStorage.getItem(storageKey)
  if (existing) return existing
  const key = crypto.randomUUID()
  window.localStorage.setItem(storageKey, key)
  return key
}
