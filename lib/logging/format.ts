import type { LogContext, LogSeverity, StructuredLogEvent } from "./types";

export function nowIso(): string {
  return new Date().toISOString();
}

export function buildEvent(input: {
  type: string;
  severity: LogSeverity;
  message?: string;
  context?: LogContext;
  error?: unknown;
}): StructuredLogEvent {
  const err =
    input.error instanceof Error
      ? { name: input.error.name, message: input.error.message }
      : input.error != null
        ? { name: "NonError", message: String(input.error) }
        : undefined;
  return {
    type: input.type,
    severity: input.severity,
    timestamp: nowIso(),
    message: input.message,
    context: input.context,
    error: err,
  };
}
