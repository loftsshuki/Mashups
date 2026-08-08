"use client"

import { useReportWebVitals } from "next/web-vitals"

import { trackEvent } from "@/lib/analytics/posthog"

export function WebVitals() {
  useReportWebVitals((metric) => {
    trackEvent("web_vital", {
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      navigation_type: metric.navigationType,
    })
  })

  return null
}
