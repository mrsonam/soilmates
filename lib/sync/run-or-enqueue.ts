"use client";

import { readNavigatorOnline } from "./network";
import { clientEnqueueAndRefresh } from "./client-enqueue";

export async function runOrEnqueueMutation(input: {
  operationType: string;
  entityType: string;
  entityId?: string;
  payload: Record<string, unknown>;
  execute: () => Promise<{ ok: boolean; error?: string }>;
}): Promise<{ ok: boolean; queued?: boolean; error?: string }> {
  if (!readNavigatorOnline()) {
    await clientEnqueueAndRefresh({
      operationType: input.operationType,
      entityType: input.entityType,
      entityId: input.entityId,
      payload: input.payload,
    });
    return { ok: true, queued: true };
  }
  return input.execute();
}
