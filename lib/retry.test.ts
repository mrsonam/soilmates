import { describe, expect, it, vi } from "vitest";
import { withRetry } from "./retry";

describe("withRetry", () => {
  it("returns result on first success", async () => {
    const fn = vi.fn().mockResolvedValue(42);
    await expect(withRetry(fn, { maxAttempts: 3 })).resolves.toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries then succeeds", async () => {
    let n = 0;
    const fn = vi.fn(async () => {
      n += 1;
      if (n < 2) {
        const e = new Error("timeout");
        e.name = "TimeoutError";
        throw e;
      }
      return "ok";
    });
    await expect(
      withRetry(fn as () => Promise<string>, {
        maxAttempts: 3,
        shouldRetry: () => true,
        initialDelayMs: 1,
        maxDelayMs: 2,
      }),
    ).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("stops at maxAttempts", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fail"));
    await expect(
      withRetry(fn, {
        maxAttempts: 2,
        shouldRetry: () => true,
        initialDelayMs: 1,
        maxDelayMs: 2,
      }),
    ).rejects.toThrow("fail");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
