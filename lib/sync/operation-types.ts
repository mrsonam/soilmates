/** Queue operation_type values — deterministic replay routing */

export const SyncOperationType = {
  QUICK_CARE_LOG: "quick_care_log",
  DETAILED_CARE_LOG_CREATE: "detailed_care_log_create",
  CARE_LOG_UPDATE: "care_log_update",
  CARE_LOG_DELETE: "care_log_delete",
  REMINDER_COMPLETE: "reminder_complete",
  REMINDER_PAUSE: "reminder_pause",
  REMINDER_RESUME: "reminder_resume",
  REMINDER_ARCHIVE: "reminder_archive",
  REMINDER_UPDATE: "reminder_update",
  PLANT_PATCH_SIMPLE: "plant_patch_simple",
  IMAGE_UPLOAD: "image_upload",
} as const;

export type SyncOperationTypeValue =
  (typeof SyncOperationType)[keyof typeof SyncOperationType];

export const SyncEntityType = {
  CARE_LOG: "care_log",
  REMINDER: "reminder",
  PLANT: "plant",
  PLANT_IMAGE: "plant_image",
} as const;
