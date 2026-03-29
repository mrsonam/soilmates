"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Droplets,
  LayoutDashboard,
  MapPin,
  Sprout,
  Sun,
  Users,
} from "lucide-react";
import { useCollectionPageActions } from "@/components/layout/collection-page-actions";
import { CollectionStatsCards } from "@/components/collection-detail/collection-stats-cards";
import { AreasSection } from "@/components/areas/areas-section";
import { CreateAreaDialog } from "@/components/areas/create-area-dialog";
import { EditAreaDialog } from "@/components/areas/edit-area-dialog";
import { gradientClassForAreaId } from "@/components/areas/area-visuals";
import type { AreaForCollectionDetail } from "@/lib/collections/collection-detail";
import type { PlantListItem } from "@/lib/plants/queries";
import { PlantsPageView } from "@/components/plants/plants-page-view";

const TABS = [
  { id: "overview" as const, label: "Overview", Icon: LayoutDashboard },
  { id: "areas" as const, label: "Areas", Icon: MapPin },
  { id: "plants" as const, label: "Plants", Icon: Sprout },
  { id: "members" as const, label: "Members", Icon: Users },
];

type ActivityRow = {
  id: string;
  title: string;
  meta: string;
  badge: string;
  badgeClass: string;
};

const MOCK_ACTIVITY: ActivityRow[] = [
  {
    id: "1",
    title: "Monstera watered in Living Room",
    meta: "Updated by Alex · 2 hours ago",
    badge: "Routine care",
    badgeClass:
      "bg-surface-container-high text-on-surface-variant ring-1 ring-outline-variant/15",
  },
  {
    id: "2",
    title: "New pothos added to Bedroom",
    meta: "Updated by Sam · Yesterday",
    badge: "New plant",
    badgeClass: "bg-[#f0d4dc]/50 text-[#5c3d45] ring-1 ring-[#e0c4cc]/40",
  },
  {
    id: "3",
    title: "Fiddle leaf rotated for even light",
    meta: "Updated by Alex · 3 days ago",
    badge: "Growth task",
    badgeClass: "bg-[#f2d4b8]/60 text-[#5c4a38] ring-1 ring-[#e8c9a8]/50",
  },
];

type CollectionDetailViewProps = {
  collectionSlug: string;
  name: string;
  description: string | null;
  createdLabel: string;
  memberCount: number;
  plantCount: number;
  areaCount: number;
  areas: AreaForCollectionDetail[];
  plants: PlantListItem[];
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
  plants,
}: CollectionDetailViewProps) {
  const pageActions = useCollectionPageActions();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const [createAreaOpen, setCreateAreaOpen] = useState(false);
  const [editArea, setEditArea] = useState<AreaForCollectionDetail | null>(null);

  const openCreateArea = useCallback(() => setCreateAreaOpen(true), []);

  useEffect(() => {
    pageActions?.registerCreateAreaHandler(openCreateArea);
    return () => pageActions?.registerCreateAreaHandler(null);
  }, [openCreateArea, pageActions]);

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

      <div
        className="flex gap-1 overflow-x-auto border-b border-outline-variant/15 pb-px"
        role="tablist"
        aria-label="Collection sections"
      >
        {TABS.map((t) => {
          const Icon = t.Icon;
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(t.id)}
              className={[
                "flex min-w-0 shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition",
                selected
                  ? "-mb-px border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface",
              ].join(" ")}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" && (
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
                    <button
                      type="button"
                      onClick={() => setTab("areas")}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-surface-container-lowest px-6 text-sm font-medium text-on-surface ring-1 ring-outline-variant/20 transition hover:bg-surface-container-high"
                    >
                      Area reports
                    </button>
                  </div>
                  <p className="mt-6 text-xs text-on-surface-variant/70">
                    {createdLabel}
                    <span className="mx-2 text-on-surface-variant/40">·</span>
                    <span className="font-mono text-on-surface-variant/60">
                      /{collectionSlug}
                    </span>
                  </p>
                </div>
                <div
                  className="relative min-h-[14rem] flex-1 bg-gradient-to-br from-primary-fixed/40 via-surface-container-low to-primary-fixed-dim/50 lg:min-h-0"
                  aria-hidden
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(81,100,71,0.15),transparent_55%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(212,233,196,0.5),transparent_45%)]" />
                  <Sprout
                    className="absolute bottom-6 right-8 size-32 text-primary/25 sm:size-40"
                    strokeWidth={1}
                  />
                  <Sprout
                    className="absolute right-1/4 top-10 size-20 rotate-12 text-primary/20"
                    strokeWidth={1}
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

          <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h3 className="font-display text-lg font-semibold text-on-surface">
                Recent activity
              </h3>
              <Link
                href="/activity"
                className="text-sm font-medium text-primary transition hover:underline"
              >
                View all history
              </Link>
            </div>
            <ul className="mt-6 divide-y divide-outline-variant/10">
              {MOCK_ACTIVITY.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div
                    className="size-12 shrink-0 rounded-full bg-gradient-to-br from-primary-fixed to-primary-fixed-dim ring-2 ring-surface"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-on-surface">
                      {row.title}
                    </p>
                    <p className="mt-0.5 text-xs text-on-surface-variant">
                      {row.meta}
                    </p>
                  </div>
                  <span
                    className={[
                      "w-fit shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide",
                      row.badgeClass,
                    ].join(" ")}
                  >
                    {row.badge}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h3 className="font-display text-lg font-semibold text-on-surface">
                Area snapshots
              </h3>
              <button
                type="button"
                onClick={() => {
                  setTab("areas");
                  openCreateArea();
                }}
                className="text-sm font-medium text-primary transition hover:underline"
              >
                {areas.length === 0 ? "Create an area" : "Manage areas"}
              </button>
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
                        className={`relative aspect-[3/4] bg-gradient-to-b ${gradientClassForAreaId(area.id)}`}
                      >
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
      )}

      {tab === "areas" && (
        <AreasSection
          collectionSlug={collectionSlug}
          areas={areas}
          onCreateClick={openCreateArea}
          onEditArea={setEditArea}
        />
      )}

      {tab === "plants" && (
        <div className="mt-6">
          <PlantsPageView
            variant="collection"
            collectionSlug={collectionSlug}
            collectionName={name}
            plants={plants}
          />
        </div>
      )}

      {tab === "members" && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-on-surface-variant">
            <span className="font-medium text-on-surface">{memberCount}</span>{" "}
            active {memberCount === 1 ? "member" : "members"}. Invites and
            roles will appear here.
          </p>
          <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest/60 p-8 sm:p-10">
            <p className="mx-auto max-w-lg text-center text-sm leading-relaxed text-on-surface-variant">
              Everyone in a collection has equal access for now. You&apos;ll be
              able to invite household members soon.
            </p>
          </div>
        </div>
      )}

      <CreateAreaDialog
        open={createAreaOpen}
        onClose={() => setCreateAreaOpen(false)}
        collectionSlug={collectionSlug}
      />
      <EditAreaDialog
        open={editArea !== null}
        onClose={() => setEditArea(null)}
        collectionSlug={collectionSlug}
        area={editArea}
      />
    </div>
  );
}
