import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Mashups account and start creating mashups.",
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
