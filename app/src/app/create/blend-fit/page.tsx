import type { Metadata } from "next"
import Link from "next/link"
import { BlendFitWorkbench } from "@/components/create/blend-fit-workbench"

export const metadata: Metadata = { title: "Blend Fit — Check your mashup ingredients", description: "Check tempo and tonal evidence in your vocal and backing sections, privately on your device." }

export default function BlendFitPage() {
  return <div className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-28 sm:px-6">
    <Link className="text-sm underline underline-offset-4" href="/create">← Back to creation</Link>
    <h1 className="display-type mb-8 mt-6 text-4xl sm:text-6xl">DO THESE INGREDIENTS FIT?</h1>
    <BlendFitWorkbench />
  </div>
}
