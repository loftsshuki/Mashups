"use client"

import { useEffect, useState } from "react"
import { Collaborator, mockCollaborators } from "@/lib/data/realtime-collab"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, MousePointer2, Eye, EyeOff } from "lucide-react"

interface CursorPresenceProps {
  collaborators?: Collaborator[]
  currentUserId?: string
  onFollowUser?: (userId: string | null) => void
  followingUserId?: string | null
  className?: string
}

export function CursorPresence({
  collaborators = mockCollaborators,
  currentUserId,
  onFollowUser,
  followingUserId,
  className,
}: CursorPresenceProps) {
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

interface CollaboratorCursorProps {
  collaborator: Collaborator
  onFollow?: () => void
  isFollowing?: boolean
}

export function CollaboratorCursor({
  collaborator,
  onFollow,
  isFollowing,
}: CollaboratorCursorProps) {
  return (
    <div
      className="absolute flex flex-col items-start gap-1 pointer-events-none transition-all duration-75"
      style={{
        left: collaborator.cursor.x,
        top: collaborator.cursor.y,
        zIndex: 50,
      }}
    >
      <MousePointer2
        className="h-5 w-5 fill-current"
        style={{ color: collaborator.color }}
      />
      
      <div
        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: collaborator.color }}
      >
        <Avatar className="h-4 w-4">
          <AvatarImage src={collaborator.avatarUrl} />
          <AvatarFallback className="text-[8px]">
            {collaborator.displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <span>{collaborator.displayName}</span>
        
        {isFollowing && <Eye className="h-3 w-3" />}
      </div>
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
