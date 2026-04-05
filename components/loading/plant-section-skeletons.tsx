import type { ReactNode } from "react";
import { SkeletonBlock, SkeletonLine } from "./skeleton-primitives";
import type { PlantDetailTabId } from "@/components/plants/detail/plant-section-tabs";

function SectionShell({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-5 animate-page-enter" aria-busy aria-label="Loading section">
      {children}
    </div>
  );
}

export function PlantSectionSkeleton({ variant }: { variant: PlantDetailTabId }) {
  switch (variant) {
    case "overview":
      return (
        <SectionShell>
          <div className="grid gap-4 sm:grid-cols-2">
            <SkeletonBlock className="h-32 rounded-3xl" />
            <SkeletonBlock className="h-32 rounded-3xl" />
          </div>
          <SkeletonLine className="h-4 w-[88%]" />
          <SkeletonLine className="h-4 w-full" />
          <SkeletonBlock className="h-36 rounded-3xl" />
        </SectionShell>
      );
    case "care_history":
      return (
        <SectionShell>
          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-10 w-28 rounded-full" />
            <SkeletonBlock className="h-10 w-24 rounded-full" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-[4.5rem] w-full rounded-2xl" />
          ))}
        </SectionShell>
      );
    case "photos":
      return (
        <SectionShell>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonBlock key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </SectionShell>
      );
    case "reminders":
      return (
        <SectionShell>
          <SkeletonBlock className="h-12 w-full max-w-xs rounded-2xl" />
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-24 rounded-2xl" />
          ))}
        </SectionShell>
      );
    case "assistant":
      return (
        <SectionShell>
          <div className="space-y-3 rounded-2xl bg-surface-container-low/50 p-4 ring-1 ring-outline-variant/10">
            <SkeletonBlock className="ml-auto h-14 w-[85%] max-w-md rounded-2xl rounded-br-md" />
            <SkeletonBlock className="h-16 w-[78%] max-w-lg rounded-2xl rounded-bl-md" />
            <SkeletonBlock className="h-12 w-full max-w-sm rounded-2xl" />
          </div>
        </SectionShell>
      );
    case "activity":
      return (
        <SectionShell>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-16 rounded-2xl" />
          ))}
        </SectionShell>
      );
    default:
      return (
        <SectionShell>
          <SkeletonBlock className="h-40 rounded-3xl" />
        </SectionShell>
      );
  }
}
