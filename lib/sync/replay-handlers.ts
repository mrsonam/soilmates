import { createQuickCareLogAction } from "@/app/(app)/collections/[collectionSlug]/plants/care-log-actions";
import {
  createDetailedCareLogAction,
  deleteCareLogAction,
  updateCareLogAction,
} from "@/app/(app)/collections/[collectionSlug]/plants/care-log-mutations";
import {
  archiveReminderAction,
  completeReminderAction,
  pauseReminderAction,
  resumeReminderAction,
  updateReminderAction,
} from "@/app/(app)/collections/[collectionSlug]/plants/reminder-actions";
import { uploadPlantImagesAction } from "@/app/(app)/collections/[collectionSlug]/plants/plant-image-actions";
import { patchPlantSimpleAction } from "@/app/(app)/collections/[collectionSlug]/plants/plant-patch-actions";
import { SyncOperationType } from "./operation-types";
import type { QueuedImageUploadRecord } from "@/lib/offline/schema";

type ActionResult = { ok: true } | { ok: false; error: string; conflict?: boolean };

export async function replayMutation(
  operationType: string,
  payload: Record<string, unknown>,
): Promise<ActionResult> {
  switch (operationType) {
    case SyncOperationType.QUICK_CARE_LOG:
      return createQuickCareLogAction({
        collectionSlug: String(payload.collectionSlug ?? ""),
        plantSlug: String(payload.plantSlug ?? ""),
        actionType: String(payload.actionType ?? ""),
      });
    case SyncOperationType.DETAILED_CARE_LOG_CREATE:
      return createDetailedCareLogAction(payload);
    case SyncOperationType.CARE_LOG_UPDATE:
      return updateCareLogAction(payload);
    case SyncOperationType.CARE_LOG_DELETE:
      return deleteCareLogAction(payload);
    case SyncOperationType.REMINDER_COMPLETE:
      return completeReminderAction({
        collectionSlug: String(payload.collectionSlug ?? ""),
        plantSlug: String(payload.plantSlug ?? ""),
        reminderId: String(payload.reminderId ?? ""),
      });
    case SyncOperationType.REMINDER_PAUSE:
      return pauseReminderAction({
        collectionSlug: String(payload.collectionSlug ?? ""),
        plantSlug: String(payload.plantSlug ?? ""),
        reminderId: String(payload.reminderId ?? ""),
      });
    case SyncOperationType.REMINDER_RESUME:
      return resumeReminderAction({
        collectionSlug: String(payload.collectionSlug ?? ""),
        plantSlug: String(payload.plantSlug ?? ""),
        reminderId: String(payload.reminderId ?? ""),
      });
    case SyncOperationType.REMINDER_ARCHIVE:
      return archiveReminderAction({
        collectionSlug: String(payload.collectionSlug ?? ""),
        plantSlug: String(payload.plantSlug ?? ""),
        reminderId: String(payload.reminderId ?? ""),
      });
    case SyncOperationType.REMINDER_UPDATE:
      return updateReminderAction(payload);
    case SyncOperationType.PLANT_PATCH_SIMPLE: {
      const r = await patchPlantSimpleAction(payload);
      if (r.ok) return { ok: true };
      return {
        ok: false,
        error: r.error,
        conflict: Boolean(r.conflict),
      };
    }
    default:
      return { ok: false, error: "Unknown offline operation." };
  }
}

export async function replayImageUpload(
  record: QueuedImageUploadRecord,
): Promise<ActionResult> {
  const blob = new Blob([record.blob], { type: record.mimeType });
  const file = new File([blob], record.fileName, { type: record.mimeType });
  const fd = new FormData();
  fd.set("collectionSlug", record.collectionSlug);
  fd.set("plantSlug", record.plantSlug);
  fd.set("mode", record.mode);
  fd.set("file", file);
  if (record.capturedAt) {
    fd.set("capturedAt", record.capturedAt);
  }
  const r = await uploadPlantImagesAction(fd);
  if (r.ok) return { ok: true };
  return { ok: false, error: r.error };
}
