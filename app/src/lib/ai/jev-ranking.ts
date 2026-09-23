import "server-only"

import type { GreenArrangementPlan } from "@/lib/audio/green-arrangements"
import type {
  GreenCatalogTrack,
  GreenPairAssessment,
} from "@/lib/catalog/green-catalog"
import {
  JEV_DECISION_MODES,
  JEV_DECISION_SPEC_VERSION,
  jevDecisionTelemetry,
  resolveRank,
  resolveShortlist,
  type JevDecisionMode,
} from "@/lib/ai/jev-decision-kit"

export interface ProductionSuggestion {
  type: "structural" | "stem" | "effect"
  title: string
  description: string
  confidence: number
}

export interface SuggestionRankingResult {
  suggestions: Array<ProductionSuggestion & {
    jev?: {
      effectiveScore: number
      selected: boolean
      confidence?: number
      decisions: {
        rank: ReturnType<typeof jevDecisionTelemetry>
        shortlist: ReturnType<typeof jevDecisionTelemetry>
      }
    }
  }>
  summary: {
    specVersion: typeof JEV_DECISION_SPEC_VERSION
    evaluatorVersion: "mashups-suggestion-shortlist-v1"
    mode: JevDecisionMode
    generatedCount: number
    returnedCount: number
    totalCostUsd: number
    latencyMs: number
    fallback: boolean
  }
}

export interface ArrangementRankingResult {
  order: string[]
  summary: {
    specVersion: typeof JEV_DECISION_SPEC_VERSION
    evaluatorVersion: "mashups-arrangement-rank-v1"
    mode: JevDecisionMode
    totalCostUsd: number
    latencyMs: number
    fallback: boolean
  }
  decisions: Array<{
    id: string
    effectiveScore: number
    confidence?: number
    decision: ReturnType<typeof jevDecisionTelemetry>
  }>
}

const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/evaluate"
const MODEL = "typesafe-ai/jev"

function enabled(env: NodeJS.ProcessEnv = process.env) {
  return !["0", "false", "off", "no"].includes(
    (env.MASHUPS_JEV_ENABLED ?? "true").trim().toLowerCase(),
  )
}

function modeFromEnv(
  name: "MASHUPS_JEV_SUGGEST_MODE" | "MASHUPS_JEV_ARRANGEMENT_MODE",
  fallback: JevDecisionMode = "assist",
  env: NodeJS.ProcessEnv = process.env,
): JevDecisionMode {
  if (!enabled(env)) return "off"
  const value = (env[name] ?? fallback).trim().toLowerCase()
  return JEV_DECISION_MODES.includes(value as JevDecisionMode)
    ? value as JevDecisionMode
    : fallback
}

function threshold(env: NodeJS.ProcessEnv = process.env) {
  const value = Number(env.MASHUPS_JEV_CONFIDENCE ?? "0.8")
  return Number.isFinite(value)
    ? Math.max(0.5, Math.min(0.99, value))
    : 0.8
}

function gatewayToken(explicit?: string) {
  return explicit
    || process.env.AI_GATEWAY_API_KEY?.trim()
    || process.env.VERCEL_OIDC_TOKEN?.trim()
    || ""
}

function choice(value: unknown): { choice: string; probability: number | null } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const raw = value as Record<string, unknown>
  if (raw.type !== "choice" || typeof raw.choice !== "string") return null
  const probabilities =
    raw.probabilities
    && typeof raw.probabilities === "object"
    && !Array.isArray(raw.probabilities)
      ? raw.probabilities as Record<string, unknown>
      : {}
  const probability = Number(probabilities[raw.choice])
  return {
    choice: raw.choice,
    probability: Number.isFinite(probability)
      ? Math.max(0, Math.min(1, probability))
      : null,
  }
}

function boundedText(value: unknown, max: number) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? {})
  return text.length <= max ? text : `${text.slice(0, max - 24)}\n...[clipped]...`
}

