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

export function getAdminIdAllowlist(): string[] {
  const raw = process.env.ADMIN_USER_ID_ALLOWLIST ?? ""
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
}

export function isAdminUser(input: { email?: string | null; id?: string | null }): boolean {
  const emailAllowed = isAdminEmail(input.email)
  if (emailAllowed) return true

  if (!input.id) return false
  const idAllowlist = getAdminIdAllowlist()
  return idAllowlist.includes(input.id)
}
