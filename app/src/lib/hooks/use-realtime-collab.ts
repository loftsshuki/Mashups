"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Collaborator, CollabSession, CollabOperation } from "@/lib/data/realtime-collab"

interface CursorPosition {
  x: number
  y: number
  viewport?: {
    scrollX: number
    scrollY: number
    width: number
    height: number
  }
}

interface RealtimeCollabState {
  collaborators: Collaborator[]
  isConnected: boolean
  session: CollabSession | null
}

interface UseRealtimeCollabOptions {
  sessionId: string
  userId: string
  displayName: string
  avatarUrl?: string
  onOperation?: (operation: CollabOperation) => void
}

export function useRealtimeCollab({
  sessionId,
  userId,
  displayName,
  avatarUrl = "",
  onOperation,
}: UseRealtimeCollabOptions) {
  const [state, setState] = useState<RealtimeCollabState>({
    collaborators: [],
    isConnected: false,
    session: null,
  })
  
  const [followingUserId, setFollowingUserId] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null)
  const cursorThrottleRef = useRef<number>(0)
  const localCursorRef = useRef<CursorPosition>({ x: 0, y: 0 })

  // Initialize realtime channel
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`collab:${sessionId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    // Handle presence sync - track other collaborators
    channel.on("presence", { event: "sync" }, () => {
      const presenceState = channel.presenceState()
      const collaborators: Collaborator[] = []
      
      Object.entries(presenceState).forEach(([key, presences]) => {
        const presenceArray = presences as Array<{
          userId: string
          displayName: string
          avatarUrl: string
          color: string
          cursor: CursorPosition
          isActive: boolean
          lastSeen: string
        }>
        const presence = presenceArray[0]
        
        if (presence && presence.userId !== userId) {
          collaborators.push({
            id: `collab_${presence.userId}`,
            userId: presence.userId,
            displayName: presence.displayName,
            avatarUrl: presence.avatarUrl,
            color: presence.color,
            cursor: {
              x: presence.cursor?.x ?? 0,
              y: presence.cursor?.y ?? 0,
              timestamp: Date.now(),
            },
            isActive: presence.isActive ?? true,
            lastSeen: presence.lastSeen ?? new Date().toISOString(),
          })
        }
      })
      
      setState(prev => ({ ...prev, collaborators }))
    })

    // Handle presence join
    channel.on("presence", { event: "join" }, ({ key, newPresences }: { key: string; newPresences: unknown[] }) => {
      console.log("User joined:", key, newPresences)
    })

    // Handle presence leave
    channel.on("presence", { event: "leave" }, ({ key, leftPresences }: { key: string; leftPresences: unknown[] }) => {
      console.log("User left:", key, leftPresences)
      setState(prev => ({
        ...prev,
        collaborators: prev.collaborators.filter(c => c.userId !== key),
      }))
    })

    // Handle broadcast messages (cursor updates, operations)
    channel.on("broadcast", { event: "cursor_update" }, ({ payload }) => {
      if (payload?.userId === userId) return
      
      setState(prev => ({
        ...prev,
        collaborators: prev.collaborators.map(c =>
          c.userId === payload.userId
            ? {
                ...c,
                cursor: {
                  x: payload.cursor?.x ?? c.cursor.x,
                  y: payload.cursor?.y ?? c.cursor.y,
                  timestamp: Date.now(),
                },
                lastSeen: new Date().toISOString(),
              }
            : c
        ),
      }))
    })

    channel.on("broadcast", { event: "operation" }, ({ payload }) => {
      if (payload?.userId !== userId && onOperation) {
        onOperation(payload as CollabOperation)
      }
    })

    // Subscribe to channel
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        setState(prev => ({ ...prev, isConnected: true }))
        
        // Track initial presence
        await channel.track({
          userId,
          displayName,
          avatarUrl,
          color: getUserColor(userId),
          cursor: { x: 0, y: 0 },
          isActive: true,
          lastSeen: new Date().toISOString(),
        })
      } else {
        setState(prev => ({ ...prev, isConnected: false }))
      }
    })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [sessionId, userId, displayName, avatarUrl, onOperation])

  // Broadcast cursor position (throttled)
  const broadcastCursor = useCallback((position: CursorPosition) => {
    localCursorRef.current = position
    
    const now = Date.now()
    if (now - cursorThrottleRef.current < 50) return // Throttle to 20fps
    cursorThrottleRef.current = now

    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "cursor_update",
        payload: {
          userId,
          cursor: position,
          timestamp: now,
        },
      })
    }

    // Update own presence with cursor
    channelRef.current?.track({
      userId,
      displayName,
      avatarUrl,
      color: getUserColor(userId),
      cursor: position,
      isActive: true,
      lastSeen: new Date().toISOString(),
    })
  }, [userId, displayName, avatarUrl])

  // Send operation
  const sendOperation = useCallback((operation: Omit<CollabOperation, "id" | "timestamp" | "acknowledged">) => {
    if (!channelRef.current) return

    const fullOperation: CollabOperation = {
      ...operation,
      id: `op_${Date.now()}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    }

    channelRef.current.send({
      type: "broadcast",
      event: "operation",
      payload: fullOperation,
    })
  }, [])

  // Follow mode - scroll to follow user's viewport
  useEffect(() => {
    if (!followingUserId) return

    const followedUser = state.collaborators.find(c => c.userId === followingUserId)
    if (!followedUser?.cursor?.viewport) return

    const { scrollX, scrollY } = followedUser.cursor.viewport
    window.scrollTo({ left: scrollX, top: scrollY, behavior: "smooth" })
  }, [followingUserId, state.collaborators])

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      broadcastCursor({
        x: e.clientX,
        y: e.clientY,
        viewport: {
          scrollX: window.scrollX,
          scrollY: window.scrollY,
          width: window.innerWidth,
          height: window.innerHeight,
        },
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [broadcastCursor])

  return {
    ...state,
    followingUserId,
    setFollowingUserId,
    broadcastCursor,
    sendOperation,
  }
}

// Generate consistent color for user
function getUserColor(userId: string): string {
  const colors = [
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
  ]
  
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

// Hook for tracking cursor in a specific element (e.g., timeline)
export function useElementCursor(
  elementRef: React.RefObject<HTMLElement | null>,
  onCursorMove?: (position: { x: number; y: number; elementX: number; elementY: number }) => void
) {
  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      onCursorMove?.({
        x: e.clientX,
        y: e.clientY,
        elementX: e.clientX - rect.left,
        elementY: e.clientY - rect.top,
      })
    }

    element.addEventListener("mousemove", handleMouseMove)
    return () => element.removeEventListener("mousemove", handleMouseMove)
  }, [elementRef, onCursorMove])
}
