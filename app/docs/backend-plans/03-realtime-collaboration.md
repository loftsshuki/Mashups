# Real-Time Collaboration - Backend Plan

**Priority:** P0  
**Timeline:** 2-4 weeks  
**Cost:** $20-50/month

---

## Overview

Enable multiple users to collaborate on the same project with live cursors, presence, and synchronized edits.

## Architecture Options

| Option | Pros | Cons | Cost | Timeline |
|--------|------|------|------|----------|
| **PartyKit** | Managed, easy setup, scales automatically | Less control | $5+/mo | 2 weeks |
| **Socket.io + Redis** | Full control, mature | Self-managed | $30-50/mo | 4 weeks |
| **Ably** | Enterprise features | Expensive | $50+/mo | 2 weeks |

**Recommendation:** Start with PartyKit for fastest time-to-market.

---

## PartyKit Implementation

### Server

```typescript
// partykit/server.ts
import type * as Party from "partykit/server";

interface UserPresence {
  id: string;
  name: string;
  avatar: string;
  color: string;
  cursor?: { x: number; y: number };
  lastSeen: number;
}

interface ProjectState {
  tracks: Track[];
  playhead: number;
  isPlaying: boolean;
  version: number;
}

export default class StudioServer implements Party.Server {
  users = new Map<string, UserPresence>();
  projectState: ProjectState = {
    tracks: [],
    playhead: 0,
    isPlaying: false,
    version: 0
  };

  constructor(readonly room: Party.Room) {}

  async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    // Authenticate user
    const token = new URL(ctx.request.url).searchParams.get('token');
    const user = await verifyToken(token);

    if (!user) {
      connection.close(4001, 'Unauthorized');
      return;
    }

    // Add to users
    this.users.set(connection.id, {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      color: getUserColor(connection.id),
      lastSeen: Date.now()
    });

    // Send current state to new user
    connection.send(JSON.stringify({
      type: 'init',
      users: Array.from(this.users.values()),
      state: this.projectState,
      yourId: connection.id
    }));

    // Notify others
    this.broadcast(JSON.stringify({
      type: 'user_joined',
      user: this.users.get(connection.id)
    }), [connection.id]);
  }

  onMessage(message: string, sender: Party.Connection) {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'cursor':
        this.handleCursorUpdate(sender.id, data);
        break;

      case 'operation':
        this.handleOperation(sender.id, data);
        break;

      case 'transport':
        this.handleTransport(sender.id, data);
        break;

      case 'ping':
        this.users.get(sender.id)!.lastSeen = Date.now();
        break;
    }
  }

  onClose(connection: Party.Connection) {
    const user = this.users.get(connection.id);
    this.users.delete(connection.id);

    this.broadcast(JSON.stringify({
      type: 'user_left',
      userId: connection.id
    }));
  }

  private handleCursorUpdate(senderId: string, data: any) {
    const user = this.users.get(senderId);
    if (user) {
      user.cursor = { x: data.x, y: data.y };
      user.lastSeen = Date.now();
    }

    // Broadcast to others (not sender)
    this.broadcast(JSON.stringify({
      type: 'cursor',
      userId: senderId,
      x: data.x,
      y: data.y
    }), [senderId]);
  }

  private handleOperation(senderId: string, data: any) {
    // Apply operation (using OT or CRDT)
    const result = this.applyOperation(data.operation);

    if (result.success) {
      this.projectState.version++;

      // Broadcast to all including sender (ack)
      this.broadcast(JSON.stringify({
        type: 'operation',
        operation: data.operation,
        version: this.projectState.version,
        userId: senderId
      }));
    }
  }

  private handleTransport(senderId: string, data: any) {
    // Sync play/pause/stop
    this.projectState.isPlaying = data.playing;
    this.projectState.playhead = data.position;

    this.broadcast(JSON.stringify({
      type: 'transport',
      playing: data.playing,
      position: data.position,
      userId: senderId
    }), [senderId]); // Don't echo to sender
  }

  private applyOperation(op: any): { success: boolean } {
    // Implementation depends on OT vs CRDT choice
    // See Operational Transform section below
    return { success: true };
  }
}
```

### Client Hook

