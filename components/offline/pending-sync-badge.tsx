"use client";

type PendingSyncBadgeProps = {
  label?: string;
  className?: string;
};

export function PendingSyncBadge({
  label = "Pending sync",
  className = "",
}: PendingSyncBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-primary",
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
