import { AuthForm } from "@/components/auth/auth-form"
import { safeReturnPath } from "@/lib/auth/return-path"

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  return <AuthForm mode="login" next={safeReturnPath(params.next)} callbackFailed={params.error === "callback_failed"} />
}
