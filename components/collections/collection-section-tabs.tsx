"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Sprout,
  Users,
} from "lucide-react";

export type CollectionSectionTabId =
  | "overview"
  | "areas"
  | "plants"
  | "members";

const TABS: {
  id: CollectionSectionTabId;
  label: string;
  Icon: typeof LayoutDashboard;
  href: (slug: string) => string;
}[] = [
  {
    id: "overview",
    label: "Overview",
    Icon: LayoutDashboard,
    href: (slug) => `/collections/${slug}`,
  },
  {
    id: "areas",
    label: "Areas",
    Icon: MapPin,
    href: (slug) => `/collections/${slug}/areas`,
  },
  {
    id: "plants",
    label: "Plants",
    Icon: Sprout,
    href: (slug) => `/collections/${slug}/plants`,
  },
  {
    id: "members",
    label: "Members",
    Icon: Users,
    href: (slug) => `/collections/${slug}/members`,
  },
];

export function activeCollectionSectionTab(
  collectionSlug: string,
  pathname: string,
): CollectionSectionTabId {
  const base = `/collections/${collectionSlug}`;

  if (pathname.startsWith(`${base}/plants`)) {
    return "plants";
  }
  if (pathname.startsWith(`${base}/areas`)) {
    return "areas";
  }
  if (pathname.startsWith(`${base}/members`)) {
    return "members";
  }
  if (pathname === base) {
    return "overview";
  }
  return "overview";
}

type CollectionSectionTabsProps = {
  collectionSlug: string;
  className?: string;
};

export function CollectionSectionTabs({
  collectionSlug,
  className = "",
}: CollectionSectionTabsProps) {
  const pathname = usePathname();
  const active = activeCollectionSectionTab(collectionSlug, pathname);

  return (
    <div
      className={[
        "flex gap-1 overflow-x-auto border-b border-outline-variant/15 pb-px",
        className,
      ].join(" ")}
      role="tablist"
      aria-label="Collection sections"
    >
      {TABS.map((t) => {
        const Icon = t.Icon;
        const selected = active === t.id;
        return (
          <Link
            key={t.id}
            href={t.href(collectionSlug)}
            role="tab"
            aria-selected={selected}
            className={[
              "flex min-w-0 shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition",
              selected
                ? "-mb-px border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface",
            ].join(" ")}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
