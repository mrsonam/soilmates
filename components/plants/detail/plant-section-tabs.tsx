"use client";

import { Sparkles } from "lucide-react";

export type PlantDetailTabId =
  | "overview"
  | "care_history"
  | "photos"
  | "reminders"
  | "assistant"
  | "activity";

const TABS: { id: PlantDetailTabId; label: string; icon?: "sparkles" }[] = [
  { id: "overview", label: "Overview" },
  { id: "care_history", label: "Care history" },
  { id: "photos", label: "Photos" },
  { id: "reminders", label: "Reminders" },
  { id: "assistant", label: "Assistant", icon: "sparkles" },
  { id: "activity", label: "Activity" },
];

type PlantSectionTabsProps = {
  active: PlantDetailTabId;
  onChange: (id: PlantDetailTabId) => void;
  /** True while a tab content transition is in flight (React concurrent). */
  transitioning?: boolean;
};

export function PlantSectionTabs({
  active,
  onChange,
  transitioning = false,
}: PlantSectionTabsProps) {
  return (
    <div
      className="-mx-1 overflow-x-auto pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Plant sections"
      aria-busy={transitioning}
    >
      <div className="flex min-w-min gap-1 border-b border-outline-variant/10 px-1">
        {TABS.map((t) => {
          const selected = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(t.id)}
              className={[
                "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-t-xl px-4 py-3 text-sm font-medium transition-[color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                selected
                  ? "font-semibold text-primary"
                  : "text-on-surface-variant hover:text-on-surface",
              ].join(" ")}
            >
              {t.icon === "sparkles" ? (
                <Sparkles
                  className="size-3.5 shrink-0 opacity-80"
                  strokeWidth={1.75}
                  aria-hidden
                />
              ) : null}
              {t.label}
              {selected ? (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