function baselineSuggestionResult(
  suggestions: ProductionSuggestion[],
  mode: JevDecisionMode,
  returnedCount: number,
  error?: string,
): SuggestionRankingResult {
  return {
    suggestions: suggestions.slice(0, returnedCount).map((suggestion, index) => {
      const baselineScore = Math.round(suggestion.confidence * 100)
      return {
        ...suggestion,
        jev: {
          effectiveScore: baselineScore,
          selected: true,
          decisions: {
            rank: jevDecisionTelemetry({
              primitive: "rank",
              key: "production-suggestion-rank",
              mode,
              baselineDecision: baselineScore,
              effectiveDecision: baselineScore,
              action: error ? "fallback" : mode === "shadow" ? "observed" : "baseline",
              evaluatorVersion: "mashups-suggestion-shortlist-v1",
              error,
            }),
            shortlist: jevDecisionTelemetry({
              primitive: "shortlist",
              key: "production-suggestion-shortlist",
              mode,
              baselineDecision: index < returnedCount,
              effectiveDecision: index < returnedCount,
              action: error ? "fallback" : mode === "shadow" ? "observed" : "baseline",
              evaluatorVersion: "mashups-suggestion-shortlist-v1",
              error,
            }),
          },
        },
      }
    }),
    summary: {
      specVersion: JEV_DECISION_SPEC_VERSION,
      evaluatorVersion: "mashups-suggestion-shortlist-v1",
      mode,
      generatedCount: suggestions.length,
      returnedCount: Math.min(returnedCount, suggestions.length),
      totalCostUsd: 0,
      latencyMs: 0,
      fallback: Boolean(error),
    },
  }
}

