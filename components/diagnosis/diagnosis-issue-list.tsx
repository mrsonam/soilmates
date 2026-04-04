export function DiagnosisIssueList({
  title = "Possible issues",
  subtitle = "Hypotheses based on photos and records — not certainties.",
  items,
}: {
  title?: string;
  subtitle?: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <div>
        <h3 className="font-display text-base font-semibold text-on-surface">
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-on-surface-variant">{subtitle}</p>
      </div>
      <ul className="space-y-2">
        {items.map((s, i) => (
          <li
            key={`${i}-${s.slice(0, 48)}`}
            className="rounded-2xl bg-surface-container-lowest/50 px-4 py-3 text-sm leading-relaxed text-on-surface ring-1 ring-outline-variant/[0.07]"
          >
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
