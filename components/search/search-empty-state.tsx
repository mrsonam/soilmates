export function SearchEmptyState({
  variant,
  query,
}: {
  variant: "no_query" | "no_results";
  query?: string;
}) {
  if (variant === "no_query") {
    return (
      <div className="rounded-3xl border border-dashed border-outline-variant/25 bg-surface-container-low/40 px-6 py-14 text-center">
        <p className="font-display text-lg font-semibold text-on-surface">
          Search your plants, care history, reminders, and more
        </p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Try a nickname, a space like “Living Room”, or an action like “watered”.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-dashed border-outline-variant/25 bg-surface-container-low/40 px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold text-on-surface">
        No matches found
      </p>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
        {query ? (
          <>
            Nothing matched “<span className="font-medium text-on-surface">{query}</span>”.
            Try a broader keyword or relax filters.
          </>
        ) : (
          "Try a broader keyword or relax filters."
        )}
      </p>
    </div>
  );
}

