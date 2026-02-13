export const MASHUPS_SIGNATURE = "Made with Mashups.com"

export function withMashupsSignature(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return MASHUPS_SIGNATURE
  if (trimmed.includes(MASHUPS_SIGNATURE)) return trimmed
  return `${trimmed}\n\n${MASHUPS_SIGNATURE}`
}

export function addSignatureParams(url: string): string {
  try {
    const target = new URL(url)
    target.searchParams.set("utm_source", "mashups_signature")
    target.searchParams.set("utm_medium", "creator_share")
    target.searchParams.set("utm_campaign", "viral_signature_loop")
    return target.toString()
  } catch {
    return url
  }
}
