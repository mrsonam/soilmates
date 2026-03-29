import type { LucideIcon } from "lucide-react";
import {
  Bug,
  CircleOff,
  Copy,
  Droplets,
  Eye,
  Leaf,
  MapPin,
  PackageOpen,
  Pencil,
  RotateCw,
  Scissors,
  Sparkles,
  Sprout,
  Layers,
} from "lucide-react";
import type { CareLogActionTypeValue } from "@/lib/validations/care-log";

export const CARE_LOG_ACTION_OPTIONS: {
  value: CareLogActionTypeValue;
  label: string;
  Icon: LucideIcon;
}[] = [
  { value: "watered", label: "Watered", Icon: Droplets },
  { value: "fertilized", label: "Fertilized", Icon: Leaf },
  { value: "misted", label: "Misted", Icon: Droplets },
  { value: "pruned", label: "Pruned", Icon: Scissors },
  { value: "repotted", label: "Repotted", Icon: PackageOpen },
  { value: "soil_changed", label: "Soil changed", Icon: Layers },
  { value: "rotated", label: "Rotated", Icon: RotateCw },
  { value: "moved_location", label: "Moved", Icon: MapPin },
  { value: "pest_treatment", label: "Pest treatment", Icon: Bug },
  { value: "cleaned_leaves", label: "Cleaned leaves", Icon: Sparkles },
  { value: "propagated", label: "Propagated", Icon: Copy },
  { value: "seeded", label: "Seeded", Icon: Sprout },
  { value: "germinated", label: "Germinated", Icon: Sprout },
  { value: "harvested", label: "Harvested", Icon: Leaf },
  { value: "plant_died", label: "Plant died", Icon: CircleOff },
  { value: "observation", label: "Observation", Icon: Eye },
  { value: "custom", label: "Custom", Icon: Pencil },
];

export function careLogActionLabel(type: string): string {
  const row = CARE_LOG_ACTION_OPTIONS.find((o) => o.value === type);
  if (row) return row.label;
  return type.replace(/_/g, " ");
}

export function careLogActionIcon(type: string): LucideIcon {
  const row = CARE_LOG_ACTION_OPTIONS.find((o) => o.value === type);
  return row?.Icon ?? Pencil;
}

export function formatDateTimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
