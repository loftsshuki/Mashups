import { createClient } from "@/lib/supabase/server"

export default async function LicenseVerificationPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from("creator_licenses")
    .select("*")
    .eq("verification_code", code)
    .single()

  const isValid = Boolean(data && data.status === "active")

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
        <p className={`mt-1 text-sm font-medium ${isValid ? "text-green-500" : "text-destructive"}`}>
          {isValid ? "VALID" : "NOT VALID"}
        </p>

        {data && (
          <>
            <p className="mt-4 text-sm text-muted-foreground">License type</p>
            <p className="mt-1 text-sm text-foreground">{data.license_type}</p>

            <p className="mt-4 text-sm text-muted-foreground">Territory</p>
            <p className="mt-1 text-sm text-foreground">{data.territory}</p>

            <p className="mt-4 text-sm text-muted-foreground">Active window</p>
            <p className="mt-1 text-sm text-foreground">
              {new Date(data.starts_at).toLocaleDateString()} - {new Date(data.ends_at).toLocaleDateString()}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
