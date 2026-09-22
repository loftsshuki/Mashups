export const JEV_DECISION_SPEC_VERSION = "jev-decision-spec/v1" as const;
export const JEV_DECISION_MODES = ["off", "shadow", "assist", "enforce"] as const;
export type JevDecisionMode = (typeof JEV_DECISION_MODES)[number];

function confident(confidence: number | null | undefined, threshold = 0.8) {
  return confidence !== null && confidence !== undefined && confidence >= threshold;
}

function baseAction(mode: JevDecisionMode, isConfident: boolean) {
  if (mode === "off") return "baseline" as const;
  if (mode === "shadow") return "observed" as const;
  return isConfident ? "preserved" as const : "fallback" as const;
}

export function resolveRank(input: {
  mode: JevDecisionMode;
  baselineScore: number;
  jevScore: number | null;
  confidence: number | null;
  threshold?: number;
}) {
  const baseline = Math.max(0, Math.min(100, input.baselineScore));
  const isConfident = confident(input.confidence, input.threshold);

  if (
    input.jevScore === null ||
    !isConfident ||
    input.mode === "off" ||
    input.mode === "shadow"
  ) {
    return { score: baseline, action: baseAction(input.mode, isConfident) };
  }

  const jev = Math.max(0, Math.min(100, input.jevScore));
  if (input.mode === "assist") {
    const score = Math.max(baseline, jev);
    return {
      score,
      action: score > baseline ? "promoted" as const : "preserved" as const,
    };
  }

  return {
    score: jev,
    action:
      jev === baseline
        ? "preserved" as const
        : jev > baseline
          ? "promoted" as const
          : "suppressed" as const,
  };
}

export function decisionTelemetry<TAnswer>(input: {
  key: string;
  mode: JevDecisionMode;
  baselineScore: number;
  effectiveScore: number;
  action: string;
  answer?: TAnswer;
  confidence?: number | null;
  probabilities?: Record<string, number>;
  latencyMs?: number;
  costUsd?: number;
  generationId?: string;
  evaluatorVersion?: string;
  error?: string;
}) {
  return {
    specVersion: JEV_DECISION_SPEC_VERSION,
    primitive: "rank" as const,
    key: input.key,
    mode: input.mode,
    baselineDecision: input.baselineScore,
    effectiveDecision: input.effectiveScore,
    action: input.action,
    ...(input.answer === undefined ? {} : { answer: input.answer }),
    ...(input.confidence === null || input.confidence === undefined
      ? {}
      : { confidence: input.confidence }),
    ...(input.probabilities ? { probabilities: input.probabilities } : {}),
    ...(input.latencyMs === undefined ? {} : { latencyMs: input.latencyMs }),
    ...(input.costUsd === undefined ? {} : { costUsd: input.costUsd }),
    ...(input.generationId ? { generationId: input.generationId } : {}),
    ...(input.evaluatorVersion ? { evaluatorVersion: input.evaluatorVersion } : {}),
    ...(input.error ? { error: input.error } : {}),
  };
}
