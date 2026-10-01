type StorageLike = Pick<Storage, "getItem" | "setItem">

const VISITOR_KEY = "mashups.green.visitor.v1"
const LEGACY_VISITOR_KEY = "mashups.green.session.v1"
const ACTIVITY_KEY = "mashups.green.activity.v1"
export const GREEN_SESSION_IDLE_MS = 30 * 60 * 1000

export function createAnalyticsId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  // Analytics identifiers are not authentication or authorization credentials.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const value = Math.floor(Math.random() * 16)
    return (character === "x" ? value : (value & 3) | 8).toString(16)
  })
}

export function createGreenSessionManager(input: {
  visitorStorage?: StorageLike
  sessionStorage?: StorageLike
  makeId?: () => string
}) {
  const makeId = input.makeId ?? createAnalyticsId
  let visitorId: string | undefined
  let activity: { id: string; lastActiveAt: number } | undefined

  function read(storage: StorageLike | undefined, key: string) {
    try { return storage?.getItem(key) ?? null } catch { return null }
  }

  function write(storage: StorageLike | undefined, key: string, value: string) {
    try { storage?.setItem(key, value) } catch { /* Keep working with in-memory identity. */ }
  }

  return {
    getIdentity(now = Date.now()) {
      if (!visitorId) {
        const stored = read(input.visitorStorage, VISITOR_KEY) ?? read(input.visitorStorage, LEGACY_VISITOR_KEY)
        visitorId = stored && stored.length >= 8 && stored.length <= 120 ? stored : makeId()
        write(input.visitorStorage, VISITOR_KEY, visitorId)
      }
      if (!activity) {
        try {
          const stored = JSON.parse(read(input.sessionStorage, ACTIVITY_KEY) ?? "null")
          if (stored && typeof stored.id === "string" && stored.id.length >= 8 && stored.id.length <= 120 && Number.isFinite(stored.lastActiveAt)) {
            activity = { id: stored.id, lastActiveAt: stored.lastActiveAt }
          }
        } catch { /* Malformed or blocked storage starts a new session. */ }
      }
      if (!activity || now < activity.lastActiveAt || now - activity.lastActiveAt >= GREEN_SESSION_IDLE_MS) {
        activity = { id: makeId(), lastActiveAt: now }
      }
      activity.lastActiveAt = now
      write(input.sessionStorage, ACTIVITY_KEY, JSON.stringify(activity))
      return { visitorId, sessionId: activity.id }
    },
  }
}
