import manifest from "../../../public/catalog/green-pilot.v1.json"

import type { GreenStaticCatalog } from "@mashups/contracts"

export const GREEN_CATALOG_MANIFEST = manifest as GreenStaticCatalog

export function validateGreenCatalogManifest(catalog: GreenStaticCatalog) {
  const reasons: string[] = []
  if (catalog.schemaVersion !== "mashups.green-catalog.v1") reasons.push("Unsupported catalog schema.")
  if (catalog.rightsMode !== "closed-green-room") reasons.push("Catalog rights mode is not closed.")
  if (!catalog.outputs.includes("in-app-playback")) reasons.push("In-app playback permission is missing.")
  if (catalog.outputs.some((output) => !["in-app-playback", "watermarked-video-15", "watermarked-video-30"].includes(output))) reasons.push("Catalog grants an unsupported output.")
  const ids = new Set<string>()
  for (const track of catalog.tracks) {
    if (ids.has(track.id)) reasons.push(`Duplicate track ID: ${track.id}.`)
    ids.add(track.id)
    if (!track.masterController || !track.compositionController) reasons.push(`${track.id} lacks one-stop control metadata.`)
    if (!track.stemExtraction || !track.crossTrackDerivatives || !track.inAppPlayback) reasons.push(`${track.id} lacks a required creation grant.`)
    if (track.standaloneAudioExport) reasons.push(`${track.id} improperly grants standalone audio export.`)
    if (track.pairingAllowlist.includes(track.id)) reasons.push(`${track.id} cannot pair with itself.`)
  }
  for (const track of catalog.tracks) {
    for (const pairId of track.pairingAllowlist) if (!ids.has(pairId)) reasons.push(`${track.id} references unknown pair ${pairId}.`)
  }
  return { valid: reasons.length === 0, reasons }
}
