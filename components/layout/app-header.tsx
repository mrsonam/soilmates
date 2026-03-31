"use client";

import { usePathname } from "next/navigation";
import { titleForPath } from "@/lib/layout/nav-config";
import type { CollectionOption } from "./collection-switcher";
import { useCollectionHeaderState } from "./collection-header-context";

type AppHeaderProps = {
  collections: CollectionOption[];
};

export function AppHeader({ collections }: AppHeaderProps) {
  const pathname = usePathname();
  const baseTitle = titleForPath(pathname);
  const collectionHeaderState = useCollectionHeaderState();

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
    subtitle = null;
    title = "Dashboard";
  }

  const areaHeader = collectionHeaderState.areaHeader;

  const collectionDetailTagline =
    !areaHeader &&
    isCollectionDetail &&
    collectionHeaderState.subtitleLine
      ? collectionHeaderState.subtitleLine
      : null;

  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant/10 bg-surface/90 backdrop-blur-xl">
      <div className="flex min-h-14 justify-center px-4 py-2 sm:min-h-[3.75rem] sm:px-6 sm:py-0 lg:px-8">
        <div className="flex w-full items-center gap-3 lg:gap-4">
          <div className="min-w-0 flex-1">
            {areaHeader ? (
              <>
                <p className="text-sm text-on-surface-variant">{areaHeader.eyebrow}</p>
                <h1 className="truncate font-display text-lg font-semibold tracking-tight text-on-surface sm:text-xl">
                  {areaHeader.title}
                </h1>
                {areaHeader.tagline ? (
                  <p className="mt-0.5 line-clamp-2 text-sm text-on-surface-variant">
                    {areaHeader.tagline}
                  </p>
                ) : null}
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
