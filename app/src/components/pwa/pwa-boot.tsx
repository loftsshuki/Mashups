"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"

import { Button } from "@/components/ui/button"

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> }

export function PwaBoot() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)
  useEffect(() => {
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js", { scope: "/" })
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
    const iosHintTimer = isIos && !isStandalone && window.localStorage.getItem("mashups.pwa.ios-dismissed") !== "1"
      ? window.setTimeout(() => setShowIosHint(true), 0)
      : null
    const handlePrompt = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPromptEvent) }
    window.addEventListener("beforeinstallprompt", handlePrompt)
    return () => { window.removeEventListener("beforeinstallprompt", handlePrompt); if (iosHintTimer) window.clearTimeout(iosHintTimer) }
  }, [])
  if (!prompt && !showIosHint) return null
  async function install() { if (!prompt) return; await prompt.prompt(); await prompt.userChoice; setPrompt(null) }
  function dismiss() { setPrompt(null); setShowIosHint(false); window.localStorage.setItem("mashups.pwa.ios-dismissed", "1") }
  return <aside className="fixed inset-x-3 bottom-20 z-50 mx-auto flex max-w-lg items-center gap-3 border border-foreground bg-secondary p-3 shadow-[5px_5px_0_var(--foreground)] sm:inset-x-auto sm:right-5" aria-label="Install Mashups"><div className="min-w-0 flex-1"><p className="font-semibold">Put Mashups on your home screen</p><p className="text-xs text-muted-foreground">{showIosHint ? "On iPhone: tap Share, then Add to Home Screen." : "Full-screen Green Room. Same rights-safe catalog."}</p></div>{prompt ? <Button size="sm" onClick={() => void install()}><Download />Install</Button> : null}<button type="button" className="grid size-8 place-items-center" aria-label="Dismiss install prompt" onClick={dismiss}><X className="size-4" /></button></aside>
}
