import Link from "next/link"
import { ArrowUpRight, Headphones, Heart, Music2, Video } from "lucide-react"

export function AuthShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  const steps = [
    { icon: Music2, label: "Choose two cleared songs" },
    { icon: Headphones, label: "Hear three different arrangements" },
    { icon: Heart, label: "Keep the version that moves you" },
    { icon: Video, label: "Make an attributed clip" },
  ]
  return <div className="min-h-screen pt-[68px]">
    <div className="grid min-h-[calc(100vh-68px)] lg:grid-cols-[0.92fr_1.08fr]">
      <aside className="relative hidden overflow-hidden border-r border-foreground bg-foreground p-10 text-background lg:block xl:p-14">
        <div className="editorial-grid absolute inset-0 opacity-[0.08]" />
        <div className="relative flex h-full flex-col">
          <Link href="/" className="inline-flex items-center gap-3 self-start"><span className="grid size-10 place-items-center border border-background bg-primary font-mono font-bold text-primary-foreground">M/</span><span className="display-type text-xl">Mashups</span></Link>
          <div className="my-auto py-16">
            <p className="mono-label text-background/50">For the love of the mix</p>
            <h2 className="display-type mt-5 max-w-xl text-5xl leading-[0.86] xl:text-7xl">Two songs.<br /><span className="text-secondary">Your next favorite.</span></h2>
            <div className="mt-9 max-w-xl border border-background/35">{steps.map(({ icon: Icon, label }, index) => <div key={label} className="flex items-center gap-4 border-b border-background/35 p-4 last:border-b-0"><span className="font-mono text-xs text-background/45">0{index + 1}</span><Icon className="size-4 text-primary" /><span className="text-sm">{label}</span></div>)}</div>
          </div>
          <Link href="/create" className="inline-flex items-center gap-2 self-start border-b border-secondary pb-1 font-mono text-xs uppercase tracking-wider text-secondary">Explore without an account<ArrowUpRight className="size-4" /></Link>
        </div>
      </aside>
      <div className="grid place-items-center bg-background px-4 py-10 sm:px-8 lg:py-14">
        <div className="w-full max-w-xl"><p className="signal-label">{eyebrow}</p><h1 className="display-type mt-5 text-5xl leading-[0.9] sm:text-6xl">{title}</h1><p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">{description}</p><div className="mt-9 border border-foreground bg-card p-5 shadow-[6px_6px_0_var(--foreground)] sm:p-7">{children}</div></div>
      </div>
    </div>
  </div>
}
