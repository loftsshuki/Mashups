// Daily.co REST API — create and manage voice chat rooms

const DAILY_API_BASE = "https://api.daily.co/v1"

interface DailyRoom {
  url: string
  name: string
}

/**
 * Create a Daily.co room for voice chat.
 * Rooms auto-expire after 1 hour of inactivity.
 */
export async function createDailyRoom(name: string): Promise<DailyRoom> {
  const apiKey = process.env.DAILY_API_KEY
  if (!apiKey) throw new Error("DAILY_API_KEY not configured")

  const response = await fetch(`${DAILY_API_BASE}/rooms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name.slice(0, 40).replace(/[^a-zA-Z0-9-]/g, "-"),
      properties: {
        exp: Math.floor(Date.now() / 1000) + 3600, // expires in 1 hour
        enable_chat: true,
        enable_knocking: false,
        max_participants: 10,
        autojoin: true,
      },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error")
    throw new Error(`Daily.co API error ${response.status}: ${errorBody}`)
  }

  const data = await response.json()
  return { url: data.url, name: data.name }
}

/**
 * Delete a Daily.co room by name.
 */
export async function deleteDailyRoom(name: string): Promise<boolean> {
  const apiKey = process.env.DAILY_API_KEY
  if (!apiKey) return false

  const response = await fetch(`${DAILY_API_BASE}/rooms/${name}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  return response.ok
}
