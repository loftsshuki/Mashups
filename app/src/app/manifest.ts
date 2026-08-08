import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/create",
    name: "Mashups - Make the Version",
    short_name: "Mashups",
    description: "Pick two rights-cleared tracks, hear three arrangements, and keep the version you wish existed.",
    start_url: "/create?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f2efe5",
    theme_color: "#ff4f1f",
    categories: ["music", "entertainment", "social"],
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Make a mashup", short_name: "Create", url: "/create", icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }] },
      { name: "Find a pairing", short_name: "Discover", url: "/discover", icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }] },
    ],
  }
}
