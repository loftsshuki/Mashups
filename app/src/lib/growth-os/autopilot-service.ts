import "server-only"

import { decideAutopilotActions } from "@/lib/growth-os/autopilot"
import type { GenomeSignal } from "@/lib/growth-os/types"
import { createAdminClient } from "@/lib/supabase/admin"

export async function runAutopilotForLaunch(input: { launchId: string; initiatedBy?: string | null; trigger: "schedule" | "operator" | "event_threshold" }) {
  const admin = createAdminClient()
  if (!admin) throw new Error("Autopilot storage is not configured.")
  const { data: genomes, error: genomeError } = await admin
    .from("viral_template_genomes")
    .select("id,name,niche,qualified_activations,completion_rate,share_rate,save_rate")
    .eq("launch_id", input.launchId)
  if (genomeError) throw new Error("Unable to read launch signals.")
  const signals: GenomeSignal[] = (genomes ?? []).map((row) => ({
    genomeId: row.id,
    name: row.name,
    niche: row.niche,
    city: "Global",
    qualifiedActivations: row.qualified_activations,
    completionRate: Number(row.completion_rate),
    shareRate: Number(row.share_rate),
    saveRate: Number(row.save_rate),
    costPerQualifiedActivationCents: 1500,
    followerMedian: 0,
  }))
  const actions = decideAutopilotActions(signals)
  const { data: run, error: runError } = await admin.from("growth_autopilot_runs").insert({
    launch_id: input.launchId,
    initiated_by: input.initiatedBy ?? null,
    trigger: input.trigger,
    status: "completed",
    input_snapshot: { signals },
    summary: { actionCount: actions.length },
    completed_at: new Date().toISOString(),
  }).select("id").single()
  if (runError || !run) throw new Error("Unable to persist autopilot run.")
  if (actions.length) {
    const { error } = await admin.from("growth_autopilot_actions").insert(actions.map((action) => ({
      run_id: run.id,
      launch_id: input.launchId,
      action_type: action.type,
      target_type: action.type.includes("city") ? "city" : "genome",
      target_id: action.target,
      reason: action.reason,
      confidence: action.confidence,
      budget_delta_cents: action.budgetDeltaCents,
      status: action.status,
      executed_at: action.status === "executed" ? new Date().toISOString() : null,
      guardrails: { reversible: true, humanOverride: true },
    })))
    if (error) throw new Error("Unable to persist autopilot actions.")
  }
  return { runId: run.id, actions }
}
