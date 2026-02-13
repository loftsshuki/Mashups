"use client"

import { useState } from "react"
import { Share2, Link2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { addSignatureParams, withMashupsSignature } from "@/lib/growth/signature"

interface ShareButtonProps {
  mashupId: string
  title: string
  className?: string
}

export function ShareButton({ mashupId, title, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [isSigning, setIsSigning] = useState(false)

  const mashupUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/mashup/${mashupId}`
      : `/mashup/${mashupId}`
  const fallbackShareUrl = addSignatureParams(mashupUrl)

  const shareText = withMashupsSignature(`Check out "${title}"`)

  async function ensureSignedUrl() {
    if (signedUrl) return signedUrl
    if (typeof window === "undefined") return fallbackShareUrl

    setIsSigning(true)
    try {
      const response = await fetch("/api/attribution/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: `share-${mashupId}`,
          creatorId: "public-share",
          destination: mashupUrl,
          source: "mashup_share_menu",
        }),
      })

      if (response.ok) {
        const data = (await response.json()) as { url?: string }
        if (data.url) {
          setSignedUrl(data.url)
          return data.url
        }
      }
      return fallbackShareUrl
    } finally {
      setIsSigning(false)
    }
  }

  async function handleCopyLink() {
    try {
      const link = await ensureSignedUrl()
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: do nothing
    }
  }

  async function handleCopyCaption() {
    try {
      const link = await ensureSignedUrl()
      await navigator.clipboard.writeText(`${shareText}\n${link}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: do nothing
    }
  }

  async function handleShareX() {
    const link = await ensureSignedUrl()
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(link)}`
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400")
  }

  async function handleShareFacebook() {
    const link = await ensureSignedUrl()
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400")
  }

  async function handleNativeShare() {
    try {
      const link = await ensureSignedUrl()
      await navigator.share({
        title,
        text: shareText,
        url: link,
      })
    } catch {
      // User cancelled or not supported
    }
  }

  const hasNativeShare =
    typeof navigator !== "undefined" && !!navigator.share

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn(className)}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          {copied ? "Copied!" : isSigning ? "Signing..." : "Copy Signed Link"}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleCopyCaption}>
          <Share2 className="h-4 w-4" />
          Copy Caption + Link
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleShareX}>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleShareFacebook}>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Share on Facebook
        </DropdownMenuItem>

        {hasNativeShare && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share2 className="h-4 w-4" />
              Share...
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
