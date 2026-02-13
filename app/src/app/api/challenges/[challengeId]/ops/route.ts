import { NextResponse } from "next/server"

import { isAdminEmail } from "@/lib/auth/admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

type ChallengeOpsAction = "select_winner" | "mark_payout" | "mark_fulfillment"

interface ChallengeOpsBody {
  action?: ChallengeOpsAction
  mashupId?: string
  creatorId?: string
  prizeCents?: number
  payoutStatus?: "pending" | "paid" | "failed"
  sponsorFulfillmentStatus?: "pending" | "fulfilled"
  payoutReference?: string
  note?: string
}

function isPayoutStatus(value: unknown): value is "pending" | "paid" | "failed" {
  return value === "pending" || value === "paid" || value === "failed"
}

function isSponsorFulfillmentStatus(
  value: unknown,
): value is "pending" | "fulfilled" {
  return value === "pending" || value === "fulfilled"
}

async function getAdminContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminEmail(user?.email)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    return {
      error: NextResponse.json(
        { error: "Admin client unavailable. Configure SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 },
      ),
    }
  }

  return { adminClient, userId: user?.id ?? null }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ challengeId: string }> },
) {
  const admin = await getAdminContext()
  if ("error" in admin) return admin.error

  const { challengeId } = await params
  const [winnersResponse, opsResponse] = await Promise.all([
    admin.adminClient
      .from("challenge_winners")
      .select("*")
      .eq("challenge_id", challengeId)
      .order("selected_at", { ascending: false })
      .limit(100),
    admin.adminClient
      .from("challenge_ops_events")
      .select("*")
      .eq("challenge_id", challengeId)
      .order("created_at", { ascending: false })
      .limit(200),
  ])

  if (winnersResponse.error || opsResponse.error) {
    return NextResponse.json(
      { error: winnersResponse.error?.message ?? opsResponse.error?.message ?? "Failed to load challenge ops." },
      { status: 400 },
    )
  }

  return NextResponse.json({
    challengeId,
    winners: winnersResponse.data ?? [],
    events: opsResponse.data ?? [],
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ challengeId: string }> },
) {
  const admin = await getAdminContext()
  if ("error" in admin) return admin.error

  try {
    const { challengeId } = await params
    const body = (await request.json()) as ChallengeOpsBody

    if (!body.action) {
      return NextResponse.json({ error: "action is required." }, { status: 400 })
    }

    if (!body.mashupId) {
      return NextResponse.json({ error: "mashupId is required." }, { status: 400 })
    }

    let winnerResponse:
      | { data: Record<string, unknown> | null; error: { message: string } | null }
      | null = null

    if (body.action === "select_winner") {
      const { data, error } = await admin.adminClient
        .from("challenge_winners")
        .upsert(
          {
            challenge_id: challengeId,
            mashup_id: body.mashupId,
            creator_id: body.creatorId ?? null,
            prize_cents:
              typeof body.prizeCents === "number" ? Math.max(0, Math.round(body.prizeCents)) : null,
            payout_status: "pending",
            sponsor_fulfillment_status: "pending",
            payout_reference: body.payoutReference ?? null,
            selected_by: admin.userId,
            selected_at: new Date().toISOString(),
          },
          { onConflict: "challenge_id,mashup_id" },
        )
        .select("*")
        .single()
      winnerResponse = { data: (data as Record<string, unknown> | null) ?? null, error }
    }

    if (body.action === "mark_payout") {
      if (!isPayoutStatus(body.payoutStatus)) {
        return NextResponse.json(
          { error: "payoutStatus must be pending, paid, or failed." },
          { status: 400 },
        )
      }
      const { data, error } = await admin.adminClient
        .from("challenge_winners")
        .update({
          payout_status: body.payoutStatus,
          payout_reference: body.payoutReference ?? null,
        })
        .eq("challenge_id", challengeId)
        .eq("mashup_id", body.mashupId)
        .select("*")
        .single()
      winnerResponse = { data: (data as Record<string, unknown> | null) ?? null, error }
    }

    if (body.action === "mark_fulfillment") {
      if (!isSponsorFulfillmentStatus(body.sponsorFulfillmentStatus)) {
        return NextResponse.json(
          { error: "sponsorFulfillmentStatus must be pending or fulfilled." },
          { status: 400 },
        )
      }
      const { data, error } = await admin.adminClient
        .from("challenge_winners")
        .update({
          sponsor_fulfillment_status: body.sponsorFulfillmentStatus,
        })
        .eq("challenge_id", challengeId)
        .eq("mashup_id", body.mashupId)
        .select("*")
        .single()
      winnerResponse = { data: (data as Record<string, unknown> | null) ?? null, error }
    }

    if (!winnerResponse) {
      return NextResponse.json({ error: "Unsupported action." }, { status: 400 })
    }

    if (winnerResponse.error) {
      return NextResponse.json({ error: winnerResponse.error.message }, { status: 400 })
    }

    await admin.adminClient.from("challenge_ops_events").insert({
      challenge_id: challengeId,
      action: body.action,
      actor_id: admin.userId,
      payload: {
        mashupId: body.mashupId,
        creatorId: body.creatorId ?? null,
        prizeCents: body.prizeCents ?? null,
        payoutStatus: body.payoutStatus ?? null,
        sponsorFulfillmentStatus: body.sponsorFulfillmentStatus ?? null,
        payoutReference: body.payoutReference ?? null,
        note: body.note ?? null,
      },
    })

    return NextResponse.json({
      ok: true,
      challengeId,
      action: body.action,
      winner: winnerResponse.data,
    })
  } catch {
    return NextResponse.json({ error: "Invalid challenge ops payload." }, { status: 400 })
  }
}
