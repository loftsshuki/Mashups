import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/settings",
        "/dashboard/",
        "/campaigns/",
        "/create/ai",
        "/extract",
        "/tools/",
        "/operator",
        "/outreach",
        "/readiness",
        "/domination",
        "/network",
        "/supply",
        "/exchange",
        "/launches/new",
      ],
    },
    sitemap: "https://www.mashups.agency/sitemap.xml",
    host: "https://www.mashups.agency",
  }
}
