import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type NeonPageProps = {
  children: ReactNode
  className?: string
}

type NeonHeroProps = {
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
  aside?: ReactNode
}

type NeonSectionHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function NeonPage({ children, className }: NeonPageProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-[1400px] px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function NeonHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
}: NeonHeroProps) {
  return (
    <section className="mb-8 grid gap-4 border-b border-border/70 pb-8 lg:grid-cols-5">
      <div className={cn("lg:col-span-3", aside ? "" : "lg:col-span-5")}>
        {eyebrow ? (
          <p className="section-label text-primary mb-3">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-[family-name:var(--font-editorial)] text-3xl tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
          {description}
        </p>
        {actions ? <div className="mt-5 flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {aside ? (
        <div className="lg:col-span-2">
          <div className="rounded-2xl p-4">{aside}</div>
        </div>
      ) : null}
    </section>
  )
}

export function NeonSectionHeader({
  title,
  description,
  action,
}: NeonSectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-[family-name:var(--font-editorial)] text-xl tracking-tight text-foreground md:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

export function NeonGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn("grid gap-4", className)}>{children}</div>
}

