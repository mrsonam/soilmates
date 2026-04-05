"use client";

import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import {
  archiveReminderAction,
  completeReminderAction,
  createReminderAction,
  pauseReminderAction,
  resumeReminderAction,
  updateReminderAction,
} from "@/app/(app)/collections/[collectionSlug]/plants/reminder-actions";
import { dedupeRemindersById } from "@/lib/optimistic/reconcile-lists";
import {
  buildOptimisticReminderFromCreateInput,
  makeOptimisticReminderId,
  optimisticReminderAfterComplete,
  optimisticReminderAfterPause,
  optimisticReminderAfterResume,
  replaceOptimisticReminderId,
} from "@/lib/optimistic/reminder-optimistic";
import type { ReminderListItem } from "@/lib/reminders/queries";
import { queryKeys } from "@/lib/query-keys";
import { SyncEntityType, SyncOperationType } from "@/lib/sync/operation-types";
import { runOrEnqueueMutation } from "@/lib/sync/run-or-enqueue";
import {
  createReminderInputSchema,
  updateReminderInputSchema,
} from "@/lib/validations/reminder";

type CreateReminderInput = z.infer<typeof createReminderInputSchema>;
type UpdateReminderInput = z.infer<typeof updateReminderInputSchema>;

export function useReminderMutations(
  collectionSlug: string,
  plantSlug: string,
) {
  const qc = useQueryClient();
  const router = useRouter();
  const key = queryKeys.plant.reminders(collectionSlug, plantSlug);

  const complete = useMutation({
    mutationFn: async (reminderId: string) => {
      const res = await runOrEnqueueMutation({
        operationType: SyncOperationType.REMINDER_COMPLETE,
        entityType: SyncEntityType.REMINDER,
        entityId: reminderId,
        payload: { collectionSlug, plantSlug, reminderId },
        execute: () =>
          completeReminderAction({
            collectionSlug,
            plantSlug,
            reminderId,
          }),
      });
      if (!res.ok) throw new Error(res.error ?? "Could not complete");
      return res;
    },
    onMutate: async (reminderId) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<ReminderListItem[]>(key);
      const item = previous?.find((r) => r.id === reminderId);
      if (!item) return { previous };
      const next = optimisticReminderAfterComplete(item);
      qc.setQueryData(key, (old: ReminderListItem[] | undefined) =>
        (old ?? []).map((r) => (r.id === reminderId ? next : r)),
      );
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(key, ctx.previous);
      }
    },
    onSettled: () => {
      router.refresh();
    },
  });

  const pause = useMutation({
    mutationFn: async (reminderId: string) => {
      const res = await runOrEnqueueMutation({
        operationType: SyncOperationType.REMINDER_PAUSE,
        entityType: SyncEntityType.REMINDER,
        entityId: reminderId,
        payload: { collectionSlug, plantSlug, reminderId },
        execute: () =>
          pauseReminderAction({
            collectionSlug,
            plantSlug,
            reminderId,
          }),
      });
      if (!res.ok) throw new Error(res.error ?? "Could not pause");
      return res;
    },
    onMutate: async (reminderId) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<ReminderListItem[]>(key);
      const item = previous?.find((r) => r.id === reminderId);
      if (!item) return { previous };
      const next = optimisticReminderAfterPause(item);
      qc.setQueryData(key, (old: ReminderListItem[] | undefined) =>
        (old ?? []).map((r) => (r.id === reminderId ? next : r)),
      );
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(key, ctx.previous);
      }
    },
    onSettled: () => {
      router.refresh();
    },
  });

  const resume = useMutation({
    mutationFn: async (reminderId: string) => {
      const res = await runOrEnqueueMutation({
        operationType: SyncOperationType.REMINDER_RESUME,
        entityType: SyncEntityType.REMINDER,
        entityId: reminderId,
        payload: { collectionSlug, plantSlug, reminderId },
        execute: () =>
          resumeReminderAction({
            collectionSlug,
            plantSlug,
            reminderId,
          }),
      });
      if (!res.ok) throw new Error(res.error ?? "Could not resume");
      return res;
    },
    onMutate: async (reminderId) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<ReminderListItem[]>(key);
      const item = previous?.find((r) => r.id === reminderId);
      if (!item) return { previous };
      const next = optimisticReminderAfterResume(item);
      qc.setQueryData(key, (old: ReminderListItem[] | undefined) =>
        (old ?? []).map((r) => (r.id === reminderId ? next : r)),
      );
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(key, ctx.previous);
      }
    },
    onSettled: () => {
      router.refresh();
    },
  });

  const archive = useMutation({
    mutationFn: async (reminderId: string) => {
      const res = await runOrEnqueueMutation({
        operationType: SyncOperationType.REMINDER_ARCHIVE,
        entityType: SyncEntityType.REMINDER,
        entityId: reminderId,
        payload: { collectionSlug, plantSlug, reminderId },
        execute: () =>
          archiveReminderAction({
            collectionSlug,
            plantSlug,
            reminderId,
          }),
      });
      if (!res.ok) throw new Error(res.error ?? "Could not archive");
      return res;
    },
    onMutate: async (reminderId) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<ReminderListItem[]>(key);
      qc.setQueryData(key, (old: ReminderListItem[] | undefined) =>
        (old ?? []).filter((r) => r.id !== reminderId),
      );
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(key, ctx.previous);
      }
    },
    onSettled: () => {
      router.refresh();
    },
  });

  return useMemo(
    () => ({ complete, pause, resume, archive }),
    [complete, pause, resume, archive],
  );
}

