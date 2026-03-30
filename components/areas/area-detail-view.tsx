import Link from "next/link";
import { Plus, Sprout } from "lucide-react";
import type { PlantListItem } from "@/lib/plants/queries";
import { CollectionSectionTabs } from "@/components/collections/collection-section-tabs";
import { InlineCoverEdit } from "@/components/collections/inline-cover-edit";
import { PlantsGrid } from "@/components/plants/plants-grid";
import { PlantsEmptyState } from "@/components/plants/plants-empty-state";

type AreaDetailViewProps = {
  collectionSlug: string;
  collectionName: string;
  areaName: string;
  areaSlug: string;
  description: string | null;
  plantCount: number;
  coverImageSignedUrl: string | null;
  uploadsEnabled: boolean;
  areaId: string;
  plants: PlantListItem[];
};

export function AreaDetailView({
  collectionSlug,
  collectionName,
  areaName,
  description,
  plantCount,
  coverImageSignedUrl,
  uploadsEnabled,
  areaId,
  plants,
}: AreaDetailViewProps) {
  const addPlantHref = `/collections/${collectionSlug}/plants/new`;

  return (
    <div>
      <CollectionSectionTabs
        collectionSlug={collectionSlug}
        className="mb-8"
      />

      <section
        className="relative isolate min-h-[min(52vw,22rem)] w-full overflow-hidden rounded-3xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] ring-1 ring-black/5 sm:min-h-[min(44vw,26rem)] lg:min-h-[min(36vw,28rem)]"
        aria-label="Area cover"
      >
        {coverImageSignedUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- signed URL */}
            <img
              src={coverImageSignedUrl}
              alt={`Cover photo for ${areaName}`}
              className="absolute inset-0 size-full object-cover object-center"
            />
            <div
              className="absolute inset-0 bg-gradient-to-br from-on-surface/15 via-transparent to-on-surface/10"
              aria-hidden
            />
          </>
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary-fixed/45 via-surface-container-low to-primary-fixed-dim/55"
            aria-hidden
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(81,100,71,0.2),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_90%,rgba(212,233,196,0.45),transparent_50%)]" />
            <Sprout
              className="absolute bottom-[18%] right-[10%] size-32 text-primary/20 sm:size-44"
              strokeWidth={1}
              aria-hidden
            />
          </div>
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/45 to-on-surface/15"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 z-[1] px-5 pb-6 pt-24 sm:px-8 sm:pb-8 sm:pt-28 lg:px-10 lg:pb-10">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/75">
            {collectionName}
          </p>
          <p className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-white drop-shadow-sm sm:text-4xl">
            {areaName}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/90">
            <span className="flex size-8 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
              <Sprout className="size-4 text-white" strokeWidth={1.75} aria-hidden />
            </span>
            <span>
              <span className="tabular-nums">{plantCount}</span>{" "}
              {plantCount === 1 ? "plant" : "plants"} in this area
            </span>
          </p>
        </div>
        <InlineCoverEdit
          variant="area"
          collectionSlug={collectionSlug}
          areaId={areaId}
          currentUrl={coverImageSignedUrl}
          uploadsEnabled={uploadsEnabled}
        />
      </section>

      <div className="mt-8 space-y-5">
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            {description}
          </p>
        ) : null}
      </div>

      <section className="mt-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold text-on-surface">
              Plants
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-on-surface-variant">
              Plants assigned to this area in{" "}
              <span className="font-medium text-on-surface">{collectionName}</span>.
            </p>
          </div>
          <Link
            href={addPlantHref}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-primary px-5 text-sm font-medium text-on-primary transition hover:bg-primary/90 sm:self-auto"
          >
            <Plus className="size-4" strokeWidth={2.25} aria-hidden />
            Add plant
          </Link>
        </div>

        <div className="mt-8">
          {plants.length === 0 ? (
            <PlantsEmptyState variant="collection" addPlantHref={addPlantHref} />
          ) : (
            <PlantsGrid plants={plants} showCollectionLabel={false} />
          )}
        </div>
      </section>

      <p className="mt-10 text-center text-sm text-on-surface-variant">
        <Link
          href={`/collections/${collectionSlug}`}
          className="font-medium text-primary hover:underline"
        >
          Open collection overview
        </Link>
      </p>
    </div>
  );
}
