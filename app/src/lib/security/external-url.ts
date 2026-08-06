import { isIP } from "node:net"

function isPrivateIp(hostname: string): boolean {
  if (!isIP(hostname)) return false
  return (
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("169.254.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
    hostname.startsWith("fc") ||
    hostname.startsWith("fd") ||
    hostname.startsWith("fe80:")
  )
}

export function parseExternalHttpUrl(value: string): URL | null {
  try {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase()
    if (url.protocol !== "https:" && url.protocol !== "http:") return null
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      isPrivateIp(hostname)
    ) {
      return null
    }
    return url
  } catch {
    return null
  }
}
