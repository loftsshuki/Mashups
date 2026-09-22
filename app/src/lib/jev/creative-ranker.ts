import { decisionTelemetry, JEV_DECISION_MODES, resolveRank, type JevDecisionMode } from "@/lib/jev-decision-kit";

const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/evaluate";
const MODEL = "typesafe-ai/jev";

type Level = "low" | "medium" | "high";
type Risk = "no" | "uncertain" | "yes";

export interface SuggestionCandidate {
  id: string;
  type: "structural" | "stem" | "effect";
  title: string;
  description: string;
  confidence: number;
}

export interface SuggestionMashupState {
  stems?: Array<{ instrument?: string; title?: string }>;
  bpm?: number;
  key?: string;
  genre?: string;
}

export interface RankedSuggestion extends SuggestionCandidate {
  jev?: {
    effectiveScore: number;
    usefulness: Level;
    actionability: Level;
    specificity: Level;
    externalSourceRisk: Risk;
    confidence?: number;
    decision: ReturnType<typeof decisionTelemetry>;
  };
}

export interface ArrangementCandidate {
  id: string;
  title: string;
  description: string;
  qualityScore: number;
  sidechainDuckDb: number;
  segments: Array<{
    name: string;
    startBar: number;
    bars: number;
    grooveSource: string | null;
    harmonySource: string | null;
    toplineSource: string | null;
    transition: string;
  }>;
}

export interface ArrangementContext {
  left: { id: string; title: string; artist: string; bpm: number; key: string; genre: string };
  right: { id: string; title: string; artist: string; bpm: number; key: string; genre: string };
  assessment: {
    compatible: boolean;
    score: number;
    tempoDelta: number;
    warpPercent: number;
    harmonicFit: string;
    vocalCollisionRisk: string;
    reasons: string[];
  };
}

export interface RankedArrangement extends ArrangementCandidate {
  jev?: {
    effectiveScore: number;
    structuralPromise: Level;
    distinctiveness: Level;
    explainability: Level;
    confidence?: number;
    decision: ReturnType<typeof decisionTelemetry>;
  };
}

const LEVEL_SCORE: Record<Level, number> = { low: 30, medium: 68, high: 95 };
const RISK_PENALTY: Record<Risk, number> = { no: 0, uncertain: 8, yes: 22 };

function modeFor(name: string, fallback: JevDecisionMode = "assist"): JevDecisionMode {
  const enabled = !["0", "false", "off", "no"].includes(
    (process.env.MASHUPS_JEV_ENABLED ?? "true").trim().toLowerCase(),
  );
  if (!enabled) return "off";
  const raw = (process.env[name] ?? fallback).trim().toLowerCase();
  return JEV_DECISION_MODES.includes(raw as JevDecisionMode)
    ? raw as JevDecisionMode
    : fallback;
}

function threshold(): number {
  const value = Number(process.env.MASHUPS_JEV_CONFIDENCE ?? "0.8");
  return Number.isFinite(value) ? Math.max(0.5, Math.min(0.99, value)) : 0.8;
}

function gatewayToken(explicit?: string): string {
  return explicit
    || process.env.AI_GATEWAY_API_KEY?.trim()
    || process.env.VERCEL_OIDC_TOKEN?.trim()
    || "";
}

function choice(value: unknown): { choice: string; probability: number | null } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (raw.type !== "choice" || typeof raw.choice !== "string") return null;
  const probabilities =
    raw.probabilities && typeof raw.probabilities === "object" && !Array.isArray(raw.probabilities)
      ? raw.probabilities as Record<string, unknown>
      : {};
  const probability = Number(probabilities[raw.choice]);
  return {
    choice: raw.choice,
    probability: Number.isFinite(probability)
      ? Math.max(0, Math.min(1, probability))
      : null,
  };
}

function minConfidence(values: Array<number | null>): number | null {
  const valid = values.filter((value): value is number => value !== null);
  return valid.length ? Math.min(...valid) : null;
}

function gatewayMeta(data: Record<string, unknown>) {
  const provider =
    data.providerMetadata && typeof data.providerMetadata === "object"
      ? data.providerMetadata as Record<string, unknown>
      : {};
  const gateway =
    provider.gateway && typeof provider.gateway === "object"
      ? provider.gateway as Record<string, unknown>
      : {};
  const cost = Number(gateway.gatewayCost ?? gateway.cost ?? 0);
  return {
    costUsd: Number.isFinite(cost) && cost >= 0 ? cost : 0,
    generationId:
      typeof gateway.generationId === "string"
        ? gateway.generationId
        : undefined,
  };
}

