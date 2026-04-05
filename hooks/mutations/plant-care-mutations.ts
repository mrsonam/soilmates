"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createQuickCareLogAction } from "@/app/(app)/collections/[collectionSlug]/plants/care-log-actions";
import {
  createDetailedCareLogAction,
  deleteCareLogAction,
  updateCareLogAction,
} from "@/app/(app)/collections/[collectionSlug]/plants/care-log-mutations";
import type { CareLogListItem } from "@/lib/plants/care-logs";
import {
  buildOptimisticCareLogItem,
  dedupeCareLogsById,
  makeOptimisticCareLogId,
  replaceOptimisticCareLogId,
  type CareLogCreatorSnapshot,
} from "@/lib/optimistic/care-log";
import { queryKeys } from "@/lib/query-keys";
import { SyncEntityType, SyncOperationType } from "@/lib/sync/operation-types";
import { runOrEnqueueMutation } from "@/lib/sync/run-or-enqueue";
import type { z } from "zod";
import {
  createDetailedCareLogSchema,
  deleteCareLogSchema,
  updateCareLogSchema,
} from "@/lib/validations/care-log";
import type { QuickCareAction } from "@/lib/validations/care-log";

export type { CareLogCreatorSnapshot };

type QuickCareResult = {
  ok: boolean;
  queued?: boolean;
  careLogId?: string;
  error?: string;
};

type CreateDetailedInput = z.infer<typeof createDetailedCareLogSchema>;
type UpdateCareLogInput = z.infer<typeof updateCareLogSchema>;
type DeleteCareLogInput = z.infer<typeof deleteCareLogSchema>;

export function useQuickCareLogMutation(
  collectionSlug: string,
  plantSlug: string,
  creator: CareLogCreatorSnapshot,
) {
  const qc = useQueryClient();
  const router = useRouter();
  const key = queryKeys.plant.careLogs(collectionSlug, plantSlug);

  return useMutation({
    mutationFn: async ({ actionType }: { actionType: QuickCareAction }) => {
      const res = await runOrEnqueueMutation({
        operationType: SyncOperationType.QUICK_CARE_LOG,
        entityType: SyncEntityType.CARE_LOG,
        payload: { collectionSlug, plantSlug, actionType },
        execute: () =>
          createQuickCareLogAction({
            collectionSlug,
            plantSlug,
            actionType,
          }),
      });
      if (!res.ok) {
        throw new Error(res.error ?? "Could not save");
      }
      return res as unknown as QuickCareResult;
    },
    onMutate: async ({ actionType }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<CareLogListItem[]>(key);
      const tempId = makeOptimisticCareLogId();
      const now = new Date().toISOString();
      const optimistic = buildOptimisticCareLogItem({
        id: tempId,
        actionType,
        actionAt: now,
        notes: null,
        metadata: {},
        tags: [],
        createdById: creator.userId,
        creator: {
          displayName: creator.displayName,
          avatarUrl: creator.avatarUrl,
        },
      });
      qc.setQueryData(key, (old: CareLogListItem[] | undefined) =>
        dedupeCareLogsById([optimistic, ...(old ?? [])]),
      );
      return { previous, tempId };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(key, ctx.previous);
      } else if (ctx?.tempId) {
        qc.setQueryData(key, (old: CareLogListItem[] | undefined) =>
          (old ?? []).filter((r) => r.id !== ctx.tempId),
        );
      }
    },
    onSuccess: (data, _vars, ctx) => {
      if (
        data.ok &&
        "careLogId" in data &&
        typeof data.careLogId === "string" &&
        ctx?.tempId
      ) {
        qc.setQueryData(key, (old: CareLogListItem[] | undefined) =>
          replaceOptimisticCareLogId(
            old ?? [],
            ctx.tempId,
            data.careLogId as string,
          ),
        );
      }
    },
    onSettled: () => {
      router.refresh();
    },
  });
}

