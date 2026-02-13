export function getAdminEmailAllowlist(): string[] {
  const raw = process.env.ADMIN_EMAIL_ALLOWLIST ?? ""
  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  const allowlist = getAdminEmailAllowlist()
  return allowlist.includes(email.toLowerCase())
}
