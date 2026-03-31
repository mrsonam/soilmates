"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
        <select
          value={activeFilters.collectionSlug ?? ""}
          onChange={(e) =>
            update({ collection: e.target.value ? e.target.value : null })
          }
          className="h-10 rounded-2xl bg-surface-container-high px-3 text-sm text-on-surface ring-1 ring-outline-variant/15 outline-none transition focus:ring-2 focus:ring-primary/25"
          aria-label="Filter by collection"
        >
          <option value="">All spaces</option>
          {collections.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={activeFilters.plantHealthStatus ?? ""}
          onChange={(e) =>
            update({ plantHealth: e.target.value ? e.target.value : null })
          }
          className="h-10 rounded-2xl bg-surface-container-high px-3 text-sm text-on-surface ring-1 ring-outline-variant/15 outline-none transition focus:ring-2 focus:ring-primary/25"
          aria-label="Filter plants by health"
        >
          <option value="">Any health</option>
          <option value="thriving">Thriving</option>
          <option value="needs_attention">Needs attention</option>
        </select>

        <select
          value={activeFilters.plantLifeStage ?? ""}
          onChange={(e) =>
            update({ plantStage: e.target.value ? e.target.value : null })
          }
          className="h-10 rounded-2xl bg-surface-container-high px-3 text-sm text-on-surface ring-1 ring-outline-variant/15 outline-none transition focus:ring-2 focus:ring-primary/25"
          aria-label="Filter plants by life stage"
        >
          <option value="">Any stage</option>
          <option value="sprout">Sprout</option>
          <option value="juvenile">Juvenile</option>
          <option value="mature">Mature</option>
        </select>

        <select
          value={activeFilters.reminderStatus ?? ""}
          onChange={(e) =>
            update({
              reminderStatus: e.target.value ? e.target.value : null,
            })
          }
          className="h-10 rounded-2xl bg-surface-container-high px-3 text-sm text-on-surface ring-1 ring-outline-variant/15 outline-none transition focus:ring-2 focus:ring-primary/25"
          aria-label="Filter reminders by status"
        >
          <option value="">Any reminder status</option>
          <option value="upcoming">Upcoming</option>
          <option value="due">Due</option>
          <option value="overdue">Overdue</option>
          <option value="paused">Paused</option>
        </select>

        <select
          value={activeFilters.careActionType ?? ""}
          onChange={(e) =>
            update({ careAction: e.target.value ? e.target.value : null })
          }
          className="h-10 rounded-2xl bg-surface-container-high px-3 text-sm text-on-surface ring-1 ring-outline-variant/15 outline-none transition focus:ring-2 focus:ring-primary/25"
          aria-label="Filter care logs by action"
        >
          <option value="">Any care action</option>
          <option value="watered">Watered</option>
          <option value="fertilized">Fertilized</option>
          <option value="misted">Misted</option>
          <option value="pruned">Pruned</option>
          <option value="repotted">Repotted</option>
          <option value="soil_changed">Soil changed</option>
          <option value="rotated">Rotated</option>
          <option value="moved_location">Moved location</option>
          <option value="pest_treatment">Pest treatment</option>
          <option value="cleaned_leaves">Cleaned leaves</option>
          <option value="propagated">Propagated</option>
          <option value="seeded">Seeded</option>
          <option value="germinated">Germinated</option>
          <option value="harvested">Harvested</option>
          <option value="plant_died">Plant died</option>
          <option value="observation">Observation</option>
          <option value="custom">Custom</option>
        </select>

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

