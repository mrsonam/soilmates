import { describe, expect, it } from "vitest";
import { isLikelyVersionConflictMessage, classifyQueueFailure } from "./conflicts";
import type { SyncQueueRecord } from "@/lib/offline/schema";

const baseRecord = (): SyncQueueRecord => ({
  localId: "x",
  operationType: "t",
  entityType: "e",
  payload: {},
  createdAt: 1,
  retryCount: 0,
  status: "pending",
  lastError: null,
  conflictState: null,
});

describe("classifyQueueFailure", () => {
  it("detects conflict phrasing", () => {
    expect(isLikelyVersionConflictMessage("Resource changed before save")).toBe(true);
    expect(isLikelyVersionConflictMessage("network down")).toBe(false);
  });

  it("classifies as conflict when message matches", () => {
    const r = baseRecord();
    expect(classifyQueueFailure(r, "stale data — reload")).toBe("conflict");
  });

  it("classifies as failed otherwise", () => {
    const r = baseRecord();
    expect(classifyQueueFailure(r, "Server exploded")).toBe("failed");
  });
});
