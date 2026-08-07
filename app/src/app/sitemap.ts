import type { MetadataRoute } from "next"

const routes = [
  "",
  "/create",
  "/discover",
  "/launches",
  "/challenges",
  "/chains",
  "/crates",
  "/pricing",
  "/partner",
  "/legal",
  "/legal/terms",
  "/legal/copyright",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = "https://www.mashups.agency"
  return routes.map((route, index) => ({
    url: `${origin}${route}`,
    lastModified: new Date(),
    changeFrequency: index < 7 ? "weekly" : "monthly",
    priority: route === "" ? 1 : index < 7 ? 0.9 : 0.6,
  }))
}
