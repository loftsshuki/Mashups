import { readFile } from "node:fs/promises"
import path from "node:path"

interface LegalDocPageProps {
  title: string
  description: string
  fileName: string
}

export async function LegalDocPage({
  title,
  description,
  fileName,
}: LegalDocPageProps) {
  const filePath = path.join(process.cwd(), "legal", fileName)
  const content = await readFile(filePath, "utf8")

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </header>
      <article className="rounded-lg border border-border/50 bg-card p-5 sm:p-6">
        <pre className="whitespace-pre-wrap text-sm leading-6 text-foreground font-sans">
          {content}
        </pre>
      </article>
    </div>
  )
}
