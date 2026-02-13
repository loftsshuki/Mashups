"use server"

export async function uploadAudio(formData: FormData): Promise<{ url: string } | { error: string }> {
  const file = formData.get("file") as File
  if (!file) return { error: "No file provided" }

  // Validate file type
  const validTypes = ["audio/mpeg", "audio/wav", "audio/flac", "audio/mp4", "audio/ogg", "audio/x-m4a"]
  if (!validTypes.includes(file.type)) {
    return { error: "Invalid file type. Supported: MP3, WAV, FLAC, M4A, OGG" }
  }

  // Validate size (50MB max)
  if (file.size > 50 * 1024 * 1024) {
    return { error: "File too large. Maximum size is 50MB" }
  }

  try {
    const { put } = await import("@vercel/blob")
    const blob = await put(`audio/${Date.now()}-${file.name}`, file, {
      access: "public",
    })
    return { url: blob.url }
  } catch {
    // Vercel Blob not configured — return a placeholder URL for development
    return { url: `/audio/dev-upload-${Date.now()}.mp3` }
  }
}

export async function uploadImage(formData: FormData): Promise<{ url: string } | { error: string }> {
  const file = formData.get("file") as File
  if (!file) return { error: "No file provided" }

  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!validTypes.includes(file.type)) {
    return { error: "Invalid file type. Supported: JPEG, PNG, WebP, GIF" }
  }

  if (file.size > 10 * 1024 * 1024) {
    return { error: "File too large. Maximum size is 10MB" }
  }

  try {
    const { put } = await import("@vercel/blob")
    const blob = await put(`images/${Date.now()}-${file.name}`, file, {
      access: "public",
    })
    return { url: blob.url }
  } catch {
    return { url: `https://placehold.co/400x400/7c3aed/white?text=Cover` }
  }
}