export async function prioritizeProductionSuggestions(
  suggestions: ProductionSuggestion[],
  mashupState: {
    stems?: Array<{ instrument?: string; title?: string }>
    bpm?: number
    key?: string
    genre?: string
  },
  options: {
    returnedCount?: number
    token?: string
    fetchImpl?: typeof fetch
    env?: NodeJS.ProcessEnv
  } = {},
): Promise<SuggestionRankingResult> {
  const env = options.env ?? process.env
  const mode = modeFromEnv("MASHUPS_JEV_SUGGEST_MODE", "assist", env)
  const returnedCount = Math.max(
    1,
    Math.min(options.returnedCount ?? 3, suggestions.length),
  )

  if (mode === "off" || suggestions.length <= returnedCount) {
    return baselineSuggestionResult(suggestions, mode, returnedCount)
  }

  const token = gatewayToken(options.token)
  if (!token) {
    return baselineSuggestionResult(
      suggestions,
      mode,
      returnedCount,
      "Jev authentication unavailable",
    )
  }

  const started = Date.now()
  const questions: Record<string, unknown> = {}
  suggestions.forEach((suggestion, index) => {
    questions[`usefulness_${index}`] = {
      type: "choice",
      instructions:
        "How useful/actionable is this production suggestion for the supplied mashup state?",
      criteria: {
        low: "Generic, vague, irrelevant, or unlikely to improve the project.",
        medium: "Plausible and usable, but not especially high leverage.",
        high: "Specific, actionable, and likely worth trying in this project.",
      },
    }
    questions[`specificity_${index}`] = {
      type: "choice",
      instructions:
        "How specifically is this suggestion grounded in the supplied mashup state rather than generic production advice?",
      criteria: {
        low: "Could be pasted into almost any music project.",
        medium: "Partly grounded in the project but still somewhat generic.",
        high: "Clearly references the project state, structure, stems, tempo, key, or production context.",
      },
    }
    questions[`coherence_${index}`] = {
      type: "choice",
      instructions:
        "Based on metadata/text only, how musically coherent is the proposed technique? Do not claim to hear audio.",
      criteria: {
        low: "Likely incoherent, contradictory to the state, or technically dubious.",
        medium: "Plausible but context-dependent.",
        high: "Technically coherent and appropriate for the described state.",
      },
    }
    questions[`redundancy_${index}`] = {
      type: "choice",
      instructions:
        "Compared with the other generated suggestions, how redundant is this idea?",
      criteria: {
        distinct: "Meaningfully different intervention from the other suggestions.",
        overlapping: "Some overlap, but still provides a distinct useful action.",
        duplicate: "Substantially repeats another suggestion with little additional value.",
      },
    }
    questions[`shortlist_${index}`] = {
      type: "choice",
      instructions:
        "Does this deserve one of the final production-suggestion slots shown to the user?",
      criteria: {
        yes: "Strong enough to deserve a final slot.",
        no: "Too weak, generic, redundant, or irrelevant for the final shortlist.",
        uncertain: "Potentially useful but confidence is too low to silently remove it.",
      },
    }
  })

  try {
    const response = await (options.fetchImpl ?? fetch)(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        state: {
          mashupState: {
            stems: (mashupState.stems ?? []).slice(0, 24),
            bpm: mashupState.bpm ?? null,
            key: mashupState.key ?? null,
            genre: mashupState.genre ?? null,
          },
          suggestions: suggestions.map((suggestion, index) => ({
            index,
            type: suggestion.type,
            title: suggestion.title,
            description: boundedText(suggestion.description, 320),
            baselineConfidence: suggestion.confidence,
          })),
        },
        questions,
        providerOptions: {
          gateway: {
            zeroDataRetention: true,
            only: ["typesafe-ai"],
            tags: [
              "mashups",
              "production-suggestions",
              "jev-decision-spec-v1",
            ],
          },
        },
      }),
      signal: AbortSignal.timeout(8_000),
    })

    const text = await response.text()
    if (!response.ok) {
      throw new Error(
        `Jev suggestion evaluation failed (${response.status}): ${text.slice(0, 200)}`,
      )
    }

    const data = JSON.parse(text) as Record<string, unknown>
    const answers =
      data.answers && typeof data.answers === "object" && !Array.isArray(data.answers)
        ? data.answers as Record<string, unknown>
        : {}
    const provider =
      data.providerMetadata && typeof data.providerMetadata === "object"
        ? data.providerMetadata as Record<string, unknown>
        : {}
    const gateway =
      provider.gateway && typeof provider.gateway === "object"
        ? provider.gateway as Record<string, unknown>
        : {}
    const rawCost = Number(gateway.gatewayCost ?? gateway.cost ?? 0)
    const totalCostUsd = Number.isFinite(rawCost) && rawCost >= 0 ? rawCost : 0
    const latencyMs = Date.now() - started
    const generationId =
      typeof gateway.generationId === "string"
        ? gateway.generationId
        : undefined
    const minimum = threshold(env)

    const evaluated = suggestions.map((suggestion, index) => {
      const usefulness = choice(answers[`usefulness_${index}`])
      const specificity = choice(answers[`specificity_${index}`])
      const coherence = choice(answers[`coherence_${index}`])
      const redundancy = choice(answers[`redundancy_${index}`])
      const shortlistAnswer = choice(answers[`shortlist_${index}`])

      if (!usefulness || !specificity || !coherence || !redundancy || !shortlistAnswer) {
        const baselineScore = Math.round(suggestion.confidence * 100)
        return {
          suggestion,
          index,
          baselineSelected: index < returnedCount,
          effectiveScore: baselineScore,
          selected: index < returnedCount,
          confidence: null as number | null,
          decisions: {
            rank: jevDecisionTelemetry({
              primitive: "rank",
              key: "production-suggestion-rank",
              mode,
              baselineDecision: baselineScore,
              effectiveDecision: baselineScore,
              action: "fallback",
              evaluatorVersion: "mashups-suggestion-shortlist-v1",
              error: "Incomplete Jev suggestion answers",
            }),
            shortlist: jevDecisionTelemetry({
              primitive: "shortlist",
              key: "production-suggestion-shortlist",
              mode,
              baselineDecision: index < returnedCount,
              effectiveDecision: index < returnedCount,
              action: "fallback",
              evaluatorVersion: "mashups-suggestion-shortlist-v1",
              error: "Incomplete Jev suggestion answers",
            }),
          },
        }
      }

      const levelScore = (value: string) =>
        value === "high" ? 95 : value === "medium" ? 65 : 25
      const redundancyAdjustment =
        redundancy.choice === "distinct"
          ? 5
          : redundancy.choice === "overlapping"
            ? -5
            : -25
      const rawScore = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            (
              levelScore(usefulness.choice)
              + levelScore(specificity.choice)
              + levelScore(coherence.choice)
            ) / 3 + redundancyAdjustment,
          ),
        ),
      )
      const probabilities = [
        usefulness.probability,
        specificity.probability,
        coherence.probability,
        redundancy.probability,
        shortlistAnswer.probability,
      ].filter((value): value is number => value !== null)
      const confidence = probabilities.length ? Math.min(...probabilities) : null
      const baselineScore = Math.round(suggestion.confidence * 100)
      const rank = resolveRank({
        mode,
        baselineScore,
        jevScore: rawScore,
        confidence,
        threshold: minimum,
      })
      const requested =
        shortlistAnswer.choice === "yes"
          ? true
          : shortlistAnswer.choice === "no"
            ? false
            : null
      const shortlist = resolveShortlist({
        mode,
        baselineSelected: index < returnedCount,
        jevSelected:
          redundancy.choice === "duplicate" ? false : requested,
        confidence,
        threshold: minimum,
      })
      const shared = {
        confidence,
        probabilities: {
          ...(usefulness.probability === null ? {} : { usefulness: usefulness.probability }),
          ...(specificity.probability === null ? {} : { specificity: specificity.probability }),
          ...(coherence.probability === null ? {} : { coherence: coherence.probability }),
          ...(redundancy.probability === null ? {} : { redundancy: redundancy.probability }),
          ...(shortlistAnswer.probability === null
            ? {}
            : { shortlist: shortlistAnswer.probability }),
        },
        latencyMs,
        generationId,
        evaluatorVersion: "mashups-suggestion-shortlist-v1",
      }

      return {
        suggestion,
        index,
        baselineSelected: index < returnedCount,
        effectiveScore: rank.score,
        selected: shortlist.selected,
        confidence,
        decisions: {
          rank: jevDecisionTelemetry({
            primitive: "rank",
            key: "production-suggestion-rank",
            mode,
            baselineDecision: baselineScore,
            effectiveDecision: rank.score,
            action: rank.action,
            answer: {
              rawScore,
              usefulness: usefulness.choice,
              specificity: specificity.choice,
              coherence: coherence.choice,
              redundancy: redundancy.choice,
            },
            costUsd: totalCostUsd / suggestions.length,
            ...shared,
          }),
          shortlist: jevDecisionTelemetry({
            primitive: "shortlist",
            key: "production-suggestion-shortlist",
            mode,
            baselineDecision: index < returnedCount,
            effectiveDecision: shortlist.selected,
            action: shortlist.action,
            answer: {
              requested,
              redundancy: redundancy.choice,
            },
            ...shared,
          }),
        },
      }
    })

    let finalRows = evaluated
    if (mode === "off" || mode === "shadow") {
      finalRows = evaluated.filter((row) => row.baselineSelected)
    } else if (mode === "assist") {
      // Assist must not evict a baseline suggestion to make room for a Jev addition.
      finalRows = evaluated
        .filter((row) => row.baselineSelected)
        .sort((a, b) => b.effectiveScore - a.effectiveScore || a.index - b.index)
    } else {
      const selected = evaluated
        .filter((row) => row.selected)
        .sort((a, b) => b.effectiveScore - a.effectiveScore || a.index - b.index)
      const selectedIds = new Set(selected.map((row) => row.index))
      const fallback = evaluated
        .filter((row) => !selectedIds.has(row.index))
        .sort((a, b) => b.effectiveScore - a.effectiveScore || a.index - b.index)
      finalRows = [...selected, ...fallback]
    }

    const suggestionsOut = finalRows.slice(0, returnedCount).map((row) => ({
      ...row.suggestion,
      jev: {
        effectiveScore: row.effectiveScore,
        selected: row.selected,
        ...(row.confidence === null ? {} : { confidence: row.confidence }),
        decisions: row.decisions,
      },
    }))

    return {
      suggestions: suggestionsOut,
      summary: {
        specVersion: JEV_DECISION_SPEC_VERSION,
        evaluatorVersion: "mashups-suggestion-shortlist-v1",
        mode,
        generatedCount: suggestions.length,
        returnedCount: suggestionsOut.length,
        totalCostUsd,
        latencyMs,
        fallback: false,
      },
    }
  } catch (error) {
    return baselineSuggestionResult(
      suggestions,
      mode,
      returnedCount,
      error instanceof Error ? error.message.slice(0, 500) : "Jev suggestion ranking failed",
    )
  }
}

