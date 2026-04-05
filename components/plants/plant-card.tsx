"use client";

import { memo } from "react";
import { IntentPrefetchLink } from "@/components/navigation/intent-prefetch-link";
import { Armchair } from "lucide-react";
import type { PlantListItem } from "@/lib/plants/queries";
import { PlantLifeStageBadge } from "./plant-life-stage-badge";
import { PlantStatusBadge } from "./plant-status-badge";
import { PlantImagePlaceholder } from "./plant-image-placeholder";
import { PlantFavoriteToggle } from "@/components/plants/detail/plant-favorite-toggle";

type PlantCardProps = {
  plant: PlantListItem;
  /** When true, show owning collection under the area line (all-plants catalog). */
  showCollectionLabel?: boolean;
  /** First visible cards use eager decode for LCP; defer the rest. */
  imageLoading?: "eager" | "lazy";
};

function PlantCardInner({
  plant,
  showCollectionLabel,
  imageLoading = "eager",
}: PlantCardProps) {
  const href = `/collections/${plant.collection.slug}/plants/${plant.slug}`;
  const progress = plant.growthProgressPercent ?? 0;

  return (
    <IntentPrefetchLink
      href={href}
      className="group block overflow-hidden rounded-3xl bg-surface-container-lowest shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-16px_rgba(27,28,26,0.1)] hover:ring-primary/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
    >
      <div className="relative">
        {plant.coverImageUrl ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-low">
            {/* eslint-disable-next-line @next/next/no-img-element -- signed or legacy URL */}
            <img
              src={plant.coverImageUrl}
              alt=""
              loading={imageLoading}
              decoding="async"
              className="absolute inset-0 size-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          </div>
        ) : (
          <PlantImagePlaceholder className="aspect-[4/3]" />
        )}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <PlantFavoriteToggle
            collectionSlug={plant.collection.slug}
            plantSlug={plant.slug}
            initialFavorite={plant.isFavorite}
            variant="card"
          />
          <PlantLifeStageBadge stage={plant.lifeStage} />
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg font-semibold tracking-tight text-on-surface group-hover:text-primary">
          {plant.nickname}
        </h3>
        {plant.referenceCommonName ? (
          <p className="mt-0.5 text-sm italic text-on-surface-variant">
            {plant.referenceCommonName}
          </p>
        ) : plant.plantType ? (
          <p className="mt-0.5 text-sm text-on-surface-variant">{plant.plantType}</p>
        ) : null}

        <div className="mt-3">
          <PlantStatusBadge status={plant.healthStatus} />
        </div>

        <p className="mt-4 flex items-center gap-2 text-sm text-on-surface-variant">
          <Armchair className="size-4 shrink-0 text-primary/70" strokeWidth={1.75} aria-hidden />
          <span className="truncate">{plant.area.name}</span>
        </p>
        {showCollectionLabel ? (
          <p className="mt-2 truncate text-xs font-medium text-on-surface-variant/90">
            {plant.collection.name}
          </p>
        ) : null}

        <div className="mt-4">
          <p className="text-[0.6rem] font-semibold uppercase tracking-wide text-on-surface-variant">
            Growth progress
          </p>
          <div className="mt-1.5 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full rounded-full bg-primary/85 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-display text-sm font-semibold tabular-nums text-on-surface">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </IntentPrefetchLink>
  );
}

export const PlantCard = memo(PlantCardInner);
