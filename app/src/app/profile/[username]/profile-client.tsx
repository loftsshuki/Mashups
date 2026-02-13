"use client"

import { Users, Music, Headphones, Calendar } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MashupCard } from "@/components/mashup-card"
import { FollowButton } from "@/components/profile/follow-button"
import type { MockCreator, MockMashup } from "@/lib/mock-data"

function formatCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  }
  return count.toString()
}

interface ProfileClientProps {
  creator: MockCreator
  mashups: MockMashup[]
}

export function ProfileClient({ creator, mashups }: ProfileClientProps) {
  const initials = creator.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Profile header */}
      <div className="mb-10 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
        {/* Avatar */}
        <Avatar className="h-24 w-24 sm:h-28 sm:w-28">
          <AvatarImage src={creator.avatarUrl} alt={creator.displayName} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {creator.displayName}
            </h1>
            <p className="mt-0.5 text-muted-foreground">@{creator.username}</p>
          </div>
          <p className="max-w-md text-center text-sm text-muted-foreground sm:text-left">
            {creator.bio}
          </p>

          {/* Stats row */}
          <div className="mt-1 flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">
                {formatCount(creator.followerCount)}
              </span>
              <span className="text-muted-foreground">followers</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Music className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">
                {creator.mashupCount}
              </span>
              <span className="text-muted-foreground">mashups</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Headphones className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">
                {formatCount(creator.totalPlays)}
              </span>
              <span className="text-muted-foreground">plays</span>
            </div>
          </div>

          {/* Follow button */}
          <FollowButton
            targetUserId={creator.username}
            initialFollowing={false}
            initialCount={creator.followerCount}
            className="mt-2"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="mashups">
        <TabsList className="mb-6">
          <TabsTrigger value="mashups">Mashups</TabsTrigger>
          <TabsTrigger value="liked">Liked</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* Mashups tab */}
        <TabsContent value="mashups">
          {mashups.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {mashups.map((mashup) => (
                <MashupCard
                  key={mashup.id}
                  id={mashup.id}
                  title={mashup.title}
                  coverUrl={mashup.coverUrl}
                  genre={mashup.genre}
                  duration={mashup.duration}
                  playCount={mashup.playCount}
                  creator={mashup.creator}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border/50 bg-muted/30 px-6 py-12 text-center">
              <Music className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                No mashups yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                When {creator.displayName} publishes mashups, they will appear
                here
              </p>
            </div>
          )}
        </TabsContent>

        {/* Liked tab */}
        <TabsContent value="liked">
          <div className="rounded-lg border border-border/50 bg-muted/30 px-6 py-12 text-center">
            <Headphones className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium text-foreground">
              Coming soon
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Liked mashups will appear here in a future update
            </p>
          </div>
        </TabsContent>

        {/* About tab */}
        <TabsContent value="about">
          <div className="max-w-lg space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Bio
              </h3>
              <p className="text-foreground leading-relaxed">
                {creator.bio || "No bio yet."}
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Member since
              </h3>
              <div className="flex items-center gap-2 text-foreground">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>2025</span>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Stats
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-border/50 bg-card px-4 py-3 text-center">
                  <p className="text-xl font-bold text-foreground">
                    {creator.mashupCount}
                  </p>
                  <p className="text-xs text-muted-foreground">mashups</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-card px-4 py-3 text-center">
                  <p className="text-xl font-bold text-foreground">
                    {formatCount(creator.followerCount)}
                  </p>
                  <p className="text-xs text-muted-foreground">followers</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-card px-4 py-3 text-center">
                  <p className="text-xl font-bold text-foreground">
                    {formatCount(creator.totalPlays)}
                  </p>
                  <p className="text-xs text-muted-foreground">total plays</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
