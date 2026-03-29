"use client";

import { Droplets, Eye, Leaf, LayoutList, PackageOpen } from "lucide-react";

export type CareHistoryFilterId =
  | "all"
  | "watering"
  | "fertilizing"
  | "repotting"
  | "observations"
  | "other";

const FILTERS: {
  id: CareHistoryFilterId;
  label: string;
  Icon?: typeof Droplets;
}[] = [
  { id: "all", label: "All logs", Icon: LayoutList },
  { id: "watering", label: "Watering", Icon: Droplets },
  { id: "fertilizing", label: "Fertilizing", Icon: Leaf },
  { id: "repotting", label: "Repotting", Icon: PackageOpen },
  { id: "observations", label: "Observations", Icon: Eye },
  { id: "other", label: "Other" },
];

export function matchesCareHistoryFilter(
  actionType: string,
  filter: CareHistoryFilterId,
): boolean {
  if (filter === "all") return true;
  if (filter === "watering")
    return actionType === "watered" || actionType === "misted";
  if (filter === "fertilizing") return actionType === "fertilized";
  if (filter === "repotting")
    return (
      actionType === "repotted" ||
      actionType === "soil_changed" ||
      actionType === "propagated"
    );
  if (filter === "observations") return actionType === "observation";
  if (filter === "other") {
    return !matchesCareHistoryFilter(actionType, "watering") &&
      !matchesCareHistoryFilter(actionType, "fertilizing") &&
      !matchesCareHistoryFilter(actionType, "repotting") &&
      !matchesCareHistoryFilter(actionType, "observations");
  }
  return true;
}

type CareHistoryFiltersProps = {
  active: CareHistoryFilterId;
  onChange: (id: CareHistoryFilterId) => void;
};

export function CareHistoryFilters({
  active,
  onChange,
}: CareHistoryFiltersProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Filter care logs"
    >
      {FILTERS.map(({ id, label, Icon }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(id)}
            className={[
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition",
              selected
                ? "bg-primary text-on-primary"
                : "bg-surface-container-high text-on-surface-variant ring-1 ring-outline-variant/10 hover:bg-surface-container-highest hover:text-on-surface",
            ].join(" ")}
          >
            {Icon ? (
              <Icon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            ) : null}
            {label}
          </button>
        );
      })}
    </div>
  );
}
