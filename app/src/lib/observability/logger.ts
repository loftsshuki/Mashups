type LogLevel = "info" | "warn" | "error"

export function logServerEvent(
  level: LogLevel,
  event: string,
  properties: Record<string, unknown> = {},
) {
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...properties,
  })

  if (level === "error") console.error(payload)
  else if (level === "warn") console.warn(payload)
  else console.info(payload)
}
