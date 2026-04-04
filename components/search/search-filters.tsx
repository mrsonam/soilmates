"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AppSelect } from "@/components/ui/app-select";
import type { GlobalSearchFilters, SearchEntityType } from "@/lib/search/types";

type CollectionOption = { id: string; slug: string; name: string };

function setParam(params: URLSearchParams, key: string, value: string | null) {
  if (!value) params.delete(key);
  else params.set(key, value);
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
        active
          ? "bg-primary text-on-primary shadow-(--shadow-ambient)"
          : "bg-surface-container-high text-on-surface ring-1 ring-outline-variant/15 hover:bg-surface-container-highest",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export function SearchFilters({
  collections,
  activeFilters,
  counts,
}: {
  collections: CollectionOption[];
  activeFilters: GlobalSearchFilters;
  counts: { total: number } & Record<string, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const params = useMemo(() => new URLSearchParams(sp?.toString() ?? ""), [sp]);

  function update(next: Partial<Record<string, string | null>>) {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      setParam(p, k, v ?? null);
    }
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }

  const entityChips: Array<{ type: SearchEntityType; label: string; countKey: string }> =
    [
      { type: "all", label: `All (${counts.total})`, countKey: "total" },
      { type: "plants", label: `Plants (${counts.plants})`, countKey: "plants" },
      {
        type: "collections",
        label: `Collections (${counts.collections})`,
        countKey: "collections",
      },
      { type: "areas", label: `Areas (${counts.areas})`, countKey: "areas" },
      {
        type: "reminders",
        label: `Reminders (${counts.reminders})`,
        countKey: "reminders",
      },
      {
        type: "care_logs",
        label: `Care logs (${counts.careLogs})`,
        countKey: "careLogs",
      },
      { type: "photos", label: `Photos (${counts.photos})`, countKey: "photos" },
      { type: "activity", label: `Activity (${counts.activity})`, countKey: "activity" },
    ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {entityChips.map((c) => (
          <Chip
            key={c.type}
            label={c.label}
            active={activeFilters.type === c.type}
            onClick={() => update({ type: c.type === "all" ? null : c.type })}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AppSelect
          variant="toolbar"
          className="min-w-[11rem] max-w-[min(100vw,16rem)]"
          options={[
            { value: "", label: "All spaces" },
            ...collections.map((c) => ({ value: c.slug, label: c.name })),
          ]}
          value={activeFilters.collectionSlug ?? ""}
          onChange={(v) =>
            update({ collection: v ? v : null })
          }
          aria-label="Filter by collection"
        />

        <AppSelect
          variant="toolbar"
          className="min-w-[10.5rem]"
          options={[
            { value: "", label: "Any health" },
            { value: "thriving", label: "Thriving" },
            { value: "needs_attention", label: "Needs attention" },
          ]}
          value={activeFilters.plantHealthStatus ?? ""}
          onChange={(v) =>
            update({ plantHealth: v ? v : null })
          }
          aria-label="Filter plants by health"
        />

        <AppSelect
          variant="toolbar"
          className="min-w-[10rem]"
          options={[
            { value: "", label: "Any stage" },
            { value: "sprout", label: "Sprout" },
            { value: "juvenile", label: "Juvenile" },
            { value: "mature", label: "Mature" },
          ]}
          value={activeFilters.plantLifeStage ?? ""}
          onChange={(v) =>
            update({ plantStage: v ? v : null })
          }
          aria-label="Filter plants by life stage"
        />

        <AppSelect
          variant="toolbar"
          className="min-w-[12rem]"
          options={[
            { value: "", label: "Any reminder status" },
            { value: "upcoming", label: "Upcoming" },
            { value: "due", label: "Due" },
            { value: "overdue", label: "Overdue" },
            { value: "paused", label: "Paused" },
          ]}
          value={activeFilters.reminderStatus ?? ""}
          onChange={(v) =>
            update({ reminderStatus: v ? v : null })
          }
          aria-label="Filter reminders by status"
        />

        <AppSelect
          variant="toolbar"
          className="min-w-[12rem] max-w-[min(100vw,18rem)]"
          options={[
            { value: "", label: "Any care action" },
            { value: "watered", label: "Watered" },
            { value: "fertilized", label: "Fertilized" },
            { value: "misted", label: "Misted" },
            { value: "pruned", label: "Pruned" },
            { value: "repotted", label: "Repotted" },
            { value: "soil_changed", label: "Soil changed" },
            { value: "rotated", label: "Rotated" },
            { value: "moved_location", label: "Moved location" },
            { value: "pest_treatment", label: "Pest treatment" },
            { value: "cleaned_leaves", label: "Cleaned leaves" },
            { value: "propagated", label: "Propagated" },
            { value: "seeded", label: "Seeded" },
            { value: "germinated", label: "Germinated" },
            { value: "harvested", label: "Harvested" },
            { value: "plant_died", label: "Plant died" },
            { value: "observation", label: "Observation" },
            { value: "custom", label: "Custom" },
          ]}
          value={activeFilters.careActionType ?? ""}
          onChange={(v) =>
            update({ careAction: v ? v : null })
          }
          aria-label="Filter care logs by action"
        />

        <button
          type="button"
          onClick={() =>
            update({
              type: null,
              collection: null,
              plantHealth: null,
              plantStage: null,
              reminderStatus: null,
              careAction: null,
            })
          }
          className="h-10 rounded-2xl bg-surface-container-high px-3 text-sm font-medium text-on-surface-variant ring-1 ring-outline-variant/15 transition hover:bg-surface-container-highest hover:text-on-surface"
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}

