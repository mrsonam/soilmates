"use client";

import Link from "next/link";
import { Search } from "lucide-react";

type PlantsSearchFieldProps = {
  className?: string;
};

/** Dashboard header search — routes to global search. */
export function PlantsSearchField({ className = "" }: PlantsSearchFieldProps) {
  return (
    <Link
      href="/search"
      className={[
        "flex w-full items-center gap-2.5 rounded-full bg-surface-container-high/90 px-4 py-2.5 shadow-sm ring-1 ring-outline-variant/10 transition focus-within:ring-2 focus-within:ring-primary/20",
        "hover:bg-surface-container-highest",
        className,
      ].join(" ")}
    >
      <Search
        className="size-4.5 shrink-0 text-on-surface-variant/60"
        strokeWidth={1.75}
        aria-hidden
      />
      <input
        type="search"
        name="plants-search"
        placeholder="Search…"
        readOnly
        aria-label="Search"
        className="min-w-0 flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/45 outline-none disabled:cursor-not-allowed"
      />
    </Link>
  );
}
