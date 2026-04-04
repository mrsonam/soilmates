import { diagnosisAiOutputSchema, type DiagnosisAiOutput } from "./schemas";

function coerceStringArray(v: unknown, max: number): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) {
    const out: string[] = [];
    for (const item of v) {
      if (typeof item === "string" && item.trim()) out.push(item.trim());
      else if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        if (typeof o.label === "string") out.push(o.label.trim());
        else if (typeof o.issue === "string") out.push(o.issue.trim());
        else if (typeof o.text === "string") out.push(o.text.trim());
      }
      if (out.length >= max) break;
    }
    return out.slice(0, max);
  }
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

function coerceConfidence(
  v: unknown,
): { level: "low" | "medium" | "high"; score?: number; notes?: string } | undefined {
  if (v == null || v === "") return undefined;
  if (typeof v === "string") {
    const s = v.toLowerCase().trim();
    if (s === "low" || s === "medium" || s === "high")
      return { level: s as "low" | "medium" | "high" };
    return { level: "medium", notes: v.slice(0, 2000) };
  }
  if (typeof v === "object" && v !== null) {
    const o = v as Record<string, unknown>;
    const levelRaw = o.level ?? o.confidence_level;
    let level: "low" | "medium" | "high" = "medium";
    if (typeof levelRaw === "string") {
      const L = levelRaw.toLowerCase().trim();
      if (L === "low" || L === "medium" || L === "high") level = L;
    }
    const score =
      typeof o.score === "number" && o.score >= 0 && o.score <= 1
        ? o.score
        : undefined;
    const notes =
      typeof o.notes === "string"
        ? o.notes.slice(0, 2000)
        : typeof o.note === "string"
          ? o.note.slice(0, 2000)
          : undefined;
    return { level, score, notes };
  }
  return undefined;
}

function coerceHealth(
  v: unknown,
): "thriving" | "needs_attention" | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v === "string" && !v.trim()) return null;
  if (typeof v === "string") {
    const s = v.toLowerCase().replace(/\s+/g, "_").trim();
    if (s === "thriving" || s === "needs_attention") return s;
    if (s.includes("attention") || s.includes("needs")) return "needs_attention";
    if (s.includes("thriv")) return "thriving";
    return undefined;
  }
  return undefined;
}

/**
 * Map common alternate keys / shapes from small LLMs into our strict schema.
 */
export function normalizeDiagnosisPayload(raw: unknown): DiagnosisAiOutput {
  if (!raw || typeof raw !== "object") {
    throw new Error("Model JSON root must be an object");
  }
  const o = raw as Record<string, unknown>;

  const summary =
    typeof o.summary === "string"
      ? o.summary
      : typeof o.overview === "string"
        ? o.overview
        : typeof o.diagnosis_summary === "string"
          ? o.diagnosis_summary
          : "";

  const suspected_issues = coerceStringArray(
    o.suspected_issues ?? o.suspectedIssues ?? o.possible_issues ?? o.issues,
    20,
  );

  const recommendations = coerceStringArray(
    o.recommendations ?? o.suggestion ?? o.suggestions,
    25,
  );

  const safest_next_steps = coerceStringArray(
    o.safest_next_steps ??
      o.safestNextSteps ??
      o.safe_next_steps ??
      o.immediate_actions,
    25,
  );

  const follow_up_questions = coerceStringArray(
    o.follow_up_questions ?? o.followUpQuestions ?? o.questions,
    15,
  );

  const observed_evidence = coerceStringArray(
    o.observed_evidence ?? o.observedEvidence ?? o.evidence,
    15,
  );

  const monitor_next = coerceStringArray(
    o.monitor_next ?? o.monitorNext ?? o.what_to_monitor,
    15,
  );

  const reasoning_notes =
    typeof o.reasoning_notes === "string"
      ? o.reasoning_notes
      : typeof o.reasoningNotes === "string"
        ? o.reasoningNotes
        : null;

  const when_to_recheck =
    typeof o.when_to_recheck === "string"
      ? o.when_to_recheck
      : typeof o.whenToRecheck === "string"
        ? o.whenToRecheck
        : null;

  const confidence = coerceConfidence(
    o.confidence ?? o.uncertainty ?? o.confidence_level,
  );

  const suggested_ai_health_status = coerceHealth(
    o.suggested_ai_health_status ?? o.suggestedAiHealthStatus ?? o.health,
  );

  const candidate = {
    summary: summary || "No summary provided by the model.",
    suspected_issues:
      suspected_issues.length > 0
        ? suspected_issues
        : ["The model did not list specific hypotheses; treat observations as uncertain."],
    confidence,
    recommendations:
      recommendations.length > 0
        ? recommendations
        : ["Observe for a few days and adjust one care variable at a time."],
    safest_next_steps:
      safest_next_steps.length > 0
        ? safest_next_steps
        : [
            "Keep watering consistent with your current pattern unless soil is staying soggy.",
          ],
    follow_up_questions:
      follow_up_questions.length > 0
        ? follow_up_questions
        : ["What changed in light or watering in the last two weeks?"],
    reasoning_notes,
    suggested_ai_health_status:
      suggested_ai_health_status === undefined
        ? null
        : suggested_ai_health_status,
    observed_evidence: observed_evidence.length ? observed_evidence : undefined,
    monitor_next: monitor_next.length ? monitor_next : undefined,
    when_to_recheck,
  };

  const parsed = diagnosisAiOutputSchema.safeParse(candidate);
  if (!parsed.success) {
    console.error("[diagnosis] normalize still failed", parsed.error.flatten());
    throw new Error("Could not normalize model output");
  }
  return parsed.data;
}
