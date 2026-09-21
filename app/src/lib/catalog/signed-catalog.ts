import "server-only"

import { createHash, createPublicKey, verify } from "node:crypto"

import { GREEN_CATALOG_MANIFEST, validateGreenCatalogManifest } from "./catalog-manifest"
import { GREEN_CATALOG_PUBLIC_KEY, GREEN_CATALOG_SIGNATURE } from "./catalog-signature"
import type { GreenCatalogVerification } from "@mashups/contracts"

export function verifyGreenCatalog(): GreenCatalogVerification {
  const payload = Buffer.from(JSON.stringify(GREEN_CATALOG_MANIFEST))
  const digest = createHash("sha256").update(payload).digest("hex")
  const shape = validateGreenCatalogManifest(GREEN_CATALOG_MANIFEST)
  if (!shape.valid) return { verified: false, algorithm: "Ed25519", catalogVersion: GREEN_CATALOG_MANIFEST.catalogVersion, digest, reason: shape.reasons.join(" ") }
  try {
    const verified = verify(null, payload, createPublicKey(GREEN_CATALOG_PUBLIC_KEY), Buffer.from(GREEN_CATALOG_SIGNATURE, "base64"))
    return { verified, algorithm: "Ed25519", catalogVersion: GREEN_CATALOG_MANIFEST.catalogVersion, digest, reason: verified ? undefined : "Detached catalog signature does not match." }
  } catch {
    return { verified: false, algorithm: "Ed25519", catalogVersion: GREEN_CATALOG_MANIFEST.catalogVersion, digest, reason: "Catalog signature could not be verified." }
  }
}
