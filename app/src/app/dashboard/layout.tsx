import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your mashups, analytics, rights, and monetization.",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
