import type { MetadataRoute } from "next"

  const routes = [
  "",
  "/discover",
    "/campaigns/new",
    "/launches",
    "/launches/new",
  "/challenges",
  "/pricing",
  "/packs",
  "/momentum",
  "/scoreboard",
  "/labs",
  "/enterprise",
  "/legal",
  "/legal/terms",
  "/legal/copyright",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = "https://www.mashups.agency"
  return routes.map((route, index) => ({
    url: `${origin}${route}`,
    lastModified: new Date(),
    changeFrequency: index < 5 ? "weekly" : "monthly",
    priority: route === "" ? 1 : index < 5 ? 0.9 : 0.6,
  }))
}