function baselineArrangementResult(
  plans: GreenArrangementPlan[],
  mode: JevDecisionMode,
  error?: string,
): ArrangementRankingResult {
  return {
    order: plans.map((plan) => plan.id),
    summary: {
      specVersion: JEV_DECISION_SPEC_VERSION,
      evaluatorVersion: "mashups-arrangement-rank-v1",
      mode,
      totalCostUsd: 0,
      latencyMs: 0,
      fallback: Boolean(error),
    },
    decisions: plans.map((plan) => ({
      id: plan.id,
      effectiveScore: plan.qualityScore,
      decision: jevDecisionTelemetry({
        primitive: "rank",
        key: "green-arrangement-rank",
        mode,
        baselineDecision: plan.qualityScore,
        effectiveDecision: plan.qualityScore,
        action: error ? "fallback" : mode === "shadow" ? "observed" : "baseline",
        evaluatorVersion: "mashups-arrangement-rank-v1",
        error,
      }),
    })),
  }
}

export async function rankGreenArrangements(
  left: GreenCatalogTrack,
  right: GreenCatalogTrack,
  assessment: GreenPairAssessment,
  plans: GreenArrangementPlan[],
  options: {
    token?: string
    fetchImpl?: typeof fetch
    env?: NodeJS.ProcessEnv
  } = {},
): Promise<ArrangementRankingResult> {
  const env = options.env ?? process.env
  const mode = modeFromEnv("MASHUPS_JEV_ARRANGEMENT_MODE", "assist", env)

  if (!assessment.compatible || mode === "off" || plans.length <= 1) {
    return baselineArrangementResult(plans, mode)
  }

  const token = gatewayToken(options.token)
  if (!token) {
    return baselineArrangementResult(
      plans,
      mode,
      "Jev authentication unavailable",
    )
  }

  const started = Date.now()
  const questions: Record<string, unknown> = {}
  plans.forEach((plan, index) => {
    questions[`structure_${index}`] = {
      type: "choice",
      instructions:
        "Based only on the structured plan and deterministic pair assessment, how coherent is this arrangement structure? Do not claim to hear the render.",
      criteria: {
        low: "Structure is likely awkward, crowded, or poorly matched to the supplied metadata.",
        medium: "Plausible structure with some trade-offs.",
        high: "Clear, phrase-aware structure well matched to the deterministic assessment.",
      },
    }
    questions[`contrast_${index}`] = {
      type: "choice",
      instructions:
        "How much useful contrast or creative differentiation does this arrangement provide relative to the other plans?",
      criteria: {
        low: "Adds little distinct creative value.",
        medium: "Provides a useful alternative.",
        high: "Meaningfully different and worth hearing as a separate candidate.",
      },
    }
    questions[`collision_${index}`] = {
      type: "choice",
      instructions:
        "How well does the arrangement structure appear to mitigate the deterministic vocal/topline collision risk?",
      criteria: {
        low: "Structure appears likely to worsen or ignore collision risk.",
        medium: "Reasonable mitigation with some uncertainty.",
        high: "Structure clearly separates or controls competing toplines.",
      },
    }
    questions[`learning_${index}`] = {
      type: "choice",
      instructions:
        "How valuable is this plan as one of the candidates to render/listen to for learning which mashup direction works?",
      criteria: {
        low: "Redundant or unlikely to teach much.",
        medium: "Useful comparison candidate.",
        high: "High-value distinct test that should be heard early.",
      },
    }
  })

  try {
    const response = await (options.fetchImpl ?? fetch)(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        state: {
          explicitBoundary:
            "This evaluator has not heard audio. Rights and compatibility already passed deterministic checks.",
          left: {
            id: left.id,
            title: left.title,
            genre: left.genre,
            bpm: left.bpm,
            key: left.key,
            camelot: left.camelot,
            energy: left.energy,
            phraseConfidence: left.phraseConfidence,
          },
          right: {
            id: right.id,
            title: right.title,
            genre: right.genre,
            bpm: right.bpm,
            key: right.key,
            camelot: right.camelot,
            energy: right.energy,
            phraseConfidence: right.phraseConfidence,
          },
          assessment: {
            score: assessment.score,
            warpPercent: assessment.warpPercent,
            phraseConfidence: assessment.phraseConfidence,
            vocalCollisionRisk: assessment.vocalCollisionRisk,
            harmonicFit: assessment.harmonicFit,
          },
          plans: plans.map((plan, index) => ({
            index,
            id: plan.id,
            title: plan.title,
            description: plan.description,
            targetBpm: plan.targetBpm,
            sidechainDuckDb: plan.sidechainDuckDb,
            baselineQualityScore: plan.qualityScore,
            segments: plan.segments,
          })),
        },
        questions,
        providerOptions: {
          gateway: {
            zeroDataRetention: true,
            only: ["typesafe-ai"],
            tags: [
              "mashups",
              "green-arrangement-rank",
              "jev-decision-spec-v1",
            ],
          },
        },
      }),
      signal: AbortSignal.timeout(8_000),
    })

    const text = await response.text()
    if (!response.ok) {
      throw new Error(
        `Jev arrangement evaluation failed (${response.status}): ${text.slice(0, 200)}`,
      )
    }

    const data = JSON.parse(text) as Record<string, unknown>
    const answers =
      data.answers && typeof data.answers === "object" && !Array.isArray(data.answers)
        ? data.answers as Record<string, unknown>
        : {}
    const provider =
      data.providerMetadata && typeof data.providerMetadata === "object"
        ? data.providerMetadata as Record<string, unknown>
        : {}
    const gateway =
      provider.gateway && typeof provider.gateway === "object"
        ? provider.gateway as Record<string, unknown>
        : {}
    const rawCost = Number(gateway.gatewayCost ?? gateway.cost ?? 0)
    const totalCostUsd = Number.isFinite(rawCost) && rawCost >= 0 ? rawCost : 0
    const latencyMs = Date.now() - started
    const generationId =
      typeof gateway.generationId === "string"
        ? gateway.generationId
        : undefined
    const minimum = threshold(env)

    const decisions = plans.map((plan, index) => {
      const structure = choice(answers[`structure_${index}`])
      const contrast = choice(answers[`contrast_${index}`])
      const collision = choice(answers[`collision_${index}`])
      const learning = choice(answers[`learning_${index}`])
      if (!structure || !contrast || !collision || !learning) {
        return {
          id: plan.id,
          effectiveScore: plan.qualityScore,
          confidence: undefined,
          decision: jevDecisionTelemetry({
            primitive: "rank",
            key: "green-arrangement-rank",
            mode,
            baselineDecision: plan.qualityScore,
            effectiveDecision: plan.qualityScore,
            action: "fallback",
            evaluatorVersion: "mashups-arrangement-rank-v1",
            error: "Incomplete Jev arrangement answers",
          }),
        }
      }

      const levelScore = (value: string) =>
        value === "high" ? 95 : value === "medium" ? 65 : 25
      const jevScore = Math.round(
        (
          levelScore(structure.choice)
          + levelScore(contrast.choice)
          + levelScore(collision.choice)
          + levelScore(learning.choice)
        ) / 4,
      )
      const probabilities = [
        structure.probability,
        contrast.probability,
        collision.probability,
        learning.probability,
      ].filter((value): value is number => value !== null)
      const confidence = probabilities.length ? Math.min(...probabilities) : null
      const rank = resolveRank({
        mode,
        baselineScore: plan.qualityScore,
        jevScore,
        confidence,
        threshold: minimum,
      })

      return {
        id: plan.id,
        effectiveScore: rank.score,
        ...(confidence === null ? {} : { confidence }),
        decision: jevDecisionTelemetry({
          primitive: "rank",
          key: "green-arrangement-rank",
          mode,
          baselineDecision: plan.qualityScore,
          effectiveDecision: rank.score,
          action: rank.action,
          answer: {
            jevScore,
            structuralCoherence: structure.choice,
            creativeContrast: contrast.choice,
            collisionMitigation: collision.choice,
            learningValue: learning.choice,
            explicitBoundary: "metadata-plan-only-not-audio",
          },
          confidence,
          probabilities: {
            ...(structure.probability === null
              ? {}
              : { structure: structure.probability }),
            ...(contrast.probability === null
              ? {}
              : { contrast: contrast.probability }),
            ...(collision.probability === null
              ? {}
              : { collision: collision.probability }),
            ...(learning.probability === null
              ? {}
              : { learning: learning.probability }),
          },
          costUsd: totalCostUsd / plans.length,
          latencyMs,
          generationId,
          evaluatorVersion: "mashups-arrangement-rank-v1",
        }),
      }
    })

    const byId = new Map(decisions.map((decision) => [decision.id, decision]))
    const ordered =
      mode === "off" || mode === "shadow"
        ? plans.map((plan) => plan.id)
        : [...plans]
            .sort((a, b) =>
              (byId.get(b.id)?.effectiveScore ?? b.qualityScore)
              - (byId.get(a.id)?.effectiveScore ?? a.qualityScore)
            )
            .map((plan) => plan.id)

    return {
      order: ordered,
      summary: {
        specVersion: JEV_DECISION_SPEC_VERSION,
        evaluatorVersion: "mashups-arrangement-rank-v1",
        mode,
        totalCostUsd,
        latencyMs,
        fallback: false,
      },
      decisions,
    }
  } catch (error) {
    return baselineArrangementResult(
      plans,
      mode,
      error instanceof Error ? error.message.slice(0, 500) : "Jev arrangement ranking failed",
    )
  }
}
