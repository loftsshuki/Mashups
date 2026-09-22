import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { buildGreenArrangementPlans } from "@/lib/audio/green-arrangements";
import {
  assessGreenPair,
  getGreenTrack,
} from "@/lib/catalog/green-catalog";
import { rankArrangements } from "@/lib/jev/creative-ranker";

const requestSchema = z.object({
  leftId: z.string().min(1).max(120),
  rightId: z.string().min(1).max(120),
});

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Green Room pair." }, { status: 400 });
  }

  const left = getGreenTrack(parsed.data.leftId);
  const right = getGreenTrack(parsed.data.rightId);
  if (!left || !right || left.id === right.id) {
    return NextResponse.json({ error: "Unknown Green Room source." }, { status: 404 });
  }

  const assessment = assessGreenPair(left, right);
  if (!assessment.compatible) {
    return NextResponse.json({
      error: "Pair does not clear deterministic Green Room compatibility.",
      reasons: assessment.reasons,
    }, { status: 409 });
  }

  const plans = buildGreenArrangementPlans(left, right, assessment);
  const ranked = await rankArrangements(plans, {
    left: {
      id: left.id,
      title: left.title,
      artist: left.artist,
      bpm: left.bpm,
      key: left.key,
      genre: left.genre,
    },
    right: {
      id: right.id,
      title: right.title,
      artist: right.artist,
      bpm: right.bpm,
      key: right.key,
      genre: right.genre,
    },
    assessment: {
      compatible: assessment.compatible,
      score: assessment.score,
      tempoDelta: assessment.tempoDelta,
      warpPercent: assessment.warpPercent,
      harmonicFit: assessment.harmonicFit,
      vocalCollisionRisk: assessment.vocalCollisionRisk,
      reasons: assessment.reasons,
    },
  });

  return NextResponse.json({
    orderedStyles: ranked.map((plan) => plan.id),
    rankings: ranked.map((plan) => ({
      id: plan.id,
      baselineScore: plan.qualityScore,
      ...(plan.jev ? { jev: plan.jev } : {}),
    })),
    note:
      "Metadata-only creative ranking. Rights, compatibility, render quality, and listening remain authoritative elsewhere.",
  }, {
    headers: { "cache-control": "no-store" },
  });
}
