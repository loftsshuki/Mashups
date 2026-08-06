"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [serviceError, setServiceError] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        if (!user) {
          router.push("/login")
        } else {
          setIsAuthenticated(true)
        }
      } catch {
        setServiceError(true)
      } finally {
        setIsLoading(false)
      }
    }

    void checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    if (serviceError) {
      return (
        <div className="mx-auto grid min-h-[55vh] max-w-xl place-items-center px-4 text-center">
          <div className="border border-foreground bg-card p-8 shadow-[6px_6px_0_var(--foreground)]">
            <AlertTriangle className="mx-auto size-8 text-primary" />
            <h2 className="display-type mt-5 text-3xl">The live backend is offline.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Authentication could not be verified. Production writes remain disabled instead of falling back to sample data.
            </p>
            <Button className="mt-6" asChild><Link href="/campaigns/new?demo=1">Open labeled demo</Link></Button>
          </div>
        </div>
      )
    }
    return null
  }

  return <>{children}</>
}
