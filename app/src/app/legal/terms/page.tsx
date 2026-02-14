import type { Metadata } from "next"
import { LegalDocPage } from "@/components/legal/legal-doc-page"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using Mashups.",
}

export default function TermsPage() {
  return (
    <LegalDocPage
      title="Terms of Service"
      description="The rules and conditions for using Mashups."
      fileName="TERMS.md"
    />
  )
}
