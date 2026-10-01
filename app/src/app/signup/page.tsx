import { AuthForm } from "@/components/auth/auth-form"
import { safeReturnPath } from "@/lib/auth/return-path"

export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  return <AuthForm mode="signup" next={safeReturnPath(params.next)} />
}
