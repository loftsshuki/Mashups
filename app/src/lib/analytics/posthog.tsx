"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react"
import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

// Initialize PostHog (client-side only)
if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_POSTHOG_KEY
) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: false, // We capture manually for SPA navigation
    capture_pageleave: true,
  })
}

/**
 * PostHog provider — wraps the app to enable analytics.
 * Only active when NEXT_PUBLIC_POSTHOG_KEY is set.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}

/**
 * Captures page views on SPA navigation.
 * Place inside PostHogProvider in the layout.
 */
export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const ph = usePostHog()

  useEffect(() => {
    if (pathname && ph) {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url += "?" + searchParams.toString()
      }
      ph.capture("$pageview", { $current_url: url })
    }
  }, [pathname, searchParams, ph])

  return null
}

/**
 * Track custom events from anywhere in the app.
 */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture(event, properties)
  }
}

/**
 * Identify a user after login.
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>,
) {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.identify(userId, properties)
  }
}
