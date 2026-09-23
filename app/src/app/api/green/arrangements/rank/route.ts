import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { buildGreenArrangementPlans } from "@/lib/audio/green-arrangements"
import { rankGreenArrangements } from "@/lib/ai/jev-ranking"
import {
  assessGreenPair,
  getGreenTrack,
} from "@/lib/catalog/green-catalog"
import {
  consumeRateLimit,
  resolveRateLimitKey,
} from "@/lib/security/rate-limit"

const requestSchema = z.object({
  leftId: z.string().trim().min(1).max(120),
  rightId: z.string().trim().min(1).max(120),
})

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Green Room pair." }, { status: 400 })
  }

  const left = getGreenTrack(parsed.data.leftId)
  const right = getGreenTrack(parsed.data.rightId)
  if (!left || !right || left.id === right.id) {
    return NextResponse.json({ error: "Unknown Green Room pair." }, { status: 404 })
  }

  const assessment = assessGreenPair(left, right)
  if (!assessment.compatible) {
    return NextResponse.json(
      {
        error: "Pair does not clear deterministic Green Room preflight.",
        reasons: assessment.reasons,
      },
      { status: 409 },
    )
  }

  const plans = buildGreenArrangementPlans(left, right, assessment)
  const rate = await consumeRateLimit({
    key: resolveRateLimitKey(request, "jev-green-arrangement-rank"),
    limit: 30,
    windowMs: 60 * 60 * 1000,
  })

  if (!rate.allowed) {
    return NextResponse.json({
      order: plans.map((plan) => plan.id),
      jev: {
        specVersion: "jev-decision-spec/v1",
        evaluatorVersion: "mashups-arrangement-rank-v1",
        mode: "off",
        totalCostUsd: 0,
        latencyMs: 0,
        fallback: true,
        reason: rate.unavailable ? "rate_limiter_unavailable" : "rate_limited",
      },
    })
  }

  const ranked = await rankGreenArrangements(left, right, assessment, plans)
  return NextResponse.json({
    order: ranked.order,
    jev: ranked.summary,
    decisions: ranked.decisions,
  })
}
