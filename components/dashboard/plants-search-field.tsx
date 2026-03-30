"use client";

import { Search } from "lucide-react";

type PlantsSearchFieldProps = {
  className?: string;
};

/** Dashboard header search — visual parity with mockup; wiring later. */
export function PlantsSearchField({ className = "" }: PlantsSearchFieldProps) {
  return (
    <div
      className={[
        "flex w-full items-center gap-2.5 rounded-full bg-surface-container-high/90 px-4 py-2.5 shadow-sm ring-1 ring-outline-variant/10 transition focus-within:ring-2 focus-within:ring-primary/20",
        className,
      ].join(" ")}
    >
      <Search
        className="size-[1.125rem] shrink-0 text-on-surface-variant/60"
        strokeWidth={1.75}
        aria-hidden
      />
      <input
        type="search"
        name="plants-search"
        placeholder="Search plants…"
        disabled
        readOnly
        aria-label="Search plants (coming soon)"
        className="min-w-0 flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/45 outline-none disabled:cursor-not-allowed"
      />
    </div>
  );
}
