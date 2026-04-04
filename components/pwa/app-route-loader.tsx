"use client";

import { Leaf } from "lucide-react";

/** Shown during segment `loading.tsx` transitions — calm branded spinner. */
export function AppRouteLoader() {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-6 px-6 py-16"
      aria-busy
      aria-label="Loading"
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-outline-variant/10">
        <Leaf className="size-7" strokeWidth={1.5} aria-hidden />
      </span>
      <div className="flex flex-col items-center gap-3">
        <span className="inline-block size-9 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <p className="text-sm font-medium text-on-surface-variant">
          Loading…
        </p>
      </div>
    </div>
  );
}
