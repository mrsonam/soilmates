export function DiagnosisNextSteps({
  safest,
  recommendations,
}: {
  safest: string[];
  recommendations: string[];
}) {
  const hasSafe = safest.length > 0;
  const hasRec = recommendations.length > 0;
  if (!hasSafe && !hasRec) return null;
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {hasSafe ? (
        <div className="space-y-2">
          <h3 className="font-display text-base font-semibold text-on-surface">
            Safest next steps
          </h3>
          <ul className="space-y-2">
            {safest.map((s) => (
              <li
                key={s}
                className="rounded-2xl border border-primary/15 bg-primary/[0.04] px-4 py-3 text-sm leading-relaxed text-on-surface"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {hasRec ? (
        <div className="space-y-2">
          <h3 className="font-display text-base font-semibold text-on-surface">
            Other suggestions
          </h3>
          <ul className="space-y-2">
            {recommendations.map((s) => (
              <li
                key={s}
                className="rounded-2xl bg-surface-container-high/40 px-4 py-3 text-sm leading-relaxed text-on-surface ring-1 ring-outline-variant/[0.08]"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
