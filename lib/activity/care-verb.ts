import type { CareLogActionType } from "@prisma/client";

/** Past-tense verb for care summaries: "watered", "fertilized", … */
export function careActionVerbPast(action: CareLogActionType): string {
  const map: Record<CareLogActionType, string> = {
    watered: "watered",
    fertilized: "fertilized",
    misted: "misted",
    pruned: "pruned",
    repotted: "repotted",
    soil_changed: "changed soil for",
    rotated: "rotated",
    moved_location: "moved",
    pest_treatment: "treated pests on",
    cleaned_leaves: "cleaned leaves on",
    propagated: "propagated",
    seeded: "seeded",
    germinated: "germinated",
    harvested: "harvested from",
    plant_died: "recorded loss of",
    observation: "noted an observation for",
    custom: "logged care for",
  };
  return map[action] ?? "cared for";
}
