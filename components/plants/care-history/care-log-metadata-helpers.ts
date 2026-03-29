import type { CareLogActionTypeValue } from "@/lib/validations/care-log";

export type CareLogFormMetaFields = {
  waterMl: string;
  fertilizerType: string;
  soilMix: string;
  harvestAmount: string;
  movedReason: string;
};

export function buildCareLogMetadata(
  actionType: CareLogActionTypeValue,
  f: CareLogFormMetaFields,
): Record<string, string | number> {
  const m: Record<string, string | number> = {};

  if (actionType === "watered" || actionType === "misted") {
    const n = Number(f.waterMl);
    if (!Number.isNaN(n) && n > 0) m.waterAmountMl = Math.round(n);
  }
  if (actionType === "fertilized" && f.fertilizerType.trim()) {
    m.fertilizerType = f.fertilizerType.trim().slice(0, 200);
  }
  if (
    (actionType === "repotted" || actionType === "soil_changed") &&
    f.soilMix.trim()
  ) {
    m.soilMix = f.soilMix.trim().slice(0, 500);
  }
  if (actionType === "harvested" && f.harvestAmount.trim()) {
    m.harvestAmount = f.harvestAmount.trim().slice(0, 120);
  }
  if (
    (actionType === "moved_location" || actionType === "rotated") &&
    f.movedReason.trim()
  ) {
    m.movedReason = f.movedReason.trim().slice(0, 500);
  }

  return m;
}

export function parseTagsInput(raw: string): string[] {
  return raw
    .split(/[,#]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 24);
}
