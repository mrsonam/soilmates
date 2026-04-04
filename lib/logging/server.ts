import "server-only";

import { buildEvent } from "./format";
import type { LogContext, LogSeverity } from "./types";

/**
 * Structured JSON logs to stdout for log drains / future Sentry.
 * Never log secrets, tokens, or full request bodies.
 */
function emit(event: ReturnType<typeof buildEvent>): void {
  const line = JSON.stringify({ service: "soilmates", ...event });
  if (event.severity === "error" || event.severity === "fatal") {
    console.error(line);
  } else if (event.severity === "warning") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const serverLogger = {
  debug(type: string, message?: string, context?: LogContext) {
    if (process.env.NODE_ENV === "production") return;
    emit(buildEvent({ type, severity: "debug", message, context }));
  },
  info(type: string, message?: string, context?: LogContext) {
    emit(buildEvent({ type, severity: "info", message, context }));
  },
  warning(type: string, message?: string, context?: LogContext, error?: unknown) {
    emit(buildEvent({ type, severity: "warning", message, context, error }));
  },
  error(type: string, message?: string, context?: LogContext, error?: unknown) {
    emit(buildEvent({ type, severity: "error", message, context, error }));
  },
  fatal(type: string, message?: string, context?: LogContext, error?: unknown) {
    emit(buildEvent({ type, severity: "fatal", message, context, error }));
  },
  /** Convenience: log failed Prisma / external calls with a stable type prefix */
  integration(
    domain: "ai" | "trefle" | "push" | "auth" | "invite" | "db" | "cron",
    action: string,
    severity: LogSeverity,
    context?: LogContext,
    error?: unknown,
  ) {
    emit(
      buildEvent({
        type: `${domain}.${action}`,
        severity,
        context,
        error,
      }),
    );
  },
};
