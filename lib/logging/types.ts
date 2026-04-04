/** Severity aligned with common observability tools (Sentry-compatible). */
export type LogSeverity = "debug" | "info" | "warning" | "error" | "fatal";

export type LogContext = Record<string, unknown>;

export type StructuredLogEvent = {
  /** Dot-separated domain, e.g. sync.queue, ai.assistant, push.subscribe */
  type: string;
  severity: LogSeverity;
  /** ISO 8601 */
  timestamp: string;
  message?: string;
  /** Non-PII context: ids, slugs, operation names */
  context?: LogContext;
  /** Original error name / code only; message optional for server logs */
  error?: { name?: string; message?: string };
};
