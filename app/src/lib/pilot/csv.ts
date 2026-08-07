import type { OutreachProspect } from "@/lib/pilot/types"

export function prospectsToCsv(prospects: OutreachProspect[]): string {
  const header = ["entity_name", "entity_type", "contact_name", "contact_email", "city", "country_code", "genres", "priority", "stage", "catalog_signal", "next_action", "due_at", "source_url", "notes"]
  const lines = prospects.map((row) => [row.entityName, row.entityType, row.contactName, row.contactEmail, row.city, row.countryCode, row.genres.join(" | "), row.priority, row.stage, row.catalogSignal, row.nextAction, row.dueAt, row.sourceUrl, row.notes].map(csvCell).join(","))
  return [header.join(","), ...lines].join("\r\n")
}

function csvCell(value: unknown): string {
  const text = value == null ? "" : String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
