"use client"

import { useState } from "react"
import { Check, FileSignature, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"

export function LicenseAcceptance({ agreementId, initialStatus, demo }: { agreementId: string; initialStatus: string; demo: boolean }) {
  const [attested, setAttested] = useState(false)
  const [status, setStatus] = useState(initialStatus)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function accept() {
    if (!attested) return
    setPending(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/domination/license/accept${demo ? "?demo=1" : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agreementId, attested: true }),
      })
      const result = await response.json() as { error?: string; status?: string; verificationCode?: string }
      if (!response.ok) throw new Error(result.error ?? "Unable to accept the agreement.")
      setStatus("accepted")
      setMessage(`Accepted and sealed${result.verificationCode ? ` as ${result.verificationCode}` : ""}.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to accept the agreement.")
    } finally {
      setPending(false)
    }
  }

  if (status === "accepted") return <div className="border border-foreground bg-secondary p-5"><p className="flex items-center gap-3 font-semibold"><span className="grid size-8 place-items-center bg-foreground text-background"><Check className="size-4" /></span>License accepted and immutable terms snapshot sealed.</p>{message ? <p role="status" className="mt-3 text-sm">{message}</p> : null}</div>

  return <div className="border border-foreground bg-card p-5 shadow-[6px_6px_0_var(--foreground)] sm:p-6">
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
      <input type="checkbox" checked={attested} onChange={(event) => setAttested(event.target.checked)} className="mt-1 size-5 accent-[var(--primary)]" />
      <span>I attest that I am authorized to bind the listed rightsholder and accept the exact rights, limits, economics, term, and takedown process shown here.</span>
    </label>
    <Button className="mt-5 w-full" disabled={!attested || pending} onClick={() => void accept()}>{pending ? <RefreshCw className="animate-spin" /> : <FileSignature />}Accept and seal license</Button>
    {message ? <p role="status" className="mt-4 border border-foreground p-3 text-sm">{message}</p> : null}
  </div>
}
