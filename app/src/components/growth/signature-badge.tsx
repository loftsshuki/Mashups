import { cn } from "@/lib/utils"

interface SignatureBadgeProps {
  className?: string
}

export function SignatureBadge({ className }: SignatureBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary",
        className,
      )}
    >
      Made with Mashups.com
    </span>
  )
}
