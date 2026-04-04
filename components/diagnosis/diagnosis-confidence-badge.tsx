type Level = "low" | "medium" | "high";

function labelFor(level: Level): string {
  switch (level) {
    case "high":
      return "Higher confidence";
    case "medium":
      return "Moderate confidence";
    case "low":
      return "Low confidence — more context helps";
    default:
      return "Confidence";
  }
}

export function DiagnosisConfidenceBadge({
  confidence,
}: {
  confidence: {
    level?: string;
    score?: number;
    notes?: string;
  } | null;
}) {
  if (!confidence?.level) {
    return (
      <span className="inline-flex items-center rounded-full bg-surface-container-high/80 px-3 py-1 text-xs font-medium text-on-surface-variant ring-1 ring-outline-variant/15">
        Uncertainty not rated
      </span>
    );
  }

  const level = confidence.level as Level;
  const tone =
    level === "high"
      ? "bg-emerald-500/10 text-emerald-900 ring-emerald-500/15"
      : level === "medium"
        ? "bg-amber-500/10 text-amber-950 ring-amber-500/15"
        : "bg-slate-500/10 text-slate-800 ring-slate-500/15";

  const pct =
    typeof confidence.score === "number"
      ? ` · ~${Math.round(confidence.score * 100)}%`
      : "";

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
      <span
        className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tone}`}
      >
        {labelFor(level)}
        {pct}
      </span>
      {confidence.notes ? (
        <p className="text-sm leading-relaxed text-on-surface-variant">
          {confidence.notes}
        </p>
      ) : null}
    </div>
  );
}
