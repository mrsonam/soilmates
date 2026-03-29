"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Plus } from "lucide-react";
import { titleForPath } from "@/lib/layout/nav-config";
import type { CollectionOption } from "./collection-switcher";
import { CollectionsSearchField } from "./collections-search-field";
import { CollectionSearchField } from "./collection-search-field";
import { useCollectionsCreate } from "./collections-create-provider";
import { useCollectionHeaderState } from "./collection-header-context";
import { useCollectionPageActions } from "./collection-page-actions";

type AppHeaderProps = {
  collections: CollectionOption[];
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
};

export function AppHeader({ collections, user }: AppHeaderProps) {
  const pathname = usePathname();
  const baseTitle = titleForPath(pathname);
  const collectionsCreate = useCollectionsCreate();
  const collectionHeaderState = useCollectionHeaderState();
  const collectionPageActions = useCollectionPageActions();

  const slugSegment = pathname.startsWith("/collections/")
    ? pathname.split("/")[2]?.split("/")[0]
    : undefined;
  const isCollectionDetail =
    Boolean(slugSegment && slugSegment !== "choose" && pathname.startsWith("/collections/"));

  const plantsRouteMatch = pathname.match(
    /^\/collections\/([^/]+)\/plants(?:\/([^/]+))?\/?$/,
  );

  let subtitle: string | null = null;
  let title = baseTitle;

  if (pathname === "/collections" || pathname.startsWith("/collections?")) {
    title = "Collections";
    subtitle = "Your shared plant spaces";
  } else if (plantsRouteMatch) {
    const colSlug = plantsRouteMatch[1];
    const plantsSub = plantsRouteMatch[2];
    const col = collections.find((c) => c.slug === colSlug);
    if (col) {
      subtitle = col.name;
      if (!plantsSub) {
        title = "Plants";
      } else if (plantsSub === "new") {
        title = "Add new plant";
      } else {
        title = "Plant";
      }
    }
  } else if (isCollectionDetail) {
    const col = collections.find((c) => c.slug === slugSegment);
    if (col) {
      title = col.name;
      subtitle = "Collection";
    }
  }

  if (pathname === "/dashboard") {
    subtitle = "Overview";
  }

  const display = user.name?.trim() || user.email.split("@")[0] || "Account";
  const isCollectionsList =
    pathname === "/collections" || pathname.startsWith("/collections?");

  const collectionDetailTagline =
    isCollectionDetail && collectionHeaderState.subtitleLine
      ? collectionHeaderState.subtitleLine
      : null;

  const showCenterSearch =
    isCollectionsList ||
    (isCollectionDetail && collectionHeaderState.showCollectionSearch);

  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant/10 bg-surface/90 backdrop-blur-xl">
      <div
        className={[
          "flex flex-col px-4 sm:px-6 lg:px-8",
          isCollectionsList
            ? "gap-3 py-3 sm:py-4"
            : isCollectionDetail
              ? "gap-3 py-3 sm:py-3.5"
              : "min-h-14 justify-center gap-0 py-2 sm:min-h-[3.75rem] sm:py-0",
        ].join(" ")}
      >
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="min-w-0 flex-1">
            {subtitle && (
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                {subtitle}
              </p>
            )}
            <h1 className="truncate font-display text-lg font-semibold tracking-tight text-on-surface sm:text-xl">
              {title}
            </h1>
            {collectionDetailTagline && (
              <p className="mt-0.5 truncate text-sm text-on-surface-variant">
                {collectionDetailTagline}
              </p>
            )}
          </div>

          {showCenterSearch && (
            <div className="mx-2 hidden min-w-0 max-w-xl flex-1 md:block">
              {isCollectionsList ? (
                <CollectionsSearchField />
              ) : (
                <CollectionSearchField />
              )}
            </div>
          )}

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {isCollectionsList && collectionsCreate && (
              <>
                <button
                  type="button"
                  onClick={collectionsCreate.openCreateCollection}
                  className="flex size-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface transition hover:bg-surface-container-highest md:hidden"
                  aria-label="New collection"
                >
                  <Plus className="size-5" strokeWidth={2} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={collectionsCreate.openCreateCollection}
                  className="hidden h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-on-primary transition hover:bg-primary/90 md:inline-flex"
                >
                  <Plus className="size-4" strokeWidth={2} aria-hidden />
                  New collection
                </button>
              </>
            )}

            {isCollectionDetail && collectionPageActions?.hasCreateAreaHandler && (
              <>
                <button
                  type="button"
                  onClick={() => collectionPageActions.openCreateArea()}
                  className="flex size-10 items-center justify-center rounded-full bg-primary-fixed/50 text-primary transition hover:bg-primary-fixed/65 md:hidden"
                  aria-label="Add area"
                >
                  <Plus className="size-5" strokeWidth={2} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => collectionPageActions.openCreateArea()}
                  className="hidden h-10 items-center gap-1.5 rounded-full bg-primary-fixed/45 px-4 text-sm font-medium text-primary transition hover:bg-primary-fixed/60 md:inline-flex"
                >
                  <Plus className="size-4" strokeWidth={2.25} aria-hidden />
                  Add area
                </button>
              </>
            )}

            {isCollectionDetail && (
              <button
                type="button"
                disabled
                title="Coming soon"
                className="hidden h-10 items-center rounded-full bg-surface-container-high/80 px-4 text-sm font-medium text-on-surface-variant/50 lg:inline-flex"
              >
                Invite
              </button>
            )}

            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
              aria-label="Notifications (coming soon)"
            >
              <Bell className="size-[1.35rem]" strokeWidth={1.5} />
            </button>
            <Link
              href="/settings"
              className="flex size-10 items-center justify-center rounded-full bg-surface-container-low text-sm font-semibold text-primary ring-1 ring-outline-variant/10 transition hover:bg-surface-container-high"
              aria-label="Account settings"
            >
              {display.slice(0, 1).toUpperCase()}
            </Link>
          </div>
        </div>

        {isCollectionsList && (
          <div className="md:hidden">
            <CollectionsSearchField />
          </div>
        )}
        {isCollectionDetail && collectionHeaderState.showCollectionSearch && (
          <div className="md:hidden">
            <CollectionSearchField />
          </div>
        )}
      </div>
    </header>
  );
}
