type InlineLoaderProps = {
  label?: string;
  className?: string;
};

/** Compact pending indicator for tab panels and inline actions. */
export function InlineLoader({
  label = "Loading…",
  className = "",
}: InlineLoaderProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 text-xs font-medium text-on-surface-variant",
        className,
      ].join(" ")}
      role="status"
    >
      <span
        className="inline-block size-3.5 shrink-0 animate-spin rounded-full border-2 border-primary/20 border-t-primary"
        aria-hidden
      />
      {label}
    </span>
  );
}
