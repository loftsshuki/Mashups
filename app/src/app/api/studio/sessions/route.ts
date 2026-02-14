import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

import {
  mockCollaborationSessions,
  type CollaborationSession,
} from "@/lib/data/collaboration"
import { createClient } from "@/lib/supabase/server"

interface CreateBody {
  title?: string
}

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

function buildMockSession(title: string): CollaborationSession {
  return {
    id: `sess-${randomUUID().replace(/-/g, "").slice(0, 8)}`,
    title,
    status: "active",
    participants: 1,
    startedAt: new Date().toISOString(),
  }
}

function mapDbSession(row: Record<string, unknown>): CollaborationSession {
  const id = typeof row.id === "string" ? row.id : `sess-${Date.now()}`
  return {
    id,
    title: typeof row.title === "string" ? row.title : "Studio Session",
    status:
      row.status === "active" || row.status === "paused" || row.status === "ended"
        ? row.status
        : "active",
    participants:
      typeof row.participant_count === "number"
        ? Math.max(1, row.participant_count)
        : 1,
    startedAt:
      typeof row.started_at === "string" ? row.started_at : new Date().toISOString(),
  }
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ sessions: mockCollaborationSessions })
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ sessions: mockCollaborationSessions })
    }

    const { data: sessionRows, error } = await supabase
      .from("collaboration_sessions")
      .select("id,title,status,started_at")
      .eq("owner_id", user.id)
      .order("started_at", { ascending: false })
      .limit(24)

    if (error || !sessionRows || sessionRows.length === 0) {
      return NextResponse.json({ sessions: mockCollaborationSessions })
    }

    const sessionIds = (sessionRows as Record<string, unknown>[])
      .map((row) => (typeof row.id === "string" ? row.id : null))
      .filter((value): value is string => Boolean(value))

    let participantCounts = new Map<string, number>()
    if (sessionIds.length > 0) {
      const { data: participantRows } = await supabase
        .from("collaboration_participants")
        .select("session_id")
        .in("session_id", sessionIds)
        .limit(1000)

      participantCounts = new Map()
      for (const row of (participantRows as Record<string, unknown>[] | null) ?? []) {
        const sessionId = typeof row.session_id === "string" ? row.session_id : null
        if (!sessionId) continue
        participantCounts.set(sessionId, (participantCounts.get(sessionId) ?? 0) + 1)
      }
    }

    const sessions = (sessionRows as Record<string, unknown>[]).map((row) =>
      mapDbSession({
        ...row,
        participant_count: participantCounts.get(String(row.id)),
      }),
    )

    return NextResponse.json({ sessions })
  } catch {
    return NextResponse.json({ sessions: mockCollaborationSessions })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as CreateBody
    const title = body.title?.trim() || "Untitled Studio Session"

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ session: buildMockSession(title) })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("collaboration_sessions")
      .insert({
        owner_id: user.id,
        title,
        status: "active",
      })
      .select("id,title,status,started_at")
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Failed to create session." },
        { status: 400 },
      )
    }

    return NextResponse.json({ session: mapDbSession(data as Record<string, unknown>) })
  } catch {
    return NextResponse.json({ error: "Invalid session payload." }, { status: 400 })
  }
}
