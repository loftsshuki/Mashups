import type { Metadata } from "next"
import { LegalDocPage } from "@/components/legal/legal-doc-page"

export const metadata: Metadata = {
  title: "Copyright Policy",
  description: "Mashups copyright and DMCA policy.",
}

export default function CopyrightPolicyPage() {
  return (
    <LegalDocPage
      title="Copyright Policy"
      description="How Mashups handles copyright notices and counter-notices."
      fileName="COPYRIGHT_POLICY.md"
    />
  )
}