async function evaluate(
  state: Record<string, unknown>,
  questions: Record<string, unknown>,
  options: { token: string; fetchImpl: typeof fetch },
) {
  const started = Date.now();
  const response = await options.fetchImpl(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      state,
      questions,
      providerOptions: {
        gateway: {
          zeroDataRetention: true,
          only: ["typesafe-ai"],
          tags: ["mashups", "creative-rank", "jev-decision-spec-v1"],
        },
      },
    }),
    signal: AbortSignal.timeout(8_000),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Jev creative ranking failed (${response.status}): ${text.slice(0, 240)}`);
  }
  const data = JSON.parse(text) as Record<string, unknown>;
  return {
    data,
    latencyMs: Date.now() - started,
    ...gatewayMeta(data),
  };
}

export async function rankSuggestions(
  suggestions: SuggestionCandidate[],
  mashupState: SuggestionMashupState,
  options: { token?: string; fetchImpl?: typeof fetch } = {},
): Promise<RankedSuggestion[]> {
  const mode = modeFor("MASHUPS_JEV_SUGGESTION_MODE");
  if (mode === "off" || suggestions.length < 2) return suggestions;

  const token = gatewayToken(options.token);
  if (!token) return suggestions;
  const questions: Record<string, unknown> = {};
  suggestions.forEach((suggestion, index) => {
    questions[`usefulness_${index}`] = {
      type: "choice",
      instructions:
        `How useful is suggestion ${index} for materially improving this mashup rather than merely changing it?`,
      criteria: {
        low: "Little likely musical or production value.",
        medium: "Plausibly useful improvement.",
        high: "Strong, targeted improvement with meaningful musical/production value.",
      },
    };
    questions[`actionability_${index}`] = {
      type: "choice",
      instructions:
        `How actionable is suggestion ${index} from the description alone?`,
      criteria: {
        low: "Vague, underspecified, or difficult to execute.",
        medium: "Executable with normal producer judgment.",
        high: "Specific enough to implement and assess directly.",
      },
    };
    questions[`specificity_${index}`] = {
      type: "choice",
      instructions:
        `How specific is suggestion ${index} to the supplied mashup state?`,
      criteria: {
        low: "Generic advice that could apply to almost any project.",
        medium: "Some connection to the supplied state.",
        high: "Clearly grounded in the supplied stems, BPM, key, genre, or arrangement state.",
      },
    };
    questions[`external_${index}`] = {
      type: "choice",
      instructions:
        `Does suggestion ${index} appear to require an external uncleared recording/sample/source? This is only triage; rights systems remain authoritative.`,
      criteria: {
        no: "Can be implemented with current project material or ordinary processing.",
        uncertain: "Could require new source material depending on implementation.",
        yes: "Explicitly depends on adding/replacing with external recorded material.",
      },
    };
  });

  try {
    const result = await evaluate(
      {
        mashupState,
        suggestions: suggestions.map(({ id, type, title, description }) => ({
          id,
          type,
          title,
          description,
        })),
      },
      questions,
      { token, fetchImpl: options.fetchImpl ?? fetch },
    );
    const answers =
      result.data.answers && typeof result.data.answers === "object"
        ? result.data.answers as Record<string, unknown>
        : {};
    const perCandidateCost = suggestions.length ? result.costUsd / suggestions.length : 0;

    const ranked = suggestions.map((suggestion, index): RankedSuggestion => {
      const usefulness = choice(answers[`usefulness_${index}`]);
      const actionability = choice(answers[`actionability_${index}`]);
      const specificity = choice(answers[`specificity_${index}`]);
      const external = choice(answers[`external_${index}`]);
      if (!usefulness || !actionability || !specificity || !external) return suggestion;
      if (
        !["low", "medium", "high"].includes(usefulness.choice)
        || !["low", "medium", "high"].includes(actionability.choice)
        || !["low", "medium", "high"].includes(specificity.choice)
        || !["no", "uncertain", "yes"].includes(external.choice)
      ) return suggestion;

      const u = usefulness.choice as Level;
      const a = actionability.choice as Level;
      const s = specificity.choice as Level;
      const risk = external.choice as Risk;
      const jevScore = Math.max(
        0,
        Math.round((LEVEL_SCORE[u] + LEVEL_SCORE[a] + LEVEL_SCORE[s]) / 3 - RISK_PENALTY[risk]),
      );
      const confidence = minConfidence([
        usefulness.probability,
        actionability.probability,
        specificity.probability,
        external.probability,
      ]);
      const baselineScore = Math.round(suggestion.confidence * 100);
      const resolved = resolveRank({
        mode,
        baselineScore,
        jevScore,
        confidence,
        threshold: threshold(),
      });
      return {
        ...suggestion,
        jev: {
          effectiveScore: resolved.score,
          usefulness: u,
          actionability: a,
          specificity: s,
          externalSourceRisk: risk,
          ...(confidence === null ? {} : { confidence }),
          decision: decisionTelemetry({
            key: "ai-suggestion-rank",
            mode,
            baselineScore,
            effectiveScore: resolved.score,
            action: resolved.action,
            answer: { usefulness: u, actionability: a, specificity: s, externalSourceRisk: risk },
            confidence,
            latencyMs: result.latencyMs,
            costUsd: perCandidateCost,
            generationId: result.generationId,
            evaluatorVersion: "mashups-suggestion-rank-v1",
          }),
        },
      };
    });

    if (mode === "shadow") return ranked;
    return [...ranked].sort(
      (left, right) =>
        (right.jev?.effectiveScore ?? Math.round(right.confidence * 100))
        - (left.jev?.effectiveScore ?? Math.round(left.confidence * 100)),
    );
  } catch {
    return suggestions;
  }
}

export async function rankArrangements(
  arrangements: ArrangementCandidate[],
  context: ArrangementContext,
  options: { token?: string; fetchImpl?: typeof fetch } = {},
): Promise<RankedArrangement[]> {
  const mode = modeFor("MASHUPS_JEV_ARRANGEMENT_MODE");
  if (mode === "off" || arrangements.length < 2) return arrangements;
  const token = gatewayToken(options.token);
  if (!token) return arrangements;

  const questions: Record<string, unknown> = {};
  arrangements.forEach((arrangement, index) => {
    questions[`promise_${index}`] = {
      type: "choice",
      instructions:
        `Based only on metadata/structure, how promising is arrangement ${index} as a creative mashup experiment? Do not pretend to hear audio.`,
      criteria: {
        low: "Structurally weak or unlikely to create useful contrast.",
        medium: "Plausible experiment with ordinary creative promise.",
        high: "Clear structural idea with strong metadata-level promise.",
      },
    };
    questions[`distinct_${index}`] = {
      type: "choice",
      instructions:
        `How distinct is arrangement ${index} from the other arrangement plans?`,
      criteria: {
        low: "Mostly cosmetic relative to the alternatives.",
        medium: "Some meaningful structural difference.",
        high: "Clearly tests a different musical/arrangement hypothesis.",
      },
    };
    questions[`explain_${index}`] = {
      type: "choice",
      instructions:
        `How interpretable is arrangement ${index} as an experiment a listener can compare against the others?`,
      criteria: {
        low: "Hard to explain what changed or why.",
        medium: "Reasonably interpretable.",
        high: "Very clear structural hypothesis and comparison value.",
      },
    };
  });

  try {
    const result = await evaluate(
      { context, arrangements },
      questions,
      { token, fetchImpl: options.fetchImpl ?? fetch },
    );
    const answers =
      result.data.answers && typeof result.data.answers === "object"
        ? result.data.answers as Record<string, unknown>
        : {};
    const perCandidateCost = arrangements.length ? result.costUsd / arrangements.length : 0;

    const ranked = arrangements.map((arrangement, index): RankedArrangement => {
      const promise = choice(answers[`promise_${index}`]);
      const distinct = choice(answers[`distinct_${index}`]);
      const explain = choice(answers[`explain_${index}`]);
      if (!promise || !distinct || !explain) return arrangement;
      if (
        !["low", "medium", "high"].includes(promise.choice)
        || !["low", "medium", "high"].includes(distinct.choice)
        || !["low", "medium", "high"].includes(explain.choice)
      ) return arrangement;

      const p = promise.choice as Level;
      const d = distinct.choice as Level;
      const e = explain.choice as Level;
      const jevScore = Math.round((LEVEL_SCORE[p] + LEVEL_SCORE[d] + LEVEL_SCORE[e]) / 3);
      const confidence = minConfidence([
        promise.probability,
        distinct.probability,
        explain.probability,
      ]);
      const resolved = resolveRank({
        mode,
        baselineScore: arrangement.qualityScore,
        jevScore,
        confidence,
        threshold: threshold(),
      });
      return {
        ...arrangement,
        jev: {
          effectiveScore: resolved.score,
          structuralPromise: p,
          distinctiveness: d,
          explainability: e,
          ...(confidence === null ? {} : { confidence }),
          decision: decisionTelemetry({
            key: "green-arrangement-rank",
            mode,
            baselineScore: arrangement.qualityScore,
            effectiveScore: resolved.score,
            action: resolved.action,
            answer: { structuralPromise: p, distinctiveness: d, explainability: e },
            confidence,
            latencyMs: result.latencyMs,
            costUsd: perCandidateCost,
            generationId: result.generationId,
            evaluatorVersion: "mashups-green-arrangement-rank-v1",
          }),
        },
      };
    });

    if (mode === "shadow") return ranked;
    return [...ranked].sort(
      (left, right) =>
        (right.jev?.effectiveScore ?? right.qualityScore)
        - (left.jev?.effectiveScore ?? left.qualityScore),
    );
  } catch {
    return arrangements;
  }
}
