import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[75vh] max-w-[1440px] place-items-center px-4 pb-20 pt-28">
      <div className="relative w-full max-w-4xl overflow-hidden border border-foreground bg-secondary p-6 text-secondary-foreground shadow-[10px_10px_0_var(--foreground)] sm:p-12">
        <span className="display-type absolute -right-4 -top-12 text-[12rem] leading-none opacity-10 sm:text-[18rem]">404</span>
        <p className="mono-label">Missing frequency</p>
        <h1 className="display-type relative mt-7 max-w-3xl text-6xl leading-[0.82] sm:text-8xl">This track left the timeline.</h1>
        <p className="relative mt-7 max-w-xl text-lg">The link may be stale, private, or mistyped. Search the catalog or get back to the live signal.</p>
        <div className="relative mt-9 flex flex-wrap gap-3">
          <Button asChild><Link href="/explore"><Search />Search catalog</Link></Button>
          <Button variant="outline" asChild><Link href="/"><ArrowLeft />Home</Link></Button>
        </div>
      </div>
    </div>
  )
}
