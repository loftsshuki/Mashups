import "server-only"

export function toSpotifyUri(value: string): string {
  const trimmed = value.trim()
  if (/^spotify:(track|album|playlist):[A-Za-z0-9]+$/.test(trimmed)) return trimmed
  const match = trimmed.match(/^https:\/\/open\.spotify\.com\/(track|album|playlist)\/([A-Za-z0-9]+)/)
  if (!match) throw new Error("Invalid Spotify track, album, or playlist identifier.")
  return `spotify:${match[1]}:${match[2]}`
}

export async function saveSpotifyItem(accessToken: string, uri: string): Promise<void> {
  const response = await fetch(`https://api.spotify.com/v1/me/library?uris=${encodeURIComponent(toSpotifyUri(uri))}`, {
    method: "PUT", headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store",
  })
  if (!response.ok) throw new Error(`Spotify save failed with status ${response.status}.`)
}
