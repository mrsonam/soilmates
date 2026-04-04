"use client";

import { AppErrorFallback } from "@/components/errors/app-error-fallback";

export default function ErrorPage({
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
      title="We hit a snag"
      description="This page didn’t load the way we expected. Try again, or head home — your plants are safe."
    />
  );
}
