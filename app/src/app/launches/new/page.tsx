import type { Metadata } from "next"
import { Suspense } from "react"

import { LaunchBuilder } from "@/components/viral/launch-builder"

export const metadata: Metadata = { title: "Build Viral Launch", description: "Configure a test-to-blast music launch with template genomes, creator squads, bounties, unlocks, and artist commitments.", alternates: { canonical: "/launches/new" } }

export default function NewLaunchPage() { return <Suspense fallback={<div className="min-h-screen pt-28" />}><LaunchBuilder /></Suspense> }
