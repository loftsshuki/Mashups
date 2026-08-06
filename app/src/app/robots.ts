import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/settings", "/dashboard/"],
    },
    sitemap: "https://www.mashups.agency/sitemap.xml",
    host: "https://www.mashups.agency",
  }
}
