import type { ReactNode } from "react";
import Link from "next/link";
import { FolderKanban, MapPin } from "lucide-react";
import type { PlantDetailModel } from "@/lib/plants/plant-detail";
import { formatShortDate } from "@/lib/format";
import {
  labelAcquisitionType,
  labelLifeStage,
} from "@/lib/plants/display-labels";
import { PlantStatusBadge } from "@/components/plants/plant-status-badge";
import { PlantReferencePanel } from "./plant-reference-panel";

type PlantOverviewPanelProps = {
  plant: PlantDetailModel;
  collectionSlug: string;
};

function MetaBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium text-on-surface">{children}</div>
    </div>
  );
}

export function PlantOverviewPanel({
  plant,
  collectionSlug,
}: PlantOverviewPanelProps) {
  const created = formatShortDate(plant.createdAt);
  const acquired =
    plant.acquiredAt != null ? formatShortDate(plant.acquiredAt) : null;
  const seedLabel =
    plant.acquisitionType === "seed" ? "Seeded" : "Acquired";

  return (
    <div className="space-y-6">
      <PlantReferencePanel reference={plant.referenceSnapshot} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-surface-container-lowest p-5 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:p-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
            Plant vitality
          </p>
          <dl className="mt-4 space-y-4">
            <MetaBlock label="Nickname">{plant.nickname}</MetaBlock>
            {plant.referenceCommonName ? (
              <MetaBlock label="Reference name">
                <span className="italic font-normal text-on-surface-variant">
                  {plant.referenceCommonName}
                </span>
              </MetaBlock>
            ) : null}
            <MetaBlock label="Type">
              {plant.plantType ?? (
                <span className="font-normal text-on-surface-variant">
                  Not set
                </span>
              )}
            </MetaBlock>
            <MetaBlock label="Life stage">
              {labelLifeStage(plant.lifeStage)}
            </MetaBlock>
            <MetaBlock label="Health (your view)">
              <PlantStatusBadge status={plant.healthStatus} />
            </MetaBlock>
            {plant.aiHealthStatus ? (
              <MetaBlock label="AI assessment">
                <span className="text-on-surface-variant">
                  Last structured review suggests:{" "}
                  <span className="font-medium text-on-surface">
                    {plant.aiHealthStatus.replace("_", " ")}
                  </span>
                  . You can override your own health label anytime.
                </span>
              </MetaBlock>
            ) : null}
          </dl>
        </div>

        <div className="rounded-3xl bg-surface-container-lowest p-5 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:p-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
            Timeline
          </p>
          <div className="relative mt-4 border-l border-outline-variant/20 pl-5">
            <div className="space-y-5">
              <div className="relative">
                <span className="absolute -left-[1.4rem] top-1.5 size-2 rounded-full bg-primary/70 ring-4 ring-surface-container-lowest" />
                <MetaBlock label={seedLabel}>
                  {acquired ?? (
                    <span className="font-normal text-on-surface-variant">
                      Not recorded
                    </span>
                  )}
                </MetaBlock>
              </div>
              <div className="relative">
                <span className="absolute -left-[1.4rem] top-1.5 size-2 rounded-full bg-outline-variant/40 ring-4 ring-surface-container-lowest" />
                <MetaBlock label="Source">
                  {labelAcquisitionType(plant.acquisitionType)}
                </MetaBlock>
              </div>
              <div className="relative">
                <span className="absolute -left-[1.4rem] top-1.5 size-2 rounded-full bg-outline-variant/40 ring-4 ring-surface-container-lowest" />
                <MetaBlock label="Added to app">{created}</MetaBlock>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-surface-container-lowest p-5 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:p-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
            Location
          </p>
          <div className="mt-4 space-y-5">
            <div className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FolderKanban className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <MetaBlock label="Collection">
                {plant.collection.name}
              </MetaBlock>
            </div>
            <div className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed/40 text-primary">
                <MapPin className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <MetaBlock label="Primary area">{plant.area.name}</MetaBlock>
            </div>
            <Link
              href={`/collections/${collectionSlug}`}
              className="inline-flex text-sm font-medium text-primary transition hover:underline"
            >
              Manage collection →
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-surface-container-lowest p-5 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:p-6">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
          Notes
        </p>
        {plant.notes?.trim() ? (
          <p className="mt-3 text-sm leading-relaxed text-on-surface">
            {plant.notes.trim()}
          </p>
        ) : (
          <p className="mt-3 text-sm italic leading-relaxed text-on-surface-variant">
            No notes yet. Edit the plant profile anytime to capture care quirks,
            light preferences, or reminders for your household.
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-primary-fixed/25 px-5 py-5 ring-1 ring-primary/15 sm:px-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
            Care activity
          </p>
          <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-on-surface">
            {plant.counts.careLogs}
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            {plant.counts.careLogs === 0
              ? "No care activity logged yet. Use quick actions above to start."
              : "Log entries recorded for this plant."}
          </p>
        </div>
        <div className="rounded-3xl bg-surface-container-high/50 px-5 py-5 ring-1 ring-outline-variant/10 sm:px-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
            Gallery & more
          </p>
          <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
            <li className="flex flex-wrap items-baseline gap-x-2">
              <span>Photos:</span>
              <span className="font-medium text-on-surface">
                {plant.counts.photos}
              </span>
              {plant.counts.photos > 0 ? (
                <Link
                  href={`/collections/${collectionSlug}/plants/${plant.slug}/photos`}
                  className="text-primary hover:underline"
                >
                  View gallery
                </Link>
              ) : null}
            </li>
            <li className="flex flex-wrap items-baseline gap-x-2">
              <span>Reminders:</span>
              <span className="font-medium text-on-surface">
                {plant.counts.reminders}
              </span>
              <Link
                href={`/collections/${collectionSlug}/plants/${plant.slug}?tab=reminders`}
                className="text-primary hover:underline"
              >
                {plant.counts.reminders === 0 ? "Add" : "Manage"}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
