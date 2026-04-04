"use client";

import { buildEvent } from "./format";
import type { LogContext, LogSeverity } from "./types";

function emitToConsole(event: ReturnType<typeof buildEvent>): void {
  const payload = { service: "soilmates-client", ...event };
  if (event.severity === "error" || event.severity === "fatal") {
    console.error(JSON.stringify(payload));
  } else if (event.severity === "warning") {
    console.warn(JSON.stringify(payload));
  } else if (process.env.NODE_ENV !== "production") {
    console.debug(JSON.stringify(payload));
  }
}

/**
 * Client-side structured logs (mutations, sync, AI, push).
 * Hook `window.__SOILMATES_LOG_HOOK__` can be set in devtools to forward to Sentry later.
 */
export const clientLogger = {
  log(
    type: string,
    severity: LogSeverity,
    message?: string,
    context?: LogContext,
    error?: unknown,
  ) {
    const event = buildEvent({ type, severity, message, context, error });
    emitToConsole(event);
    if (typeof window !== "undefined") {
      const hook = (
        window as unknown as {
          __SOILMATES_LOG_HOOK__?: (e: typeof event) => void;
        }
      ).__SOILMATES_LOG_HOOK__;
      try {
        hook?.(event);
      } catch {
        /* ignore third-party hook errors */
      }
    }
  },
  info(type: string, message?: string, context?: LogContext) {
    this.log(type, "info", message, context);
  },
  warning(type: string, message?: string, context?: LogContext, error?: unknown) {
    this.log(type, "warning", message, context, error);
  },
  error(type: string, message?: string, context?: LogContext, error?: unknown) {
    this.log(type, "error", message, context, error);
  },
};
