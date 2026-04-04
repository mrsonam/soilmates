export type RetryOptions = {
  /** Max attempts including the first try (default 3). */
  maxAttempts?: number;
  /** Initial delay in ms (default 400). */
  initialDelayMs?: number;
  /** Multiplier each attempt (default 2). */
  factor?: number;
  /** Cap backoff (default 8000). */
  maxDelayMs?: number;
  /** Return true to retry after this error. */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const defaultShouldRetry: NonNullable<RetryOptions["shouldRetry"]> = (error) => {
  if (error instanceof Error) {
    const n = error.name;
    if (n === "AbortError" || n === "TimeoutError") return true;
  }
  return false;
};

/**
 * Exponential backoff with jitter. Does not retry on success.
 */
export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = Math.max(1, options.maxAttempts ?? 3);
  const initialDelayMs = options.initialDelayMs ?? 400;
  const factor = options.factor ?? 2;
  const maxDelayMs = options.maxDelayMs ?? 8000;
  const shouldRetry = options.shouldRetry ?? defaultShouldRetry;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (e) {
      lastError = e;
      if (attempt >= maxAttempts || !shouldRetry(e, attempt)) {
        throw e;
      }
      const base = initialDelayMs * factor ** (attempt - 1);
      const capped = Math.min(base, maxDelayMs);
      const jitter = capped * 0.2 * Math.random();
      await sleep(capped + jitter);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
