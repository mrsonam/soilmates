"use client";

import Link from "next/link";
import { Calendar, Droplets, Sprout, Sun } from "lucide-react";
import { CollectionStatsCards } from "@/components/collection-detail/collection-stats-cards";
import { gradientClassForAreaId } from "@/components/areas/area-visuals";
import type { AreaForCollectionDetail } from "@/lib/collections/collection-detail";
import { InlineCoverEdit } from "@/components/collections/inline-cover-edit";
import { CollectionSectionTabs } from "@/components/collections/collection-section-tabs";
import type { ActivityFeedItem } from "@/lib/activity/queries";
import { CollectionActivityPreview } from "@/components/activity/collection-activity-preview";
import { CollectionMembersPreview } from "@/components/members/collection-members-preview";

type CollectionDetailViewProps = {
  collectionSlug: string;
  name: string;
  description: string | null;
  createdLabel: string;
  memberCount: number;
  plantCount: number;
  areaCount: number;
  areas: AreaForCollectionDetail[];
  collectionCoverUrl: string | null;
  uploadsEnabled: boolean;
  activityPreview: ActivityFeedItem[];
};

export function CollectionDetailView({
  collectionSlug,
  name,
  description,
  createdLabel,
  memberCount,
  plantCount,
  areaCount,
  areas,
  collectionCoverUrl,
  uploadsEnabled,
  activityPreview,
}: CollectionDetailViewProps) {
  const showLiveMetrics = plantCount > 0;
  const heroBadge = showLiveMetrics ? "Collection thriving" : "Getting started";
  const heroTitle = showLiveMetrics
    ? `Your ${name.toLowerCase()} ecosystem is in peak condition.`
    : `Welcome to ${name}`;
  const heroBody = showLiveMetrics
    ? "Humidity is stable and watering is on track. Keep an eye on light shifts as the season changes."
    : description?.trim() ||
      "Add plants and areas to unlock hydration, light, and care insights for this shared space.";

  return (
    <div>
      {description ? (
        <p className="mb-6 text-sm leading-relaxed text-on-surface-variant lg:max-w-3xl">
          {description}
        </p>
      ) : null}

      <CollectionSectionTabs collectionSlug={collectionSlug} />

      <div className="mt-6 space-y-8 sm:space-y-10">
          <CollectionStatsCards
            areaCount={areaCount}
            plantCount={plantCount}
            memberCount={memberCount}
          />

          {!showLiveMetrics && (
            <p className="text-center text-xs text-on-surface-variant/80">
              Sample metrics below show how your dashboard will look once plants
              and sensors are connected.
            </p>
          )}

          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="overflow-hidden rounded-3xl bg-surface-container-low ring-1 ring-outline-variant/[0.08] lg:col-span-2">
              <div className="flex flex-col lg:min-h-[20rem] lg:flex-row">
                <div className="flex flex-1 flex-col justify-center p-6 sm:p-8 lg:max-w-[55%]">
                  <span className="inline-flex w-fit items-center rounded-full bg-primary-fixed/50 px-3 py-1 text-xs font-semibold text-primary">
                    {heroBadge}
                  </span>
                  <h2 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-on-surface sm:text-3xl">
                    {heroTitle}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                    {heroBody}
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                      href="/activity"
                      className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-on-primary transition hover:bg-primary/90"
                    >
                      View watering schedule
                    </Link>
                    <Link
                      href={`/collections/${collectionSlug}/areas`}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-surface-container-lowest px-6 text-sm font-medium text-on-surface ring-1 ring-outline-variant/20 transition hover:bg-surface-container-high"
                    >
                      Area reports
                    </Link>
                  </div>
                  <p className="mt-6 text-xs text-on-surface-variant/70">
                    {createdLabel}
                    <span className="mx-2 text-on-surface-variant/40">·</span>
                    <span className="font-mono text-on-surface-variant/60">
                      /{collectionSlug}
                    </span>
                  </p>
                </div>
                <div className="relative min-h-[14rem] flex-1 overflow-hidden lg:min-h-0">
                  {collectionCoverUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element -- signed URL */}
                      <img
                        src={collectionCoverUrl}
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-surface-container-low/95 via-surface-container-low/40 to-transparent"
                        aria-hidden
                      />
                    </>
                  ) : (
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-primary-fixed/40 via-surface-container-low to-primary-fixed-dim/50"
                      aria-hidden
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(81,100,71,0.15),transparent_55%)]" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(212,233,196,0.5),transparent_45%)]" />
                      <Sprout
                        className="absolute bottom-6 right-8 size-32 text-primary/25 sm:size-40"
                        strokeWidth={1}
                        aria-hidden
                      />
                      <Sprout
                        className="absolute right-1/4 top-10 size-20 rotate-12 text-primary/20"
                        strokeWidth={1}
                        aria-hidden
                      />
                    </div>
                  )}
                  <InlineCoverEdit
                    variant="collection"
                    collectionSlug={collectionSlug}
                    currentUrl={collectionCoverUrl}
                    uploadsEnabled={uploadsEnabled}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-3xl bg-surface-container-lowest p-5 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
                      Hydration
                    </p>
                    <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-on-surface">
                      {showLiveMetrics ? "94%" : "—"}
                    </p>
                  </div>
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Droplets className="size-5" strokeWidth={1.75} aria-hidden />
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-container-high">
                  <div
                    className="h-full rounded-full bg-primary/80"
                    style={{ width: showLiveMetrics ? "94%" : "12%" }}
                  />
                </div>
                <p className="mt-2 text-xs text-on-surface-variant">
                  {showLiveMetrics
                    ? "Optimal level reached"
                    : "Connect plants to track moisture"}
                </p>
              </div>

              <div className="rounded-3xl bg-surface-container-lowest p-5 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
                      Light exp.
                    </p>
                    <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-on-surface">
                      {showLiveMetrics ? "6.2" : "—"}
                      {showLiveMetrics && (
                        <span className="text-lg font-medium text-on-surface-variant">
                          {" "}
                          hrs/avg
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-[#f2d4b8]/50 text-[#7a5c38]">
                    <Sun className="size-5" strokeWidth={1.75} aria-hidden />
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-container-high">
                  <div
                    className="h-full rounded-full bg-[#d4a574]/90"
                    style={{ width: showLiveMetrics ? "72%" : "8%" }}
                  />
                </div>
                <p className="mt-2 text-xs text-on-surface-variant">
                  {showLiveMetrics
                    ? "Daily sunlight exposure"
                    : "Light estimates from plant placement"}
                </p>
              </div>

              <div className="rounded-3xl bg-primary p-5 text-on-primary shadow-(--shadow-ambient)">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-primary/80">
                  Next action
                </p>
                <div className="mt-3 flex items-start gap-3">
                  <Calendar
                    className="size-5 shrink-0 text-on-primary/90"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <div>
                    <p className="font-display text-lg font-semibold leading-snug">
                      {showLiveMetrics
                        ? "Fertilize ferns"
                        : "Set up your first plant"}
                    </p>
                    <p className="mt-1 text-xs text-on-primary/85">
                      {showLiveMetrics
                        ? "Due this week in Living Room"
                        : "Then care reminders will appear here"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <CollectionMembersPreview
              collectionSlug={collectionSlug}
              memberCount={memberCount}
            />
          </div>

          <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h3 className="font-display text-lg font-semibold text-on-surface">
                Recent activity
              </h3>
              <Link
                href={`/collections/${collectionSlug}/activity`}
                className="text-sm font-medium text-primary transition hover:underline"
              >
                View all activity
              </Link>
            </div>
            <div className="mt-6">
              <CollectionActivityPreview
                collectionSlug={collectionSlug}
                items={activityPreview}
              />
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h3 className="font-display text-lg font-semibold text-on-surface">
                Area snapshots
              </h3>
              <Link
                href={
                  areas.length === 0
                    ? `/collections/${collectionSlug}/areas?create=1`
                    : `/collections/${collectionSlug}/areas`
                }
                className="text-sm font-medium text-primary transition hover:underline"
              >
                {areas.length === 0 ? "Create an area" : "Manage areas"}
              </Link>
            </div>
            {areas.length === 0 ? (
              <p className="mt-4 rounded-3xl bg-surface-container-low/50 px-6 py-10 text-center text-sm text-on-surface-variant ring-1 ring-outline-variant/10">
                No areas yet. Add a living room, balcony, or shelf so plants
                have a home in this collection.
              </p>
            ) : (
              <ul className="mt-5 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
                {areas.map((area) => (
                  <li
                    key={area.id}
                    className="w-[min(100%,280px)] shrink-0 sm:w-auto"
                  >
                    <Link
                      href={`/collections/${collectionSlug}/areas/${area.slug}`}
                      className="group block overflow-hidden rounded-3xl ring-1 ring-outline-variant/[0.08] transition hover:ring-primary/20"
                    >
                      <div
                        className={`relative aspect-[3/4] overflow-hidden bg-gradient-to-b ${gradientClassForAreaId(area.id)}`}
                      >
                        {area.coverImageSignedUrl ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element -- signed URL */}
                            <img
                              src={area.coverImageSignedUrl}
                              alt=""
                              className="absolute inset-0 size-full object-cover"
                            />
                          </>
                        ) : null}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-on-surface/75 via-on-surface/35 to-transparent px-4 pb-4 pt-16">
                          <p className="font-display text-lg font-semibold text-surface">
                            {area.name}
                          </p>
                          <p className="mt-1 text-xs text-surface/90">
                            {area.plantCount}{" "}
                            {area.plantCount === 1 ? "plant" : "plants"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="text-center">
            <Link
              href="/collections"
              className="text-sm font-medium text-primary transition hover:underline"
            >
              All collections
            </Link>
          </p>
        </div>
    </div>
  );
}
