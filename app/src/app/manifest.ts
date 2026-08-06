import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mashups Creator Campaign Studio",
    short_name: "Mashups",
    description: "Turn tracks into rights-aware short-form campaigns.",
    start_url: "/campaigns/new",
    display: "standalone",
    background_color: "#f2efe5",
    theme_color: "#ff4f1f",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  }
}
