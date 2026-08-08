import type { OutreachProspect, OutreachStage, ProspectType } from "@/lib/pilot/types"

const prospectTypes: ProspectType[] = ["label", "distributor", "artist_manager", "venue", "creator_agency", "artist"]
const outreachStages: OutreachStage[] = ["research", "qualified", "contacted", "replied", "meeting", "pilot", "won", "lost"]

export function prospectsToCsv(prospects: OutreachProspect[]): string {
  const header = ["entity_name", "entity_type", "contact_name", "contact_email", "city", "country_code", "genres", "priority", "stage", "catalog_signal", "next_action", "due_at", "source_url", "notes"]
  const lines = prospects.map((row) => [row.entityName, row.entityType, row.contactName, row.contactEmail, row.city, row.countryCode, row.genres.join(" | "), row.priority, row.stage, row.catalogSignal, row.nextAction, row.dueAt, row.sourceUrl, row.notes].map(csvCell).join(","))
  return [header.join(","), ...lines].join("\r\n")
}

export function parseProspectsCsv(csv: string, importedAt = new Date().toISOString()): { prospects: OutreachProspect[]; rejectedRows: number } {
  const rows = parseCsvRows(csv)
  if (rows.length < 2) return { prospects: [], rejectedRows: 0 }
  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, "").trim().toLowerCase())
  const index = Object.fromEntries(headers.map((header, position) => [header, position]))
  const prospects: OutreachProspect[] = []
  let rejectedRows = 0
  rows.slice(1, 501).forEach((row, rowIndex) => {
    const entityName = cell(row, index.entity_name)
    if (!entityName) { rejectedRows += 1; return }
    const rawType = cell(row, index.entity_type) as ProspectType
    const rawStage = cell(row, index.stage) as OutreachStage
    const genres = cell(row, index.genres).split(/\s*[|;]\s*/).map((genre) => genre.trim()).filter(Boolean)
    prospects.push({
      id: `import-${importedAt.replace(/\D/g, "").slice(0, 14)}-${rowIndex + 1}`,
      entityName,
      entityType: prospectTypes.includes(rawType) ? rawType : "label",
      contactName: nullable(cell(row, index.contact_name)), contactEmail: nullable(cell(row, index.contact_email)), city: nullable(cell(row, index.city)), countryCode: nullable(cell(row, index.country_code).toUpperCase()),
      genres, catalogSignal: nullable(cell(row, index.catalog_signal)), priority: clamp(Number(cell(row, index.priority) || 3), 1, 5), stage: outreachStages.includes(rawStage) ? rawStage : "research",
      nextAction: nullable(cell(row, index.next_action)), dueAt: nullable(cell(row, index.due_at)), sourceUrl: nullable(cell(row, index.source_url)), notes: nullable(cell(row, index.notes)),
    })
  })
  return { prospects, rejectedRows }
}

function csvCell(value: unknown): string {
  const source = value == null ? "" : String(value)
  const text = /^[=+\-@]/.test(source.trimStart()) ? `'${source}` : source
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []; let value = ""; let quoted = false
  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index]
    if (char === '"' && quoted && csv[index + 1] === '"') { value += '"'; index += 1 }
    else if (char === '"') quoted = !quoted
    else if (char === "," && !quoted) { row.push(value); value = "" }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && csv[index + 1] === "\n") index += 1
      row.push(value); if (row.some(Boolean)) rows.push(row); row = []; value = ""
    } else value += char
  }
  row.push(value); if (row.some(Boolean)) rows.push(row)
  return rows
}

function cell(row: string[], index: number | undefined): string { return index == null ? "" : (row[index] ?? "").trim() }
function nullable(value: string): string | null { return value || null }
function clamp(value: number, minimum: number, maximum: number): number { return Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, Math.round(value))) : minimum }
