"use client";

import Link from "next/link";
import { Filter, Plus, QrCode, Search, Sprout } from "lucide-react";
import type { PlantListItem } from "@/lib/plants/queries";
import { PlantsGrid } from "./plants-grid";
import { PlantsEmptyState } from "./plants-empty-state";
import { PlantsScreenHeader } from "./plants-screen-header";
import { CollectionSectionTabs } from "@/components/collections/collection-section-tabs";

type PlantsPageViewCollection = {
  variant: "collection";
  collectionSlug: string;
  collectionName: string;
  plants: PlantListItem[];
};

type PlantsPageViewAll = {
  variant: "all";
  plants: PlantListItem[];
  /** Primary “Add plant” target (e.g. first collection’s `/plants/new`). */
  addPlantHref: string;
  hasCollections: boolean;
};

export type PlantsPageViewProps = PlantsPageViewCollection | PlantsPageViewAll;

function PlantsToolbar() {
  return (
    <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Plant filters"
      >
        <button
          type="button"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary shadow-sm ring-1 ring-primary/15 transition-[transform,opacity] duration-200"
          aria-current="true"
        >
          All plants
        </button>
        <button
          type="button"
          disabled
          className="rounded-full bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface-variant/50"
          title="Coming soon"
        >
          Needs water
        </button>
        <button
          type="button"
          disabled
          className="rounded-full bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface-variant/50"
          title="Coming soon"
        >
          Propagating
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="flex min-w-[10rem] flex-1 items-center gap-2 rounded-full bg-surface-container-high/80 px-4 py-2 ring-1 ring-outline-variant/15 lg:max-w-xs">
          <Search
            className="size-4 shrink-0 text-on-surface-variant/60"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            type="search"
            disabled
            placeholder="Search plants…"
            aria-label="Search plants (coming soon)"
            className="min-w-0 flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/45 disabled:cursor-not-allowed"
          />
        </div>
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 text-sm font-medium text-on-surface-variant/50 ring-1 ring-outline-variant/15"
          title="Coming soon"
        >
          <Filter className="size-4" strokeWidth={1.75} aria-hidden />
          Filter
        </button>
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 text-sm font-medium text-on-surface-variant/50 ring-1 ring-outline-variant/15"
          title="Coming soon"
        >
          Sort by: Nickname
        </button>
      </div>
    </div>
  );
}

export function PlantsPageView(props: PlantsPageViewProps) {
  const isAll = props.variant === "all";
  const plants = props.plants;

  const eyebrow = isAll ? "All plants" : props.collectionName;
  const description = isAll
    ? "Every plant from collections you belong to, in one place. Open a card to jump to its profile."
    : "Your plants in this collection. Browse, filter, and add new ones from here.";

  const addHref = isAll ? props.addPlantHref : `/collections/${props.collectionSlug}/plants/new`;

  const addButton = (
    <Link
      href={addHref}
      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-primary px-5 text-sm font-medium text-on-primary shadow-sm ring-1 ring-primary/20 transition-[background-color,transform,box-shadow] duration-200 hover:bg-primary/92 active:scale-[0.98] sm:self-auto"
    >
      <Plus className="size-4" strokeWidth={2.25} aria-hidden />
      Add plant
    </Link>
  );

  const emptyState = isAll ? (
    <PlantsEmptyState
      variant="global"
      addPlantHref={props.addPlantHref}
      hasCollections={props.hasCollections}
    />
  ) : (
    <PlantsEmptyState variant="collection" addPlantHref={addHref} />
  );

  const footerTitle = isAll ? "Grow everywhere" : "Grow your collection";
  const footerBody = isAll ? (
    <>
      Pick a collection to add the next plant, or open{" "}
      <Link
        href="/collections"
        className="font-medium text-primary underline-offset-2 hover:underline"
      >
        Collections
      </Link>{" "}
      to manage spaces.
    </>
  ) : (
    <>
      Found a new leafy friend? Add them to{" "}
      <span className="font-medium text-on-surface">{props.collectionName}</span>{" "}
      and start tracking their growth.
    </>
  );

  return (
    <div>
      {!isAll && (
        <CollectionSectionTabs
          collectionSlug={props.collectionSlug}
          className="mb-8"
        />
      )}
      <PlantsScreenHeader
        eyebrow={eyebrow}
        title="Plants"
        description={description}
        actions={addButton}
      />

      <PlantsToolbar />

      <div className="mt-8">
        {plants.length === 0 ? (
          emptyState
        ) : (
          <PlantsGrid plants={plants} showCollectionLabel={isAll} />
        )}
      </div>

      {plants.length > 0 && (
        <section className="mt-12 rounded-3xl bg-surface-container-low/70 px-6 py-10 text-center ring-1 ring-outline-variant/10 sm:px-10">
          <span className="flex justify-center text-primary/35" aria-hidden>
            <Sprout className="size-10" strokeWidth={1.25} />
          </span>
          <h3 className="mt-4 font-display text-lg font-semibold text-on-surface">
            {footerTitle}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
            {footerBody}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={addHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-on-primary transition hover:bg-primary/90"
            >
              <Plus className="size-4" strokeWidth={2.25} aria-hidden />
              Add plant
            </Link>
            <button
              type="button"
              disabled
              className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-surface-container-high px-6 text-sm font-medium text-on-surface-variant/50"
              title="Coming soon"
            >
              <QrCode className="size-4" strokeWidth={1.75} aria-hidden />
              Scan plant tag
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
