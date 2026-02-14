import type { Metadata } from "next"
import { LegalDocPage } from "@/components/legal/legal-doc-page"

export const metadata: Metadata = {
  title: "Repeat Infringer Policy",
  description: "Mashups repeat infringer policy for copyright violations.",
}

export default function RepeatInfringerPolicyPage() {
  return (
    <LegalDocPage
      title="Repeat Infringer Policy"
      description="How repeated copyright violations are tracked and enforced."
      fileName="REPEAT_INFRINGER_POLICY.md"
    />
  )
}
