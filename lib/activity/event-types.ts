/** Extensible activity event type strings (stored in DB). */
export const ActivityEventTypes = {
  collectionCreated: "collection_created",
  areaCreated: "area_created",
  areaUpdated: "area_updated",
  plantAdded: "plant_added",
  plantMoved: "plant_moved",
  careLogAdded: "care_log_added",
  careLogUpdated: "care_log_updated",
  reminderCreated: "reminder_created",
  reminderCompleted: "reminder_completed",
  imageUploaded: "image_uploaded",
  coverImageChanged: "cover_image_changed",
  collectionCoverChanged: "collection_cover_changed",
  areaCoverChanged: "area_cover_changed",
} as const;

export type ActivityEventTypeId =
  (typeof ActivityEventTypes)[keyof typeof ActivityEventTypes];
