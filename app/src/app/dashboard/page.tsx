"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Pencil, Trash2, Music, ChartColumn, Shield, Wallet, Gavel } from "lucide-react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { deleteMashup } from "@/lib/data/mashups-mutations"
import type { Mashup } from "@/lib/data/types"

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function formatPlayCount(count: number): string {
  if (count >= 1_000_000)
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (count >= 1_000)
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  return count.toString()
}

function DashboardContent() {
  const [mashups, setMashups] = useState<Mashup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Mashup | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchMashups() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setIsLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("mashups")
          .select("*")
          .eq("creator_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Failed to fetch mashups:", error)
          setIsLoading(false)
          return
        }

        setMashups(data ?? [])
      } catch {
        // Supabase not configured — show empty state
        console.error("Could not connect to Supabase")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMashups()
  }, [])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setIsDeleting(true)

    const result = await deleteMashup(deleteTarget.id)

    if ("success" in result) {
      setMashups((prev) => prev.filter((m) => m.id !== deleteTarget.id))
    }

    setIsDeleting(false)
    setDeleteTarget(null)
  }, [deleteTarget])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Mashups
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your creations
          </p>
        </div>
        <Button asChild>
          <Link href="/create">
            <Plus className="h-4 w-4" />
            Create New
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/analytics">
            <ChartColumn className="h-4 w-4" />
            Analytics
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/rights">
            <Shield className="h-4 w-4" />
            Rights Ops
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/monetization">
            <Wallet className="h-4 w-4" />
            Monetization
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/moderation">
            <Gavel className="h-4 w-4" />
            Moderation
          </Link>
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden py-0">
              <Skeleton className="aspect-square w-full" />
              <CardContent className="space-y-3 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && mashups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Music className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mt-6 text-xl font-semibold text-foreground">
            You haven&apos;t created any mashups yet
          </h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Start blending tracks together and share your creations with the
            community.
          </p>
          <Button asChild className="mt-6">
            <Link href="/create">
              <Plus className="h-4 w-4" />
              Create Your First Mashup
            </Link>
          </Button>
        </div>
      )}

      {/* Mashup grid */}
      {!isLoading && mashups.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mashups.map((mashup) => (
            <Card
              key={mashup.id}
              className="group relative overflow-hidden border-border/50 bg-card py-0 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              {/* Cover image */}
              <div className="relative aspect-square overflow-hidden">
                {mashup.cover_image_url ? (
                  <Image
                    src={mashup.cover_image_url}
                    alt={mashup.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Music className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {/* Action overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/50 group-hover:opacity-100">
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/mashup/${mashup.id}`}>
                      <Pencil className="h-4 w-4" />
                      View
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteTarget(mashup)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>

                {/* Duration badge */}
                {mashup.duration != null && mashup.duration > 0 && (
                  <div className="absolute right-2 bottom-2">
                    <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                      {formatDuration(mashup.duration)}
                    </span>
                  </div>
                )}
              </div>

              {/* Card body */}
              <CardContent className="space-y-2 p-4">
                <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
                  {mashup.title}
                </h3>
                <div className="flex items-center justify-between">
                  {mashup.genre && (
                    <Badge variant="secondary" className="text-[10px]">
                      {mashup.genre}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="h-3.5 w-3.5"
                    >
                      <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatPlayCount(mashup.play_count)}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {mashup.is_published ? "Published" : "Draft"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Mashup</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
