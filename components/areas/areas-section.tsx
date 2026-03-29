import { MapPin, Plus } from "lucide-react";
import type { AreaForCollectionDetail } from "@/lib/collections/collection-detail";
import { AreaCard } from "./area-card";
import { AreasEmptyState } from "./areas-empty-state";

type AreasSectionProps = {
  collectionSlug: string;
  areas: AreaForCollectionDetail[];
  onCreateClick: () => void;
  onEditArea: (area: AreaForCollectionDetail) => void;
};

export function AreasSection({
  collectionSlug,
  areas,
  onCreateClick,
  onEditArea,
}: AreasSectionProps) {
  return (
    <div className="mt-6 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-primary">
            <MapPin className="size-5" strokeWidth={1.75} aria-hidden />
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
              Your living spaces
            </p>
          </div>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-on-surface">
            Areas
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-on-surface-variant">
            Manage and monitor specific environments in your collection—rooms,
            shelves, and outdoor spots.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateClick}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-primary px-5 text-sm font-medium text-on-primary transition hover:bg-primary/90 sm:self-auto"
        >
          <Plus className="size-4" strokeWidth={2.25} aria-hidden />
          Add new area
        </button>
      </div>

      {areas.length === 0 ? (
        <AreasEmptyState onCreateClick={onCreateClick} />
      ) : (
        <>
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {areas.map((area) => (
              <li key={area.id}>
                <AreaCard
                  area={area}
                  collectionSlug={collectionSlug}
                  onEdit={() => onEditArea(area)}
                />
              </li>
            ))}
          </ul>

          <section className="rounded-3xl bg-surface-container-low p-6 ring-1 ring-outline-variant/[0.08] sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-xl text-sm leading-relaxed text-on-surface-variant">
                Across all{" "}
                <span className="font-medium text-on-surface">{areas.length}</span>{" "}
                active {areas.length === 1 ? "area" : "areas"}, environment
                summaries and averages will appear here as you connect plants and
                optional sensors.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 lg:shrink-0">
                <div className="text-center">
                  <div
                    className="mx-auto flex size-24 items-center justify-center rounded-full border-4 border-primary/25 bg-primary-fixed/30 font-display text-lg font-semibold text-primary"
                    aria-hidden
                  >
                    94%
                  </div>
                  <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
                    Hydration
                  </p>
                </div>
                <div className="text-center">
                  <div
                    className="mx-auto flex size-24 items-center justify-center rounded-full border-4 border-[#d4a574]/40 bg-[#f2d4b8]/40 font-display text-lg font-semibold text-[#6b5348]"
                    aria-hidden
                  >
                    75%
                  </div>
                  <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
                    Sun exposure
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-on-surface-variant/70 lg:text-left">
              Sample rings — live data when plant care tracking is enabled.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
