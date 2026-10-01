import type { Metadata } from "next"

export const metadata: Metadata = { title: "Start free", description: "Create your Mashups account and keep your mixes together.", alternates: { canonical: "/signup" } }
export default function SignupLayout({ children }: { children: React.ReactNode }) { return children }
