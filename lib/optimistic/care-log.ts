import type { CareLogListItem } from "@/lib/plants/care-logs";

/** Current user snapshot for optimistic care log rows. */
export type CareLogCreatorSnapshot = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
};

export const OPTIMISTIC_CARE_LOG_PREFIX = "opt-cl-";

export function isOptimisticCareLogId(id: string): boolean {
  return id.startsWith(OPTIMISTIC_CARE_LOG_PREFIX);
}

export function makeOptimisticCareLogId(): string {
  return `${OPTIMISTIC_CARE_LOG_PREFIX}${crypto.randomUUID()}`;
}

export function buildOptimisticCareLogItem(input: {
  id: string;
  actionType: string;
  actionAt: string;
  notes: string | null;
  metadata: Record<string, unknown>;
  tags: string[];
  createdById: string;
  creator: CareLogListItem["creator"];
}): CareLogListItem {
  const now = new Date().toISOString();
  return {
    id: input.id,
    actionType: input.actionType,
    actionAt: input.actionAt,
    notes: input.notes,
    metadata: input.metadata,
    tags: input.tags,
    createdAt: now,
    updatedAt: now,
    createdById: input.createdById,
    creator: input.creator,
    imageAttachmentCount: 0,
  };
}

/** Merge server list with cache: last write wins by id. */
export function dedupeCareLogsById(
  rows: CareLogListItem[],
): CareLogListItem[] {
  const seen = new Set<string>();
  const out: CareLogListItem[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

export function replaceOptimisticCareLogId(
  rows: CareLogListItem[],
  tempId: string,
  realId: string,
): CareLogListItem[] {
  const hasReal = rows.some((r) => r.id === realId);
  if (hasReal) {
    return rows.filter((r) => r.id !== tempId);
  }
  return rows.map((r) => (r.id === tempId ? { ...r, id: realId } : r));
}
