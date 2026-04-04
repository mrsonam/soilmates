export function DiagnosisFollowUpQuestions({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="font-display text-base font-semibold text-on-surface">
        Worth clarifying
      </h3>
      <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-on-surface-variant marker:text-primary/80">
        {items.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
