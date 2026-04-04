"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(JSON.stringify({
      service: "soilmates-client",
      type: "ui.global_error",
      severity: "error",
      timestamp: new Date().toISOString(),
      message: error.message,
      digest: error.digest,
    }));
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh bg-surface text-on-surface antialiased">
        <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
          <h1 className="font-display text-xl font-semibold">Soil Mates</h1>
          <p className="mt-4 max-w-md text-sm text-on-surface-variant">
            Something went wrong on our side. Please refresh the page or try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-on-primary"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