```typescript
// hooks/use-studio-collab.ts
import { useEffect, useRef, useState } from 'react';
import PartySocket from "partysocket";

interface CollabState {
  users: UserPresence[];
  isConnected: boolean;
  currentUserId: string | null;
}

export function useStudioCollab(projectId: string, token: string) {
  const [state, setState] = useState<CollabState>({
    users: [],
    isConnected: false,
    currentUserId: null
  });

  const socket = useRef<PartySocket>();
  const pendingOps = useRef<any[]>([]);

  useEffect(() => {
    socket.current = new PartySocket({
      host: process.env.NEXT_PUBLIC_PARTYKIT_HOST,
      room: projectId,
      query: { token }
    });

    socket.current.onopen = () => {
      setState(s => ({ ...s, isConnected: true }));
    };

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleMessage(data);
    };

    socket.current.onclose = () => {
      setState(s => ({ ...s, isConnected: false }));
    };

    // Heartbeat
    const heartbeat = setInterval(() => {
      socket.current?.send(JSON.stringify({ type: 'ping' }));
    }, 30000);

    return () => {
      clearInterval(heartbeat);
      socket.current?.close();
    };
  }, [projectId, token]);

  const handleMessage = (data: any) => {
    switch (data.type) {
      case 'init':
        setState({
          users: data.users,
          isConnected: true,
          currentUserId: data.yourId
        });
        // Apply initial state
        if (data.state) {
          applyServerState(data.state);
        }
        break;

      case 'user_joined':
        setState(s => ({
          ...s,
          users: [...s.users, data.user]
        }));
        break;

      case 'user_left':
        setState(s => ({
          ...s,
          users: s.users.filter(u => u.id !== data.userId)
        }));
        break;

      case 'cursor':
        setState(s => ({
          ...s,
          users: s.users.map(u =>
            u.id === data.userId
              ? { ...u, cursor: { x: data.x, y: data.y } }
              : u
          )
        }));
        break;

      case 'operation':
        applyServerOperation(data.operation);
        break;

      case 'transport':
        syncTransport(data.playing, data.position);
        break;
    }
  };

  const sendCursor = (x: number, y: number) => {
    socket.current?.send(JSON.stringify({
      type: 'cursor',
      x,
      y,
      timestamp: Date.now()
    }));
  };

  const sendOperation = (operation: any) => {
    const message = {
      type: 'operation',
      operation,
      timestamp: Date.now()
    };

    // Optimistic apply
    applyLocalOperation(operation);

    // Send to server
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
    } else {
      pendingOps.current.push(message);
    }
  };

  const sendTransport = (playing: boolean, position: number) => {
    socket.current?.send(JSON.stringify({
      type: 'transport',
      playing,
      position
    }));
  };

  return {
    ...state,
    sendCursor,
    sendOperation,
    sendTransport,
    isOnline: state.isConnected
  };
}
```

### React Component

```tsx
// components/studio/live-cursors.tsx
export function LiveCursors({ users }: { users: UserPresence[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {users.filter(u => u.cursor).map(user => (
        <Cursor
          key={user.id}
          x={user.cursor!.x}
          y={user.cursor!.y}
          color={user.color}
          name={user.name}
        />
      ))}
    </div>
  );
}

function Cursor({ x, y, color, name }: CursorProps) {
  return (
    <div
      className="absolute transition-transform duration-100"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.45.45 0 0 0 .32-.77L6.18 2.86a.5.5 0 0 0-.68.35z"/>
      </svg>
      <span
        className="px-2 py-1 rounded text-xs text-white"
        style={{ backgroundColor: color }}
      >
        {name}
      </span>
    </div>
  );
}
```

## Operational Transform (OT)

For conflict resolution, use a simple OT approach:

```typescript
// lib/collab/ot.ts
interface Operation {
  type: 'insert' | 'delete' | 'move' | 'update';
  target: 'track' | 'clip' | 'marker';
  id: string;
  path: string[];
  value?: any;
  oldValue?: any;
}

// Transform operation against another concurrent operation
export function transform(op1: Operation, op2: Operation): Operation {
  // If operations target different objects, no conflict
  if (op1.id !== op2.id) return op1;

  // Handle specific conflicts
  if (op1.type === 'update' && op2.type === 'update') {
    // Last-write-wins for now
    if (op1.timestamp > op2.timestamp) {
      return op1;
    }
  }

  return op1;
}

// Alternative: Use Yjs for CRDT
// npm install yjs y-partykit
```

## API Endpoints

```typescript
// Get project session token
POST /api/projects/:id/join

Response:
{
  "token": "jwt_token",
  "partykitHost": "partykit.yourapp.com",
  "roomId": "project_uuid"
}

// Get active collaborators
GET /api/projects/:id/collaborators

Response:
{
  "collaborators": [
    {
      "id": "user_id",
      "name": "User Name",
      "avatar": "...",
      "joinedAt": "..."
    }
  ]
}
```

## Deployment

```bash
# Install PartyKit CLI
npm install -g partykit

# Deploy
partykit deploy partykit/server.ts

# Configure env
partykit env add PARTYKIT_HOST
```

## Cost Breakdown

| Usage | Cost |
|-------|------|
| Base | $5/month |
| 1M messages | $0.40 |
| 10M messages | $4.00 |
| **Est. Monthly** | **$20-50** |

---

*Next: Auto-Caption Generator*