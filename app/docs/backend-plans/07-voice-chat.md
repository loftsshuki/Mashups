# Voice Chat - Backend Plan

**Priority:** P1  
**Timeline:** 1 week  
**Cost:** $20-50/month (Daily.co)

---

## Overview

Built-in voice communication for studio collaboration using Daily.co API.

## Why Daily.co?

| Feature | Daily.co | Twilio | Custom WebRTC |
|---------|----------|--------|---------------|
| Setup time | 1 day | 3 days | 2+ weeks |
| Maintenance | None | Low | High |
| Cost | Pay per use | Pay per use | Server costs |
| Features | Excellent | Good | Build yourself |

## Architecture

```
Studio Session
    │
    ▼
Create Daily Room (API call)
    │
    ▼
Return Room URL + Token
    │
    ▼
Client Joins (Daily SDK)
    │
    ▼
Voice Chat Active
```

## API Endpoints

### Get or Create Voice Room
```typescript
POST /api/studio/:id/voice

Headers:
  Authorization: Bearer {token}

Response:
{
  "roomUrl": "https://mashups.daily.co/studio_abc123",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "roomName": "studio_abc123",
  "expiresAt": "2026-02-15T12:00:00Z"
}
```

### End Voice Session
```typescript
DELETE /api/studio/:id/voice

Response:
{
  "success": true,
  "message": "Room deleted"
}
```

## Implementation

### Daily.co Integration

```typescript
// lib/voice/daily.ts
import DailyIframe from '@daily-co/daily-js';

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_DOMAIN = 'mashups.daily.co';

interface VoiceRoom {
  name: string;
  url: string;
  token: string;
  expiresAt: Date;
}

export async function createVoiceRoom(studioId: string): Promise<VoiceRoom> {
  const roomName = `studio_${studioId}`;

  // Create room via Daily API
  const response = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DAILY_API_KEY}`
    },
    body: JSON.stringify({
      name: roomName,
      privacy: 'private',
      properties: {
        max_participants: 10,
        enable_screenshare: false,
        enable_chat: false,
        enable_knocking: true,
        enable_network_ui: true,
        start_video_off: true,
        start_audio_off: false
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create voice room');
  }

  const room = await response.json();

  // Create meeting token for owner
  const token = await createMeetingToken(roomName);

  return {
    name: room.name,
    url: room.url,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  };
}

async function createMeetingToken(roomName: string): Promise<string> {
  const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DAILY_API_KEY}`
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        is_owner: true,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 hours
      }
    })
  });

  const { token } = await response.json();
  return token;
}

export async function deleteVoiceRoom(roomName: string): Promise<void> {
  await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${DAILY_API_KEY}`
    }
  });
}
```

### React Component

```tsx
// components/voice/voice-chat.tsx
import DailyIframe from '@daily-co/daily-js';
import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react';

interface VoiceChatProps {
  roomUrl: string;
  token: string;
}

