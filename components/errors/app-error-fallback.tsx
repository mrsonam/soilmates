"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Leaf, RefreshCw } from "lucide-react";
import { clientLogger } from "@/lib/logging/client";

type AppErrorFallbackProps = {
  error: Error & { digest?: string };
  reset: () => void;
  /** Shown above the title — keep non-technical */
  title?: string;
  description?: string;
};

export function AppErrorFallback({
  error,
  reset,
  title = "Something went wrong",
  description = "We couldn’t finish loading this. You can try again or go back to a safe place.",
}: AppErrorFallbackProps) {
  useEffect(() => {
    clientLogger.error(
      "ui.error_boundary",
      error.message,
      { digest: error.digest },
      error,
    );
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        <Leaf className="size-7" strokeWidth={1.5} aria-hidden />
      </div>
      <h1 className="font-display text-xl font-semibold text-on-surface sm:text-2xl">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-on-surface-variant">
        {description}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="focus-ring-premium inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-on-primary"
        >
          <RefreshCw className="size-4" aria-hidden />
          Try again
        </button>
        <Link
          href="/dashboard"
          className="focus-ring-premium rounded-full px-5 py-2.5 text-sm font-medium text-primary ring-1 ring-primary/25"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
