import { Heart, MapPin } from "lucide-react";
import type { PlantDetailModel } from "@/lib/plants/plant-detail";
import { PlantCoverImage } from "@/components/plants/photos/plant-cover-image";
import { PlantLifeStageBadge } from "@/components/plants/plant-life-stage-badge";
import { PlantStatusBadge } from "@/components/plants/plant-status-badge";

type PlantHeroSummaryProps = {
  plant: PlantDetailModel;
};

export function PlantHeroSummary({ plant }: PlantHeroSummaryProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
      <div className="relative">
        <PlantCoverImage imageUrl={plant.heroImageUrl} alt="" />
        {plant.isFavorite ? (
          <span
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-[#c45c5c] text-white shadow-md ring-2 ring-surface/90"
            title="Favorite"
          >
            <Heart className="size-5 fill-white/25" strokeWidth={1.75} aria-hidden />
            <span className="sr-only">Favorite plant</span>
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-5 lg:pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <PlantStatusBadge status={plant.healthStatus} />
          <PlantLifeStageBadge stage={plant.lifeStage} />
          {plant.plantType ? (
            <span className="rounded-full bg-primary-fixed/40 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
              {plant.plantType}
            </span>
          ) : null}
        </div>

        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
            {plant.nickname}
          </h1>
          {plant.referenceCommonName ? (
            <p className="mt-1.5 text-base italic text-on-surface-variant sm:text-lg">
              {plant.referenceCommonName}
            </p>
          ) : null}
        </div>

        <div className="inline-flex max-w-full items-start gap-2 rounded-2xl bg-surface-container-low/80 px-4 py-3 ring-1 ring-outline-variant/10">
          <MapPin
            className="mt-0.5 size-4 shrink-0 text-primary/80"
            strokeWidth={1.75}
            aria-hidden
          />
          <div>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
              Current location
            </p>
            <p className="mt-0.5 text-sm font-medium text-on-surface">
              {plant.area.name}
            </p>
          </div>
        </div>

        {plant.notes?.trim() ? (
          <p className="text-sm italic leading-relaxed text-on-surface-variant">
            {plant.notes.trim()}
          </p>
        ) : null}
      </div>
    </div>
  );
}
