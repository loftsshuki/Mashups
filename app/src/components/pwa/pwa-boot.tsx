"use client"

import { useEffect, useState } from "react"
import { Download, WifiOff, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { trackGreenEvent } from "@/lib/analytics/green-room"

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> }

export function PwaBoot() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)
  const [online, setOnline] = useState(true)
  useEffect(() => {
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js", { scope: "/" })
    const onlineSyncTimer = window.setTimeout(() => setOnline(navigator.onLine), 0)
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
    const iosHintTimer = isIos && !isStandalone && window.localStorage.getItem("mashups.pwa.ios-dismissed") !== "1"
      ? window.setTimeout(() => setShowIosHint(true), 0)
      : null
    const handlePrompt = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPromptEvent) }
    const handleInstalled = () => { setPrompt(null); setShowIosHint(false); trackGreenEvent("pwa_installed", { platform: isIos ? "ios" : "other" }) }
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener("beforeinstallprompt", handlePrompt)
    window.addEventListener("appinstalled", handleInstalled)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt)
      window.removeEventListener("appinstalled", handleInstalled)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.clearTimeout(onlineSyncTimer)
      if (iosHintTimer) window.clearTimeout(iosHintTimer)
    }
  }, [])
  if (!prompt && !showIosHint && online) return null
  async function install() { if (!prompt) return; await prompt.prompt(); await prompt.userChoice; setPrompt(null) }
  function dismiss() { setPrompt(null); setShowIosHint(false); window.localStorage.setItem("mashups.pwa.ios-dismissed", "1") }
  return <aside className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-lg items-center gap-3 border border-foreground bg-secondary p-3 shadow-[5px_5px_0_var(--foreground)] sm:inset-x-auto sm:right-5" aria-label={online ? "Install Mashups" : "Mashups offline"} aria-live="polite"><div className="min-w-0 flex-1"><p className="flex items-center gap-2 font-semibold">{online ? "Put Mashups on your home screen" : <><WifiOff className="size-4" />Offline shell active</>}</p><p className="text-xs text-muted-foreground">{!online ? "Public screens remain available. Audio rendering and protected assets wait for a connection." : showIosHint ? "On iPhone: tap Share, then Add to Home Screen." : "Full-screen Green Room. Same rights-safe catalog."}</p></div>{prompt && online ? <Button size="sm" onClick={() => void install()}><Download />Install</Button> : null}{online ? <button type="button" className="grid size-8 place-items-center" aria-label="Dismiss install prompt" onClick={dismiss}><X className="size-4" /></button> : null}</aside>
}
