"use client"

import { useEffect, useState } from "react"
import { useRealtimeCollab } from "@/lib/hooks/use-realtime-collab"
import type { Collaborator } from "@/lib/data/realtime-collab"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, MousePointer2, Eye, EyeOff, Radio } from "lucide-react"

interface CursorPresenceProps {
  sessionId: string
  userId: string
  displayName: string
  avatarUrl?: string
  className?: string
}

export function CursorPresence({
  sessionId,
  userId,
  displayName,
  avatarUrl = "",
  className,
}: CursorPresenceProps) {
  const {
    collaborators,
    isConnected,
    followingUserId,
    setFollowingUserId,
  } = useRealtimeCollab({
    sessionId,
    userId,
    displayName,
    avatarUrl,
  })

  const activeCollaborators = collaborators.filter(c => c.isActive)

  return (
    <div className={cn("relative", className)}>
      {/* Collaborator avatars toolbar */}
      <div className="flex items-center gap-2 p-2 rounded-xl border border-border/50 bg-card/50">
        <div className="flex -space-x-2">
          {activeCollaborators.slice(0, 3).map(collab => (
            <Avatar
              key={collab.id}
              className="h-8 w-8 border-2 border-background transition-transform hover:scale-110 hover:z-10"
              style={{ borderColor: collab.color }}
              title={collab.displayName}
            >
              <AvatarImage src={collab.avatarUrl} />
              <AvatarFallback style={{ backgroundColor: collab.color, color: "white" }}>
                {collab.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        
        {activeCollaborators.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{activeCollaborators.length - 3}
          </span>
        )}
        
        <div className="flex-1" />
        
        {/* Connection status */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Radio className={cn("h-3 w-3", isConnected ? "text-green-500" : "text-amber-500")} />
          {isConnected ? "Live" : "Connecting..."}
        </div>
        
        {/* Follow mode button */}
        {followingUserId ? (
          <Button
            variant="default"
            size="sm"
            onClick={() => setFollowingUserId(null)}
            className="h-8 gap-1.5 text-xs"
          >
            <Eye className="h-3.5 w-3.5" />
            Following {activeCollaborators.find(c => c.userId === followingUserId)?.displayName}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />
            {activeCollaborators.length} active
          </Button>
        )}
      </div>

      {/* Cursor overlays */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        {activeCollaborators.map(collab => (
          <CollaboratorCursor
            key={collab.id}
            collaborator={collab}
            isFollowing={followingUserId === collab.userId}
            onFollow={() => setFollowingUserId(collab.userId)}
          />
        ))}
      </div>
    </div>
  )
}

interface CollaboratorCursorProps {
  collaborator: Collaborator
  onFollow?: () => void
  isFollowing?: boolean
}

function CollaboratorCursor({ collaborator, onFollow, isFollowing }: CollaboratorCursorProps) {
  const [position, setPosition] = useState({ x: collaborator.cursor.x, y: collaborator.cursor.y })

  // Smooth cursor animation
  useEffect(() => {
    let rafId: number
    const animate = () => {
      setPosition(prev => ({
        x: prev.x + (collaborator.cursor.x - prev.x) * 0.3,
        y: prev.y + (collaborator.cursor.y - prev.y) * 0.3,
      }))
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [collaborator.cursor.x, collaborator.cursor.y])

  return (
    <div
      className="absolute flex flex-col items-start gap-1 pointer-events-auto transition-opacity"
      style={{
        left: position.x,
        top: position.y,
        zIndex: isFollowing ? 60 : 50,
      }}
    >
      <MousePointer2
        className="h-5 w-5 fill-current drop-shadow-md"
        style={{ color: collaborator.color }}
      />
      
      <button
        onClick={onFollow}
        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white shadow-lg hover:scale-105 transition-transform"
        style={{ backgroundColor: collaborator.color }}
      >
        <Avatar className="h-4 w-4">
          <AvatarImage src={collaborator.avatarUrl} />
          <AvatarFallback className="text-[8px] bg-white/20">
            {collaborator.displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <span>{collaborator.displayName}</span>
        
        {isFollowing && <Eye className="h-3 w-3" />}
      </button>
    </div>
  )
}

interface FollowModeToggleProps {
  enabled: boolean
  leaderName?: string
  onToggle: () => void
}

export function FollowModeToggle({ enabled, leaderName, onToggle }: FollowModeToggleProps) {
  return (
    <Button
      variant={enabled ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      className="gap-1.5"
    >
      {enabled ? (
        <>
          <Eye className="h-4 w-4" />
          Following {leaderName}
        </>
      ) : (
        <>
          <EyeOff className="h-4 w-4" />
          Follow Mode
        </>
      )}
    </Button>
  )
}

// Legacy component for backward compatibility with mock data
interface LegacyCursorPresenceProps {
  collaborators?: Collaborator[]
  currentUserId?: string
  onFollowUser?: (userId: string | null) => void
  followingUserId?: string | null
  className?: string
}

export function MockCursorPresence({
  collaborators = [],
  currentUserId,
  onFollowUser,
  followingUserId,
  className,
}: LegacyCursorPresenceProps) {
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number }>>(new Map())

  useEffect(() => {
    const interval = setInterval(() => {
      setCursors(prev => {
        const next = new Map(prev)
        collaborators.forEach(collab => {
          if (collab.userId !== currentUserId) {
            const currentX = next.get(collab.userId)?.x ?? collab.cursor.x
            const currentY = next.get(collab.userId)?.y ?? collab.cursor.y
            
            next.set(collab.userId, {
              x: currentX + (Math.random() - 0.5) * 10,
              y: currentY + (Math.random() - 0.5) * 10,
            })
          }
        })
        return next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [collaborators, currentUserId])

  const activeCollaborators = collaborators.filter(c => c.isActive && c.userId !== currentUserId)

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex -space-x-2">
          {activeCollaborators.slice(0, 3).map(collab => (
            <Avatar
              key={collab.id}
              className="h-8 w-8 border-2 border-background"
              style={{ borderColor: collab.color }}
              title={collab.displayName}
            >
              <AvatarImage src={collab.avatarUrl} />
              <AvatarFallback style={{ backgroundColor: collab.color }}>
                {collab.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        
        {activeCollaborators.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{activeCollaborators.length - 3}
          </span>
        )}
        
        <div className="flex-1" />
        
        {followingUserId ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFollowUser?.(null)}
            className="h-8 gap-1.5 text-xs"
          >
            <Eye className="h-3.5 w-3.5" />
            Following {activeCollaborators.find(c => c.userId === followingUserId)?.displayName}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />
            {activeCollaborators.length} active
          </Button>
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {activeCollaborators.map(collab => {
          const cursor = cursors.get(collab.userId) ?? { x: collab.cursor.x, y: collab.cursor.y }
          
          return (
            <div
              key={collab.id}
              className="absolute transition-all duration-100 ease-out"
              style={{
                left: cursor.x,
                top: cursor.y,
                color: collab.color,
              }}
            >
              <MousePointer2 className="h-5 w-5 fill-current" style={{ color: collab.color }} />
              
              <div
                className="ml-4 -mt-1 px-2 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap"
                style={{ backgroundColor: collab.color }}
              >
                {collab.displayName}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
