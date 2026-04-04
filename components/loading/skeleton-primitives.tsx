/** Shared pulse surface for route and section skeletons (calm, non-harsh). */
export const skeletonPulse =
  "animate-pulse rounded-2xl bg-surface-container-high/60 ring-1 ring-outline-variant/[0.06]";

export function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={[skeletonPulse, "h-4", className].join(" ")}
      aria-hidden
    />
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={[skeletonPulse, className].join(" ")} aria-hidden />;
}