export function useCreateReminderMutation(
  collectionSlug: string,
  plantSlug: string,
) {
  const qc = useQueryClient();
  const router = useRouter();
  const key = queryKeys.plant.reminders(collectionSlug, plantSlug);

  return useMutation({
    mutationFn: async (input: CreateReminderInput) => {
      const res = await createReminderAction(input);
      if (!res.ok) throw new Error(res.error);
      return res;
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<ReminderListItem[]>(key);
      const tempId = makeOptimisticReminderId();
      const optimistic = buildOptimisticReminderFromCreateInput({
        id: tempId,
        reminderType: input.reminderType,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        intervalValue: input.intervalValue,
        intervalUnit: input.intervalUnit,
        preferredWindow: input.preferredWindow ?? null,
        gracePeriodHours: input.gracePeriodHours ?? null,
        overdueAfterHours: input.overdueAfterHours ?? null,
      });
      qc.setQueryData(key, (old: ReminderListItem[] | undefined) =>
        dedupeRemindersById([optimistic, ...(old ?? [])]),
      );
      return { previous, tempId };
    },
    onError: (_e, _i, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(key, ctx.previous);
      } else if (ctx?.tempId) {
        qc.setQueryData(key, (old: ReminderListItem[] | undefined) =>
          (old ?? []).filter((r) => r.id !== ctx.tempId),
        );
      }
    },
    onSuccess: (data, _i, ctx) => {
      if (data.ok && data.reminderId && ctx?.tempId) {
        qc.setQueryData(key, (old: ReminderListItem[] | undefined) =>
          replaceOptimisticReminderId(
            old ?? [],
            ctx.tempId,
            data.reminderId as string,
          ),
        );
      }
    },
    onSettled: () => {
      router.refresh();
    },
  });
}

export function useUpdateReminderMutation(
  collectionSlug: string,
  plantSlug: string,
) {
  const qc = useQueryClient();
  const router = useRouter();
  const key = queryKeys.plant.reminders(collectionSlug, plantSlug);

  return useMutation({
    mutationFn: async (input: UpdateReminderInput) => {
      const res = await updateReminderAction(input);
      if (!res.ok) throw new Error(res.error);
      return res;
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<ReminderListItem[]>(key);
      qc.setQueryData(key, (old: ReminderListItem[] | undefined) =>
        (old ?? []).map((r) =>
          r.id === input.reminderId
            ? {
                ...r,
                title: input.title.trim(),
                description: input.description?.trim() || null,
                recurrenceRule: {
                  intervalValue: input.intervalValue,
                  intervalUnit: input.intervalUnit,
                },
                preferredWindow: input.preferredWindow ?? null,
                gracePeriodHours: input.gracePeriodHours ?? null,
                overdueAfterHours: input.overdueAfterHours ?? null,
              }
            : r,
        ),
      );
      return { previous };
    },
    onError: (_e, _i, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(key, ctx.previous);
      }
    },
    onSettled: () => {
      router.refresh();
    },
  });
}
