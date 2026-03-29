"use client";

import { Search } from "lucide-react";

type CollectionSearchFieldProps = {
  className?: string;
};

export function CollectionSearchField({
  className = "",
}: CollectionSearchFieldProps) {
  return (
    <div
      className={[
        "flex w-full items-center gap-2.5 rounded-full bg-surface-container-high/80 px-4 py-2.5 ring-1 ring-outline-variant/15 transition focus-within:ring-2 focus-within:ring-primary/25",
        className,
      ].join(" ")}
    >
      <Search
        className="size-[1.125rem] shrink-0 text-on-surface-variant/70"
        strokeWidth={1.75}
        aria-hidden
      />
      <input
        type="search"
        name="collection-search"
        placeholder="Search collection…"
        disabled
        readOnly
        aria-label="Search this collection (coming soon)"
        className="min-w-0 flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none disabled:cursor-not-allowed"
      />
    </div>
  );
}