export function VoiceChat({ roomUrl, token }: VoiceChatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyIframe.CallFrame | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<DailyIframe.Participant[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create call frame
    callRef.current = DailyIframe.createFrame(containerRef.current, {
      url: roomUrl,
      token: token,
      showLeaveButton: false,
      showFullscreenButton: false,
      showLocalVideo: false,
      showParticipantsBar: false,
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: '0',
        borderRadius: '8px'
      }
    });

    // Event listeners
    callRef.current.on('joined-meeting', () => setIsJoined(true));
    callRef.current.on('left-meeting', () => setIsJoined(false));
    callRef.current.on('participant-joined', updateParticipants);
    callRef.current.on('participant-left', updateParticipants);

    // Join automatically
    callRef.current.join();

    return () => {
      callRef.current?.destroy();
    };
  }, [roomUrl, token]);

  const updateParticipants = () => {
    const participants = Object.values(callRef.current?.participants() || {});
    setParticipants(participants);
  };

  const toggleMute = () => {
    if (isMuted) {
      callRef.current?.setLocalAudio(true);
    } else {
      callRef.current?.setLocalAudio(false);
    }
    setIsMuted(!isMuted);
  };

  const leave = () => {
    callRef.current?.leave();
  };

  return (
    <div className="voice-chat">
      {/* Hidden iframe for audio */}
      <div ref={containerRef} className="hidden" />

      {/* Controls */}
      <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg">
        <div className="flex -space-x-2">
          {participants.map((p) => (
            <div
              key={p.session_id}
              className="w-8 h-8 rounded-full bg-cyan-500 border-2 border-slate-800"
              title={p.user_name || 'Anonymous'}
            >
              {p.user_name?.[0] || '?'}
            </div>
          ))}
          {participants.length === 0 && (
            <span className="text-slate-400 text-sm">No one in voice</span>
          )}
        </div>

        <div className="flex-1" />

        <button
          onClick={toggleMute}
          className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-slate-700'}`}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <button
          onClick={leave}
          className="p-2 rounded-full bg-red-500 hover:bg-red-600"
        >
          <PhoneOff size={20} />
        </button>
      </div>

      {/* Participant list */}
      {participants.length > 0 && (
        <div className="mt-2 text-sm text-slate-400">
          {participants.map(p => p.user_name).join(', ')} in voice
        </div>
      )}
    </div>
  );
}
```

### Compact Version (for Studio Header)

```tsx
// components/voice/voice-button.tsx
export function VoiceButton({ studioId }: { studioId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [roomData, setRoomData] = useState<VoiceRoom | null>(null);

  const joinVoice = async () => {
    const response = await fetch(`/api/studio/${studioId}/voice`, {
      method: 'POST'
    });
    const data = await response.json();
    setRoomData(data);
    setIsOpen(true);
  };

  return (
    <>
      <Button
        onClick={() => isOpen ? setIsOpen(false) : joinVoice()}
        variant={isOpen ? 'primary' : 'secondary'}
      >
        {isOpen ? <PhoneOff size={16} /> : <Phone size={16} />}
        {isOpen ? 'Leave' : 'Join Voice'}
      </Button>

      {isOpen && roomData && (
        <VoiceChat roomUrl={roomData.url} token={roomData.token} />
      )}
    </>
  );
}
```

## API Route

```typescript
// app/api/studio/[id]/voice/route.ts

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user has access to studio
  const hasAccess = await checkStudioAccess(params.id, user.id);
  if (!hasAccess) {
    return Response.json({ error: 'No access' }, { status: 403 });
  }

  // Create or get existing room
  let roomData = await getStoredRoom(params.id);
  
  if (!roomData || isExpired(roomData)) {
    roomData = await createVoiceRoom(params.id);
    await storeRoomData(params.id, roomData);
  }

  return Response.json(roomData);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const roomData = await getStoredRoom(params.id);
  
  if (roomData) {
    await deleteVoiceRoom(roomData.name);
    await deleteStoredRoom(params.id);
  }

  return Response.json({ success: true });
}
```

## Database

```sql
-- Voice rooms
CREATE TABLE voice_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id text UNIQUE NOT NULL,
  room_name text NOT NULL,
  room_url text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp DEFAULT now(),
  expires_at timestamp
);

-- Index for cleanup
CREATE INDEX idx_voice_rooms_expires ON voice_rooms(expires_at);
```

## Cost Breakdown

| Usage | Cost |
|-------|------|
| Per minute per participant | ~$0.004 |
| 1000 hours/month | ~$240 |
| **Typical (100 hours)** | **~$24/month** |

## Free Alternative: Basic WebRTC

For cost-conscious launch, use simple WebRTC with no backend:

```typescript
// lib/voice/webrtc.ts (client-only)
export function createPeerConnection() {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });
  return pc;
}

// Users exchange offers/answers via PartyKit/WebSocket
// No cost but more complex setup
```

---

*Next: Analytics Dashboard*