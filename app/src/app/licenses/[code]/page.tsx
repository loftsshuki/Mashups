import Link from "next/link"

import {
  getLicenseVerificationForCode,
  type LicenseVerificationState,
} from "@/lib/licenses/verification"

const stateMetadata: Record<
  LicenseVerificationState,
  { label: string; className: string; hint: string }
> = {
  valid: {
    label: "VALID",
    className: "text-emerald-500",
    hint: "License is active for creator-safe short-form usage.",
  },
  expired: {
    label: "EXPIRED",
    className: "text-amber-500",
    hint: "License term ended and must be renewed before use.",
  },
  revoked: {
    label: "REVOKED",
    className: "text-destructive",
    hint: "License has been revoked and is not valid for distribution.",
  },
  not_found: {
    label: "NOT FOUND",
    className: "text-destructive",
    hint: "No license record matched this verification code.",
  },
}

export default async function LicenseVerificationPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const verification = await getLicenseVerificationForCode(code).catch(() => null)
  const payload = verification?.payload ?? null
  const state = payload?.state ?? "not_found"
  const statusView = stateMetadata[state]
  const hasLicense = payload && payload.state !== "not_found"

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">License Verification</h1>
      <p className="mt-2 text-muted-foreground">
        Public verification page for creator-safe social usage licenses.
      </p>

      <div className="mt-6 rounded-lg border border-border/50 bg-card p-5">
        <p className="text-sm text-muted-foreground">Verification code</p>
        <p className="mt-1 font-mono text-sm text-foreground">{code}</p>

        <p className="mt-4 text-sm text-muted-foreground">Status</p>
        <p className={`mt-1 text-sm font-medium ${statusView.className}`}>
          {statusView.label}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{statusView.hint}</p>

        {hasLicense ? (
          <>
            <p className="mt-4 text-sm text-muted-foreground">License type</p>
            <p className="mt-1 text-sm text-foreground">{payload.licenseType}</p>

            <p className="mt-4 text-sm text-muted-foreground">Territory</p>
            <p className="mt-1 text-sm text-foreground">{payload.territory}</p>

            <p className="mt-4 text-sm text-muted-foreground">Active window</p>
            <p className="mt-1 text-sm text-foreground">
              {payload.startsAt ? new Date(payload.startsAt).toLocaleDateString() : "Unknown"}{" "}
              - {payload.endsAt ? new Date(payload.endsAt).toLocaleDateString() : "Unknown"}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={`/api/licenses/verify/${code}`}
                className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                View Signed Verification JSON
              </Link>
              <Link
                href={`/api/licenses/certificate/${code}`}
                className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                Download Certificate JSON
              </Link>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Use these signed artifacts in claims/disputes as tamper-evident proof.
            </p>
          </>
        ) : null}

        {!verification ? (
          <p className="mt-4 text-xs text-destructive">
            Verification service is temporarily unavailable.
          </p>
        ) : null}
      </div>
    </div>
  )
}
