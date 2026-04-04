import type { DiagnosisAiOutput } from "./schemas";

/** Readable assistant message stored in thread alongside structured diagnosis. */
export function formatDiagnosisAssistantMessage(out: DiagnosisAiOutput): string {
  const lines: string[] = [];

  lines.push("**Diagnosis review**", "");
  lines.push(out.summary.trim(), "");

  if (out.observed_evidence?.length) {
    lines.push("**What stands out in the photos & records**");
    for (const s of out.observed_evidence) lines.push(`• ${s}`);
    lines.push("");
  }

  if (out.suspected_issues.length) {
    lines.push("**Possible issues** (hypotheses, not certainties)");
    for (const s of out.suspected_issues) lines.push(`• ${s}`);
    lines.push("");
  }

  const conf = out.confidence;
  if (conf) {
    const score =
      typeof conf.score === "number"
        ? ` (~${Math.round(conf.score * 100)}% confidence band)`
        : "";
    lines.push(
      `**Uncertainty:** ${conf.level}${score}${conf.notes ? ` — ${conf.notes}` : ""}`,
      "",
    );
  }

  if (out.safest_next_steps.length) {
    lines.push("**Safest next steps**");
    for (const s of out.safest_next_steps) lines.push(`• ${s}`);
    lines.push("");
  }

  if (out.recommendations.length) {
    lines.push("**Other suggestions**");
    for (const s of out.recommendations) lines.push(`• ${s}`);
    lines.push("");
  }

  if (out.follow_up_questions.length) {
    lines.push("**Worth clarifying**");
    for (const s of out.follow_up_questions) lines.push(`• ${s}`);
    lines.push("");
  }

  if (out.monitor_next?.length) {
    lines.push("**What to monitor**");
    for (const s of out.monitor_next) lines.push(`• ${s}`);
    lines.push("");
  }

  if (out.when_to_recheck?.trim()) {
    lines.push(`**When to check in again:** ${out.when_to_recheck.trim()}`, "");
  }

  if (out.reasoning_notes?.trim()) {
    lines.push("**Notes on reasoning**", out.reasoning_notes.trim(), "");
  }

  lines.push(
    "_This is guidance based on photos and your records, not a lab test. When in doubt, isolate changes and observe._",
  );

  return lines.join("\n").trim();
}
