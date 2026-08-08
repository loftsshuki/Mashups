import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type NeonPageProps = { children: ReactNode; className?: string }
type NeonHeroProps = {
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
  aside?: ReactNode
}
type NeonSectionHeaderProps = { title: string; description?: string; action?: ReactNode }

// Export names are retained for compatibility; the visual language is now editorial.
export function NeonPage({ children, className }: NeonPageProps) {
  return (
    <div className={cn("neon-page mx-auto max-w-[1440px] px-4 pb-28 pt-28 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  )
}

export function NeonHero({ eyebrow, title, description, actions, aside }: NeonHeroProps) {
  return (
    <section className="relative mb-12 grid gap-8 border-b border-foreground pb-10 lg:grid-cols-12 lg:items-end">
      <div className={aside ? "lg:col-span-8" : "lg:col-span-12"}>
        {eyebrow ? <p className="signal-label mb-5">{eyebrow}</p> : null}
        <h1 className="display-type max-w-5xl text-4xl leading-[0.92] text-foreground sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
        {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      {aside ? <div className="neon-panel p-5 lg:col-span-4">{aside}</div> : null}
    </section>
  )
}

export function NeonSectionHeader({ title, description, action }: NeonSectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-t border-foreground pt-4">
      <div>
        <h2 className="display-type text-2xl leading-none md:text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function NeonGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-4", className)}>{children}</div>
}