export function useCreateDetailedCareLogMutation(
  collectionSlug: string,
  plantSlug: string,
  creator: CareLogCreatorSnapshot,
) {
  const qc = useQueryClient();
  const router = useRouter();
  const key = queryKeys.plant.careLogs(collectionSlug, plantSlug);

  return useMutation({
    mutationFn: async (input: CreateDetailedInput) => {
      const res = await createDetailedCareLogAction(input);
      if (!res.ok) throw new Error(res.error);
      return res;
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<CareLogListItem[]>(key);
      const tempId = makeOptimisticCareLogId();
      const actionAt =
        input.actionAt instanceof Date
          ? input.actionAt
          : new Date(input.actionAt as string);
      const actionAtIso = actionAt.toISOString();
      const optimistic = buildOptimisticCareLogItem({
        id: tempId,
        actionType: input.actionType,
        actionAt: actionAtIso,
        notes: input.notes ?? null,
        metadata: (input.metadata as Record<string, unknown>) ?? {},
        tags: input.tags ?? [],
        createdById: creator.userId,
        creator: {
          displayName: creator.displayName,
          avatarUrl: creator.avatarUrl,
        },
      });
      qc.setQueryData(key, (old: CareLogListItem[] | undefined) =>
        dedupeCareLogsById([optimistic, ...(old ?? [])]),
      );
      return { previous, tempId };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(key, ctx.previous);
      } else if (ctx?.tempId) {
        qc.setQueryData(key, (old: CareLogListItem[] | undefined) =>
          (old ?? []).filter((r) => r.id !== ctx.tempId),
        );
      }
    },
    onSuccess: (data, _vars, ctx) => {
      const realId = data.ok ? data.careLogId : undefined;
      if (realId && ctx?.tempId) {
        qc.setQueryData(key, (old: CareLogListItem[] | undefined) =>
          replaceOptimisticCareLogId(old ?? [], ctx.tempId, realId),
        );
      }
    },
    onSettled: () => {
      router.refresh();
    },
  });
}

export function useUpdateCareLogMutation(
  collectionSlug: string,
  plantSlug: string,
) {
  const qc = useQueryClient();
  const router = useRouter();
  const key = queryKeys.plant.careLogs(collectionSlug, plantSlug);

  return useMutation({
    mutationFn: async (input: UpdateCareLogInput) => {
      const res = await updateCareLogAction(input);
      if (!res.ok) throw new Error(res.error);
      return res;
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<CareLogListItem[]>(key);
      const actionAt =
        input.actionAt instanceof Date
          ? input.actionAt
          : new Date(input.actionAt as string);
      const actionAtIso = actionAt.toISOString();
      qc.setQueryData(key, (old: CareLogListItem[] | undefined) =>
        (old ?? []).map((row) =>
          row.id === input.careLogId
            ? {
                ...row,
                actionType: input.actionType,
                actionAt: actionAtIso,
                notes: input.notes ?? null,
                metadata: (input.metadata as Record<string, unknown>) ?? {},
                tags: input.tags ?? [],
                updatedAt: new Date().toISOString(),
              }
            : row,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(key, ctx.previous);
      }
    },
    onSettled: () => {
      router.refresh();
    },
  });
}

export function useDeleteCareLogMutation(
  collectionSlug: string,
  plantSlug: string,
) {
  const qc = useQueryClient();
  const router = useRouter();
  const key = queryKeys.plant.careLogs(collectionSlug, plantSlug);

  return useMutation({
    mutationFn: async (input: DeleteCareLogInput) => {
      const res = await deleteCareLogAction(input);
      if (!res.ok) throw new Error(res.error);
      return res;
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<CareLogListItem[]>(key);
      qc.setQueryData(key, (old: CareLogListItem[] | undefined) =>
        (old ?? []).filter((r) => r.id !== input.careLogId),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(key, ctx.previous);
      }
    },
    onSettled: () => {
      router.refresh();
    },
  });
}
