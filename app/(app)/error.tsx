"use client";

import { AppErrorFallback } from "@/components/errors/app-error-fallback";

export default function AppSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppErrorFallback
      error={error}
      reset={reset}
      title="This view couldn’t load"
      description="Your session is fine — this screen just didn’t update. Retry, or open the dashboard."
    />
  );
}
