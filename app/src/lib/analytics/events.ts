import { trackEvent } from "@/lib/analytics/posthog"

export const PRODUCT_EVENTS = {
  campaignStarted: "campaign_started",
  trackAdded: "campaign_track_added",
  hookSelected: "campaign_hook_selected",
  rightsConfirmed: "campaign_rights_confirmed",
  packageExported: "campaign_package_exported",
  briefViewed: "campaign_brief_viewed",
  challengeJoined: "challenge_joined",
  pricingViewed: "pricing_viewed",
  integrationChecked: "integration_checked",
} as const

export type ProductEvent = (typeof PRODUCT_EVENTS)[keyof typeof PRODUCT_EVENTS]

export function trackProductEvent(
  event: ProductEvent,
  properties: Record<string, string | number | boolean | null> = {},
) {
  trackEvent(event, { schema_version: 1, ...properties })
}
