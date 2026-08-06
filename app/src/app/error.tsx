"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[UI] Unhandled route error:", error)
  }, [error])

  return (
    <div className="mx-auto grid min-h-[75vh] max-w-[1440px] place-items-center px-4 pb-20 pt-28">
      <div className="w-full max-w-3xl border border-foreground bg-card p-6 shadow-[8px_8px_0_var(--foreground)] sm:p-10">
        <p className="signal-label">Signal interrupted</p>
        <h1 className="display-type mt-6 text-5xl leading-[0.86] sm:text-7xl">The session hit a bad cut.</h1>
        <p className="mt-6 max-w-xl text-muted-foreground">
          Your source work has not been intentionally removed. Retry this route, or return to the workspace and start from the last saved state.
        </p>
        {error.digest ? <p className="mt-4 font-mono text-[10px] text-muted-foreground">REF / {error.digest}</p> : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={reset}><RotateCcw />Retry</Button>
          <Button variant="outline" asChild><Link href="/dashboard"><ArrowLeft />Workspace</Link></Button>
        </div>
      </div>
    </div>
  )
}
