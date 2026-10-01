import Link from "next/link"
import { RefreshCw, WifiOff } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  return <div className="grid min-h-[75vh] place-items-center px-4 py-28"><section className="max-w-3xl border border-foreground bg-secondary p-7 shadow-[8px_8px_0_var(--foreground)] sm:p-12"><WifiOff className="size-8 text-primary" /><p className="mono-label mt-9">Connection paused / public shell only</p><h1 className="display-type mt-4 text-6xl leading-[0.82] sm:text-8xl">THE DECK<br />STAYS PUT.</h1><p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Mashups never caches protected masters, private rights records, API responses, or generated audio. Reconnect before rendering or sharing a version.</p><div className="mt-8 flex flex-wrap gap-3"><Button asChild><Link href="/create"><RefreshCw />Try the Green Room</Link></Button><Button variant="outline" asChild><Link href="/discover">Browse cached pairings</Link></Button></div></section></div>
}
